/**
 * File Handler
 * 파일 업로드, 읽기, 분류 처리
 * PDF.js, SheetJS, mammoth.js 사용
 */

// DateHelper fallback (config.js에서 이미 선언된 경우 재선언하지 않음)
if (!window.DateHelper) {
    window.DateHelper = {
        formatYYMMDD_hhmmss: () => {
            const now = new Date();
            return now.toISOString().replace(/[-:T]/g, '').substring(0, 14);
        },
        formatISO: () => new Date().toISOString()
    };
}

// RAW ID 정의
const RAW_ID_DEFINITIONS = {
    'RAW1': '최신첨부문서',
    'RAW2.1': '용법용량',
    'RAW2.2': '효능효과',
    'RAW2.3': '사용상의주의사항',
    'RAW2.6': '보고서작성지침사용상의주의사항',
    'RAW3': '시판후sales데이터',
    'RAW4': '허가현황',
    'RAW5.1': '안전성조치허가메일',
    'RAW6.1': '안전성조치허가메일_취합본',
    'RAW7.1': '안전성정보변경_복수항목',
    'RAW7.2': '안전성정보변경',
    'RAW7.3': '안전성정보변경_용법용량',
    'RAW7.4': '안전성정보변경_표현식복수항목',
    'RAW8': '임상노출데이터',
    'RAW9': '문헌자료',
    'RAW12': '국외신속보고LineListing',
    'RAW13': '국내신속보고LineListing',
    'RAW14': '원시자료LineListing',
    'RAW15': '정기보고LineListing'
};

// 파일명 기반 RAW ID 자동 매칭 규칙 (더 구체적인 패턴이 먼저 와야 함)
const RAW_ID_PATTERNS = [
    // RAW12-15는 RAW1보다 먼저 매칭되어야 함
    { pattern: /raw12|국외.*신속|foreign.*expedited/i, rawId: 'RAW12' },
    { pattern: /raw13|국내.*신속|domestic.*expedited/i, rawId: 'RAW13' },
    { pattern: /raw14|원시자료/i, rawId: 'RAW14' },
    { pattern: /raw15|정기보고|periodic/i, rawId: 'RAW15' },
    // RAW2.x는 RAW2보다 먼저
    { pattern: /raw2\.?1|용법용량/i, rawId: 'RAW2.1' },
    { pattern: /raw2\.?2|효능효과/i, rawId: 'RAW2.2' },
    { pattern: /raw2\.?3|사용상.*주의|주의사항/i, rawId: 'RAW2.3' },
    { pattern: /raw2\.?6|보고.*시작.*시점/i, rawId: 'RAW2.6' },
    // RAW5-8
    { pattern: /raw5|안전성.*조치.*메일/i, rawId: 'RAW5.1' },
    { pattern: /raw6|안전성.*조치.*취합/i, rawId: 'RAW6.1' },
    { pattern: /raw7|안전성.*정보.*변경/i, rawId: 'RAW7.1' },
    { pattern: /raw8|임상.*노출|clinical.*exposure/i, rawId: 'RAW8' },
    { pattern: /raw9|문헌|literature/i, rawId: 'RAW9' },
    // 일반 패턴들
    { pattern: /raw1[^0-9]|raw1$|첨부문서|label/i, rawId: 'RAW1' },
    { pattern: /raw3|sales|판매/i, rawId: 'RAW3' },
    { pattern: /raw4|허가현황|license/i, rawId: 'RAW4' }
];

class FileHandler {
    constructor() {
        this.uploadedFiles = [];
        this.classifiedFiles = [];
        this.fileMatchingTable = [];
    }

    /**
     * 파일 읽기 (텍스트 추출)
     */
    async readFile(file) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        try {
            // PDF 파일
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                return await this.readPDF(file);
            }

            // Excel 파일
            if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                return await this.readExcel(file);
            }

            // Word 파일
            if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
                return await this.readWord(file);
            }

            // 텍스트 파일
            if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
                return await this.readText(file);
            }

            throw new Error(`지원하지 않는 파일 형식: ${fileType}`);

        } catch (error) {
            console.error(`❌ File read failed (${file.name}):`, error.message);
            throw error;
        }
    }

    /**
     * 텍스트 파일 읽기
     */
    async readText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve({
                    text: e.target.result,
                    fileName: file.name,
                    fileType: 'text'
                });
            };

            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * PDF 파일 읽기 (PDF.js 텍스트 추출 → 품질 검증 → OCR fallback)
     *
     * 처리 순서:
     * 1. PDF.js로 텍스트 추출 시도
     * 2. 추출된 텍스트 품질 검증 (길이 + 한글 비율)
     * 3. 품질 불충분 시 OCR 시도 (Tesseract.js)
     * 4. 최종 결과 반환
     */
    async readPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        let pdf = null;
        let extractedText = '';
        let pageCount = 0;

        // Step 1: PDF.js 텍스트 추출 시도
        if (typeof pdfjsLib !== 'undefined') {
            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                // CMap 설정 (한글 폰트 지원)
                pdf = await pdfjsLib.getDocument({
                    data: arrayBuffer,
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                    cMapPacked: true
                }).promise;

                pageCount = pdf.numPages;
                console.log(`📄 PDF loaded: ${file.name} (${pageCount} pages)`);

                for (let i = 1; i <= pageCount; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    extractedText += pageText + '\n\n';
                }

            } catch (pdfError) {
                console.warn(`⚠️ PDF.js parsing error: ${pdfError.message}`);
            }
        }

        // Step 2: 텍스트 품질 검증
        const textQuality = this.evaluateTextQuality(extractedText);
        console.log(`📊 Text quality: ${textQuality.score}/100 (length: ${textQuality.length}, korean: ${textQuality.koreanRatio}%)`);

        // Step 3: 품질이 충분하면 텍스트 반환
        if (textQuality.score >= 60) {
            console.log(`✅ PDF text extraction successful: ${file.name}`);
            return {
                text: extractedText,
                fileName: file.name,
                fileType: 'pdf',
                pageCount: pageCount,
                method: 'text',
                quality: textQuality.score
            };
        }

        // Step 4: 품질 부족 시 OCR 시도
        console.log(`⚠️ Text quality insufficient (${textQuality.score}/100), trying OCR...`);

        if (typeof Tesseract !== 'undefined' && pdf) {
            try {
                console.log(`🔍 Starting OCR for: ${file.name}`);
                let ocrText = '';

                for (let i = 1; i <= pageCount; i++) {
                    console.log(`🔄 OCR page ${i}/${pageCount}...`);
                    const page = await pdf.getPage(i);

                    // 페이지를 캔버스로 렌더링 (고해상도)
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    // Tesseract OCR 수행
                    const result = await Tesseract.recognize(canvas, 'kor+eng', {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                console.log(`📝 OCR page ${i}: ${Math.round(m.progress * 100)}%`);
                            }
                        }
                    });

                    ocrText += `\n--- Page ${i} ---\n`;
                    ocrText += result.data.text.trim();
                    ocrText += '\n';

                    // 캔버스 메모리 해제
                    canvas.width = 0;
                    canvas.height = 0;
                }

                // OCR 결과 품질 검증
                const ocrQuality = this.evaluateTextQuality(ocrText);
                console.log(`📊 OCR quality: ${ocrQuality.score}/100`);

                // OCR이 더 좋으면 OCR 결과 사용
                if (ocrQuality.score > textQuality.score) {
                    console.log(`✅ OCR complete (better quality): ${file.name}`);
                    return {
                        text: ocrText.trim(),
                        fileName: file.name,
                        fileType: 'pdf',
                        pageCount: pageCount,
                        method: 'ocr',
                        quality: ocrQuality.score
                    };
                }

            } catch (ocrError) {
                console.error(`❌ OCR failed: ${ocrError.message}`);
            }
        } else if (typeof Tesseract === 'undefined') {
            console.warn('⚠️ Tesseract.js not loaded - OCR unavailable');
        } else if (!pdf) {
            console.warn('⚠️ PDF not loaded - OCR unavailable');
        }

        // Step 5: 최선의 결과 반환 (텍스트 추출 결과라도 반환)
        if (extractedText.trim().length > 0) {
            console.log(`⚠️ Returning low-quality text extraction: ${file.name}`);
            return {
                text: extractedText,
                fileName: file.name,
                fileType: 'pdf',
                pageCount: pageCount,
                method: 'text-lowquality',
                quality: textQuality.score
            };
        }

        // 완전 실패
        console.error(`❌ PDF text extraction failed: ${file.name}`);
        return {
            text: `[PDF 파일: ${file.name}] - 텍스트 추출 실패. 이미지 기반 PDF이거나 손상된 파일일 수 있습니다.`,
            fileName: file.name,
            fileType: 'pdf',
            pageCount: pageCount,
            method: 'failed',
            quality: 0
        };
    }

    /**
     * 텍스트 품질 평가 (0-100 점수)
     * - 길이, 한글 비율, 의미있는 문자 비율 기반
     */
    evaluateTextQuality(text) {
        if (!text || text.trim().length === 0) {
            return { score: 0, length: 0, koreanRatio: 0 };
        }

        const cleanText = text.trim();
        const length = cleanText.length;

        // 한글 문자 비율 계산
        const koreanChars = (cleanText.match(/[가-힣]/g) || []).length;
        const koreanRatio = Math.round((koreanChars / length) * 100);

        // 영문/숫자 비율 계산
        const alphaNumChars = (cleanText.match(/[a-zA-Z0-9]/g) || []).length;
        const alphaNumRatio = Math.round((alphaNumChars / length) * 100);

        // 의미있는 문자 비율 (한글 + 영문/숫자 + 공백 + 구두점)
        const meaningfulChars = (cleanText.match(/[가-힣a-zA-Z0-9\s.,!?;:'"()-]/g) || []).length;
        const meaningfulRatio = Math.round((meaningfulChars / length) * 100);

        // 점수 계산
        let score = 0;

        // 길이 점수 (최대 30점)
        if (length >= 500) score += 30;
        else if (length >= 200) score += 20;
        else if (length >= 100) score += 15;
        else if (length >= 50) score += 10;
        else score += Math.round(length / 5);

        // 한글/영문 비율 점수 (최대 40점)
        const languageRatio = koreanRatio + alphaNumRatio;
        if (languageRatio >= 60) score += 40;
        else if (languageRatio >= 40) score += 30;
        else if (languageRatio >= 20) score += 20;
        else score += Math.round(languageRatio / 2);

        // 의미있는 문자 비율 점수 (최대 30점)
        if (meaningfulRatio >= 80) score += 30;
        else if (meaningfulRatio >= 60) score += 20;
        else if (meaningfulRatio >= 40) score += 10;
        else score += Math.round(meaningfulRatio / 4);

        return {
            score: Math.min(100, score),
            length: length,
            koreanRatio: koreanRatio,
            alphaNumRatio: alphaNumRatio,
            meaningfulRatio: meaningfulRatio
        };
    }

    /**
     * Excel 파일 읽기 (SheetJS 사용)
     */
    async readExcel(file) {
        const arrayBuffer = await file.arrayBuffer();

        // SheetJS (XLSX)가 로드되었는지 확인
        if (typeof XLSX !== 'undefined') {
            try {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                let fullText = '';
                let sheets = {};

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];

                    // 마크다운 테이블 형식으로 변환
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (jsonData.length > 0) {
                        fullText += `## Sheet: ${sheetName}\n\n`;

                        // 헤더 행
                        const headers = jsonData[0] || [];
                        fullText += '| ' + headers.join(' | ') + ' |\n';
                        fullText += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

                        // 데이터 행
                        for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i] || [];
                            fullText += '| ' + row.join(' | ') + ' |\n';
                        }
                        fullText += '\n\n';

                        sheets[sheetName] = jsonData;
                    }
                });

                return {
                    text: fullText,
                    fileName: file.name,
                    fileType: 'excel',
                    sheets: sheets,
                    sheetNames: workbook.SheetNames
                };
            } catch (xlsxError) {
                console.warn('Excel parsing error:', xlsxError.message);
            }
        }

        console.warn('⚠️ XLSX not loaded, returning placeholder');
        return {
            text: `[Excel 파일: ${file.name}]`,
            fileName: file.name,
            fileType: 'excel',
            arrayBuffer: arrayBuffer
        };
    }

    /**
     * Word 파일 읽기 (mammoth.js 사용)
     */
    async readWord(file) {
        const arrayBuffer = await file.arrayBuffer();

        // mammoth.js가 로드되었는지 확인
        if (typeof mammoth !== 'undefined') {
            try {
                const result = await mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer });

                return {
                    text: result.value,
                    fileName: file.name,
                    fileType: 'word',
                    warnings: result.messages
                };
            } catch (mammothError) {
                console.warn('Word parsing error:', mammothError.message);
            }
        }

        console.warn('⚠️ mammoth.js not loaded, returning placeholder');
        return {
            text: `[Word 파일: ${file.name}]`,
            fileName: file.name,
            fileType: 'word',
            arrayBuffer: arrayBuffer
        };
    }

    /**
     * 파일 분류 (RAW ID 태깅)
     * 파일명 기반 규칙 매칭 + LLM 보조 분류
     */
    async classifyFile(file) {
        console.log(`🔍 Classifying file: ${file.name}`);

        try {
            // 1. 파일명 기반 규칙 매칭 (빠름)
            const ruleMatch = this.matchByFilename(file.name);
            if (ruleMatch) {
                const classification = {
                    file: file,
                    fileName: file.name,
                    fileSize: file.size,
                    rawId: ruleMatch,
                    rawIdName: RAW_ID_DEFINITIONS[ruleMatch],
                    needsUserInput: false,
                    method: 'rule-based',
                    classifiedAt: DateHelper.formatISO()
                };

                this.classifiedFiles.push(classification);
                console.log(`✅ File classified (rule): ${file.name} → ${ruleMatch}`);
                return classification;
            }

            // 2. 파일 내용 읽기 (파일명으로 분류 안됨)
            let fileData;
            try {
                fileData = await this.readFile(file);
            } catch (readError) {
                console.warn('File read warning:', readError.message);
                fileData = { text: '', fileName: file.name, fileType: 'unknown' };
            }

            // 3. LLM 기반 분류 (선택적)
            if (window.multiLLMClient && window.multiLLMClient.hasApiKey('google')) {
                try {
                    const llmResult = await this.classifyWithLLM(file.name, fileData.text.substring(0, 3000));
                    if (llmResult.rawId) {
                        const classification = {
                            file: file,
                            fileName: file.name,
                            fileSize: file.size,
                            rawId: llmResult.rawId,
                            rawIdName: RAW_ID_DEFINITIONS[llmResult.rawId],
                            needsUserInput: false,
                            method: 'llm',
                            classifiedAt: DateHelper.formatISO()
                        };

                        this.classifiedFiles.push(classification);
                        console.log(`✅ File classified (LLM): ${file.name} → ${llmResult.rawId}`);
                        return classification;
                    }
                } catch (llmError) {
                    console.warn('LLM classification failed:', llmError.message);
                }
            }

            // 4. 분류 실패 - 사용자 입력 필요
            return {
                file: file,
                fileName: file.name,
                fileSize: file.size,
                rawId: null,
                rawIdName: null,
                needsUserInput: true,
                method: 'manual-required',
                classifiedAt: DateHelper.formatISO()
            };

        } catch (error) {
            console.error(`❌ File classification failed:`, error.message);
            return {
                file: file,
                fileName: file.name,
                fileSize: file.size,
                rawId: null,
                error: error.message,
                needsUserInput: true
            };
        }
    }

    /**
     * 파일명 기반 RAW ID 매칭
     */
    matchByFilename(filename) {
        for (const rule of RAW_ID_PATTERNS) {
            if (rule.pattern.test(filename)) {
                return rule.rawId;
            }
        }
        return null;
    }

    /**
     * LLM 기반 분류
     */
    async classifyWithLLM(filename, textPreview) {
        const prompt = `다음 파일의 RAW ID를 분류해주세요.

파일명: ${filename}
내용 미리보기:
${textPreview.substring(0, 1500)}

RAW ID 목록:
${Object.entries(RAW_ID_DEFINITIONS).map(([id, name]) => `- ${id}: ${name}`).join('\n')}

응답 형식 (JSON만 출력):
{"rawId": "RAW1", "confidence": 0.95, "reason": "첨부문서 관련 내용"}

파일 내용을 분석하여 가장 적절한 RAW ID를 선택하세요.`;

        const result = await window.multiLLMClient.generate(prompt, {
            provider: 'google',
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            maxTokens: 200
        });

        // JSON 파싱
        try {
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('LLM response parse error');
        }

        return { rawId: null };
    }

    /**
     * 여러 파일 일괄 분류
     */
    async classifyFiles(files) {
        const results = [];
        for (const file of files) {
            const result = await this.classifyFile(file);
            results.push(result);
        }
        return results;
    }

    /**
     * 파일 매칭 테이블 생성
     */
    generateFileMatchingTable(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_파일명매칭테이블_${timestamp}.md`;

        let markdown = `# 파일 매칭 테이블: ${reportName}\n\n`;
        markdown += `**생성 시간**: ${DateHelper.formatISO()}\n\n`;
        markdown += `| 원본파일명 | RAW ID | 한글명칭 | 파일크기 |\n`;
        markdown += `|-----------|--------|----------|----------|\n`;

        this.classifiedFiles.forEach(item => {
            const sizeKB = (item.fileSize / 1024).toFixed(2);
            markdown += `| ${item.fileName} | ${item.rawId || 'UNKNOWN'} | ${item.rawIdName || '-'} | ${sizeKB} KB |\n`;
        });

        return {
            filename: filename,
            content: markdown,
            data: this.classifiedFiles
        };
    }

    /**
     * 파일 검증
     */
    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.txt', '.md'];

        // 파일 크기 확인
        if (file.size > maxSize) {
            return {
                valid: false,
                error: '파일 크기는 50MB를 초과할 수 없습니다.'
            };
        }

        // 파일 형식 확인
        const fileName = file.name.toLowerCase();
        const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExt) {
            return {
                valid: false,
                error: '지원하지 않는 파일 형식입니다. (PDF, Word, Excel, Text만 가능)'
            };
        }

        return { valid: true };
    }

    /**
     * 분류된 파일 목록 가져오기
     */
    getClassifiedFiles() {
        return this.classifiedFiles;
    }

    /**
     * 특정 RAW ID의 파일들 가져오기
     */
    getFilesByRawId(rawId) {
        return this.classifiedFiles.filter(item => item.rawId === rawId);
    }

    /**
     * 분류 초기화
     */
    clearClassifications() {
        this.classifiedFiles = [];
        console.log('✅ Classifications cleared');
    }

    /**
     * Supabase Storage에 파일 업로드 (선택적)
     */
    async uploadToStorage(file, reportId, rawId) {
        // Supabase가 없거나 설정되지 않은 경우 스킵
        if (!window.supabaseClient) {
            return {
                success: false,
                error: 'Supabase not configured'
            };
        }

        const bucket = 'raw-documents';
        const path = `${reportId}/${rawId}_${file.name}`;

        try {
            const result = await window.supabaseClient.uploadFile(bucket, path, file);

            if (result.success) {
                console.log(`✅ File uploaded to storage: ${path}`);
                return {
                    success: true,
                    path: result.path,
                    url: result.url
                };
            }

            throw new Error(result.error);

        } catch (error) {
            console.error(`❌ File upload failed:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Singleton instance
const fileHandler = new FileHandler();

// 전역 내보내기
if (typeof window !== 'undefined') {
    window.fileHandler = fileHandler;
    window.FileHandler = FileHandler;
    window.RAW_ID_DEFINITIONS = RAW_ID_DEFINITIONS;
}

/**
 * File Handler
 * 파일 업로드, 읽기, 분류 처리
 */

import { CONFIG, Storage, DateHelper } from './config.js';
import supabaseClient from './supabase-client.js';
import llmClient from './llm-client.js';

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
        const fileName = file.name;

        try {
            // PDF 파일
            if (fileType === 'application/pdf') {
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
            console.error(`❌ File read failed (${fileName}):`, error.message);
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
     * PDF 파일 읽기
     * Note: PDF.js 라이브러리 필요
     */
    async readPDF(file) {
        // PDF.js 사용 (브라우저에서 PDF 파싱)
        // 실제 구현 시 PDF.js 라이브러리 로드 필요

        // 임시 구현: ArrayBuffer로 읽기
        const arrayBuffer = await file.arrayBuffer();

        // PDF.js를 사용한 텍스트 추출 (실제 구현 필요)
        console.warn('⚠️ PDF parsing requires PDF.js library');

        return {
            text: '[PDF 내용 - PDF.js 라이브러리 필요]',
            fileName: file.name,
            fileType: 'pdf',
            arrayBuffer: arrayBuffer
        };
    }

    /**
     * Excel 파일 읽기
     * Note: SheetJS (xlsx) 라이브러리 필요
     */
    async readExcel(file) {
        // SheetJS 사용 (브라우저에서 Excel 파싱)
        console.warn('⚠️ Excel parsing requires SheetJS library');

        const arrayBuffer = await file.arrayBuffer();

        return {
            text: '[Excel 내용 - SheetJS 라이브러리 필요]',
            fileName: file.name,
            fileType: 'excel',
            arrayBuffer: arrayBuffer
        };
    }

    /**
     * Word 파일 읽기
     * Note: mammoth.js 라이브러리 필요
     */
    async readWord(file) {
        // mammoth.js 사용 (브라우저에서 Word 파싱)
        console.warn('⚠️ Word parsing requires mammoth.js library');

        const arrayBuffer = await file.arrayBuffer();

        return {
            text: '[Word 내용 - mammoth.js 라이브러리 필요]',
            fileName: file.name,
            fileType: 'word',
            arrayBuffer: arrayBuffer
        };
    }

    /**
     * 파일 분류 (RAW ID 태깅)
     */
    async classifyFile(file) {
        console.log(`🔍 Classifying file: ${file.name}`);

        try {
            // 파일 내용 읽기
            const fileData = await this.readFile(file);

            // LLM을 사용한 자동 분류
            const result = await llmClient.classifyDocument(
                file.name,
                fileData.text.substring(0, 3000) // 처음 3000자만 사용
            );

            if (result.success) {
                const classification = {
                    file: file,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: fileData.fileType,
                    rawId: result.rawId,
                    rawIdName: result.rawId ? CONFIG.RAW_IDS[result.rawId] : null,
                    needsUserInput: result.needsUserInput || false,
                    classifiedAt: DateHelper.formatISO()
                };

                this.classifiedFiles.push(classification);
                console.log(`✅ File classified: ${file.name} → ${result.rawId}`);

                return classification;
            }

            throw new Error(result.error || '분류 실패');

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
     * Supabase Storage에 파일 업로드
     */
    async uploadToStorage(file, reportId, rawId) {
        const bucket = 'raw-documents';
        const path = `${reportId}/${rawId}_${file.name}`;

        try {
            const result = await supabaseClient.uploadFile(bucket, path, file);

            if (result.success) {
                console.log(`✅ File uploaded to storage: ${path}`);
                return {
                    success: true,
                    path: result.path,
                    url: await this.getFileUrl(bucket, result.path)
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

    /**
     * Storage 파일 URL 가져오기
     */
    async getFileUrl(bucket, path) {
        const result = await supabaseClient.getFileUrl(bucket, path);
        return result.success ? result.url : null;
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
     * 파일 검증
     */
    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/plain'
        ];

        const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.txt', '.md'];

        // 파일 크기 확인
        if (file.size > maxSize) {
            return {
                valid: false,
                error: '파일 크기는 50MB를 초과할 수 없습니다.'
            };
        }

        // 파일 형식 확인
        const fileType = file.type;
        const fileName = file.name;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        if (!allowedTypes.includes(fileType) && !allowedExtensions.includes(fileExt)) {
            return {
                valid: false,
                error: '지원하지 않는 파일 형식입니다. (PDF, Word, Excel, Text만 가능)'
            };
        }

        return { valid: true };
    }
}

// Singleton instance
const fileHandler = new FileHandler();

export default fileHandler;

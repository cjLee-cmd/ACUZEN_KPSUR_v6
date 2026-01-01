/**
 * Output Generator
 * 최종 Word 문서 출력
 * docx.js 라이브러리를 사용한 실제 Word 문서 생성
 * DB 연동: Supabase report_sections 테이블에서 섹션 조회
 */

// IIFE로 감싸서 const 선언이 전역 스코프와 충돌하지 않도록 함
(function() {
'use strict';

// DateHelper fallback
const DateHelper = window.DateHelper || {
    formatYYMMDD_hhmmss: () => {
        const now = new Date();
        return now.toISOString().replace(/[-:T]/g, '').substring(0, 14);
    },
    formatISO: () => new Date().toISOString()
};

class OutputGenerator {
    constructor() {
        this.outputHistory = this.loadHistory();
        this.reportId = null; // DB 연동용 보고서 ID
        // docx 라이브러리는 비동기로 로드 (생성자에서 에러 방지)
        this.docxLoaded = false;
        this.loadDocxLibrary().then(() => {
            this.docxLoaded = true;
        }).catch(() => {
            console.warn('docx library not available, using HTML fallback');
        });
    }

    /**
     * 보고서 ID 설정 (DB 연동용)
     * @param {string} reportId - 보고서 UUID
     */
    setReportId(reportId) {
        this.reportId = reportId;
        console.log(`[OutputGenerator] Report ID set: ${reportId}`);
    }

    /**
     * 보고서 ID 가져오기
     */
    getReportId() {
        return this.reportId;
    }

    /**
     * DB에서 섹션들 로드
     * @returns {Promise<Object>} - 섹션 객체 또는 null
     */
    async loadSectionsFromDB() {
        if (!this.reportId) {
            console.warn('[OutputGenerator] Report ID not set, cannot load from DB');
            return null;
        }

        try {
            // supabaseClient 동적 참조 (전역 또는 window에서)
            const supabaseClient = window.supabaseClient ||
                (typeof require !== 'undefined' ? require('./supabase-client.js').default : null);

            if (!supabaseClient) {
                console.warn('[OutputGenerator] supabaseClient not available');
                return null;
            }

            const result = await supabaseClient.getSections(this.reportId);

            if (!result.success || !result.sections || result.sections.length === 0) {
                console.log('[OutputGenerator] No sections found in DB');
                return null;
            }

            // DB 형식을 로컬 형식으로 변환
            const sections = {};
            for (const dbSection of result.sections) {
                sections[dbSection.section_number] = {
                    id: dbSection.section_number,
                    name: dbSection.section_name,
                    content: dbSection.content_markdown,
                    generatedAt: dbSection.created_at,
                    dbId: dbSection.id,
                    version: dbSection.version
                };
            }

            console.log(`[OutputGenerator] ✅ ${Object.keys(sections).length} sections loaded from DB`);
            return sections;

        } catch (error) {
            console.error('[OutputGenerator] DB load error:', error);
            return null;
        }
    }

    /**
     * 섹션 데이터 가져오기 (DB 우선, localStorage 폴백)
     * @returns {Promise<Object>} - 섹션 객체
     */
    async getSectionsForOutput() {
        // 1. DB에서 로드 시도
        if (this.reportId) {
            const dbSections = await this.loadSectionsFromDB();
            if (dbSections && Object.keys(dbSections).length > 0) {
                return dbSections;
            }
        }

        // 2. localStorage 폴백
        try {
            const stored = localStorage.getItem('generatedSections');
            if (stored) {
                const sections = JSON.parse(stored);
                console.log(`[OutputGenerator] Loaded ${Object.keys(sections).length} sections from localStorage`);
                return sections;
            }
        } catch (e) {
            console.warn('[OutputGenerator] Failed to load from localStorage:', e);
        }

        return {};
    }

    /**
     * 섹션들을 마크다운으로 결합
     * @param {Object} sections - 섹션 객체
     * @returns {string} - 결합된 마크다운
     */
    combineSectionsToMarkdown(sections) {
        if (!sections || Object.keys(sections).length === 0) {
            return '';
        }

        // 섹션 번호순 정렬
        const sortedIds = Object.keys(sections).sort((a, b) => {
            return parseInt(a) - parseInt(b);
        });

        let combined = '';
        for (const id of sortedIds) {
            const section = sections[id];
            if (section && section.content) {
                combined += section.content + '\n\n---\n\n';
            }
        }

        return combined.trim();
    }

    /**
     * docx.js 라이브러리 로드
     */
    async loadDocxLibrary() {
        if (typeof docx !== 'undefined') return;

        try {
            // CDN에서 docx.js 로드
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/docx@8.5.0/build/index.js';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
            console.log('docx.js library loaded');
        } catch (e) {
            console.warn('Failed to load docx.js, will use HTML fallback');
        }
    }

    /**
     * 저장된 히스토리 로드
     */
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('outputHistory')) || [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 히스토리 저장
     */
    saveHistory() {
        try {
            localStorage.setItem('outputHistory', JSON.stringify(this.outputHistory.slice(0, 10)));
        } catch (e) {
            console.warn('Failed to save history');
        }
    }

    /**
     * 마크다운을 Word 문서로 변환
     * docx.js 라이브러리 사용
     */
    async generateWordDocument(reportName, markdownContent, isDraft = false) {
        console.log(`📄 Generating Word document: ${reportName}`);

        const suffix = isDraft ? '_Draft' : '';
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}${suffix}_${timestamp}.docx`;

        try {
            // docx.js가 로드되었는지 확인
            if (typeof docx !== 'undefined') {
                const blob = await this.createDocxBlob(markdownContent, reportName, isDraft);
                this.downloadBlob(blob, filename);

                // 출력 이력 기록
                this.outputHistory.unshift({
                    id: Date.now(),
                    name: filename,
                    format: 'docx',
                    timestamp: new Date().toLocaleString('ko-KR'),
                    size: this.formatFileSize(blob.size),
                    reportName: reportName,
                    isDraft: isDraft,
                    generatedAt: DateHelper.formatISO()
                });
                this.saveHistory();

                console.log(`✅ Word document generated: ${filename}`);
                return { success: true, filename: filename, size: blob.size };
            }
        } catch (error) {
            console.warn('docx generation failed, falling back to HTML:', error);
        }

        // Fallback: HTML로 다운로드
        return this.downloadHTML(reportName, markdownContent, isDraft);
    }

    /**
     * docx Blob 생성
     */
    async createDocxBlob(markdownContent, reportName, isDraft) {
        const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
                WidthType, AlignmentType, Packer, BorderStyle } = docx;

        // 마크다운 파싱
        const sections = this.parseMarkdownToSections(markdownContent);

        // 문서 자식 요소 생성
        const children = [];

        // Draft 워터마크
        if (isDraft) {
            children.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [
                        new TextRun({
                            text: '[ DRAFT - 초안 ]',
                            bold: true,
                            color: 'FF0000',
                            size: 32
                        })
                    ]
                })
            );
        }

        // 섹션별 콘텐츠 추가
        for (const section of sections) {
            // 헤딩
            if (section.heading) {
                children.push(
                    new Paragraph({
                        text: section.heading.text,
                        heading: section.heading.level === 1 ? HeadingLevel.HEADING_1 :
                                 section.heading.level === 2 ? HeadingLevel.HEADING_2 :
                                 HeadingLevel.HEADING_3,
                        spacing: { before: 240, after: 120 }
                    })
                );
            }

            // 문단
            for (const para of section.paragraphs || []) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: para, size: 22 })],
                        spacing: { after: 120 }
                    })
                );
            }

            // 테이블
            if (section.table && section.table.length > 0) {
                children.push(this.createDocxTable(section.table));
            }
        }

        // 문서 생성
        const doc = new Document({
            creator: 'KPSUR AGENT',
            title: reportName,
            description: 'PSUR 자동 생성 보고서',
            sections: [{
                properties: {},
                children: children
            }]
        });

        return await Packer.toBlob(doc);
    }

    /**
     * 마크다운을 섹션으로 파싱
     */
    parseMarkdownToSections(markdown) {
        const sections = [];
        const lines = markdown.split('\n');
        let currentSection = { paragraphs: [] };
        let inTable = false;
        let tableLines = [];

        for (const line of lines) {
            // 헤딩 파싱
            if (line.startsWith('# ')) {
                if (currentSection.heading || currentSection.paragraphs.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = {
                    heading: { level: 1, text: line.substring(2).trim() },
                    paragraphs: [],
                    table: null
                };
            } else if (line.startsWith('## ')) {
                if (currentSection.heading || currentSection.paragraphs.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = {
                    heading: { level: 2, text: line.substring(3).trim() },
                    paragraphs: [],
                    table: null
                };
            } else if (line.startsWith('### ')) {
                if (currentSection.heading || currentSection.paragraphs.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = {
                    heading: { level: 3, text: line.substring(4).trim() },
                    paragraphs: [],
                    table: null
                };
            } else if (line.startsWith('|')) {
                // 테이블 시작 또는 계속
                inTable = true;
                if (!line.includes('---')) {
                    tableLines.push(line);
                }
            } else if (inTable && !line.startsWith('|')) {
                // 테이블 종료
                if (tableLines.length > 0) {
                    currentSection.table = this.parseTableLines(tableLines);
                    tableLines = [];
                }
                inTable = false;
                if (line.trim()) {
                    currentSection.paragraphs.push(line.trim());
                }
            } else if (line.trim()) {
                currentSection.paragraphs.push(line.trim());
            }
        }

        // 마지막 테이블 처리
        if (tableLines.length > 0) {
            currentSection.table = this.parseTableLines(tableLines);
        }

        if (currentSection.heading || currentSection.paragraphs.length > 0 || currentSection.table) {
            sections.push(currentSection);
        }

        return sections;
    }

    /**
     * 테이블 라인 파싱
     */
    parseTableLines(lines) {
        return lines.map(line => {
            return line.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
        });
    }

    /**
     * docx 테이블 생성
     */
    createDocxTable(tableData) {
        const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = docx;

        const rows = tableData.map((rowData, rowIndex) => {
            return new TableRow({
                children: rowData.map(cellText => {
                    return new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: cellText,
                                        bold: rowIndex === 0,
                                        size: 20,
                                        color: rowIndex === 0 ? 'FFFFFF' : '000000'
                                    })
                                ]
                            })
                        ],
                        shading: rowIndex === 0 ? { fill: '25739B' } : undefined,
                        margins: { top: 50, bottom: 50, left: 75, right: 75 }
                    });
                })
            });
        });

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows
        });
    }

    /**
     * 파일 크기 포맷
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    /**
     * 마크다운을 HTML로 변환
     */
    markdownToHTML(markdown) {
        // marked.js 라이브러리 사용 권장
        // 간단한 변환
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        html = `<p>${html}</p>`;

        return html;
    }

    /**
     * HTML 문서 다운로드
     */
    downloadHTML(reportName, markdownContent, isDraft = false) {
        const html = this.markdownToHTML(markdownContent);

        const fullHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportName}</title>
    <style>
        body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.8;
        }
        h1 {
            font-size: 24px;
            color: #1a1a1a;
            border-bottom: 2px solid #25739B;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 20px;
            color: #333;
            margin-top: 30px;
        }
        h3 {
            font-size: 16px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        ${isDraft ? `
        body::before {
            content: 'DRAFT';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(255, 0, 0, 0.1);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
        }
        ` : ''}
    </style>
</head>
<body>
${html}
</body>
</html>`;

        const suffix = isDraft ? '_Draft' : '';
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}${suffix}_${timestamp}.html`;

        const blob = new Blob([fullHTML], {
            type: 'text/html;charset=utf-8'
        });

        this.downloadBlob(blob, filename);

        console.log(`✅ HTML generated: ${filename}`);

        return {
            success: true,
            filename: filename
        };
    }

    /**
     * PDF 다운로드 (브라우저 인쇄 기능 사용)
     */
    printToPDF(reportName, markdownContent, isDraft = false) {
        // HTML 생성
        const html = this.markdownToHTML(markdownContent);

        // 새 창 열기
        const printWindow = window.open('', '_blank');

        const fullHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${reportName}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
        }
        h1 {
            font-size: 18pt;
            color: #1a1a1a;
            border-bottom: 2px solid #25739B;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 14pt;
            color: #333;
            margin-top: 20pt;
        }
        h3 {
            font-size: 12pt;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10pt 0;
            font-size: 10pt;
        }
        th, td {
            border: 1px solid #000;
            padding: 5pt;
        }
        th {
            background-color: #f0f0f0;
        }
        ${isDraft ? `
        body::before {
            content: 'DRAFT';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120pt;
            color: rgba(255, 0, 0, 0.1);
            font-weight: bold;
        }
        ` : ''}
    </style>
</head>
<body>
${html}
<script>
    window.print();
</script>
</body>
</html>`;

        printWindow.document.write(fullHTML);
        printWindow.document.close();

        console.log(`✅ PDF print dialog opened`);

        return {
            success: true,
            message: 'PDF 인쇄 대화상자가 열렸습니다.'
        };
    }

    /**
     * 보고서 포맷 검증
     */
    validateReportFormat(markdownContent) {
        const issues = [];

        // 빈 내용 확인
        if (!markdownContent || markdownContent.trim().length === 0) {
            issues.push('보고서 내용이 비어있습니다.');
        }

        // 최소 길이 확인
        if (markdownContent.length < 1000) {
            issues.push('보고서 내용이 너무 짧습니다. (최소 1000자)');
        }

        // 섹션 확인
        const sectionHeaders = (markdownContent.match(/^##\s+/gm) || []).length;
        if (sectionHeaders < 5) {
            issues.push(`섹션이 너무 적습니다. (현재: ${sectionHeaders}개, 최소: 5개)`);
        }

        // 표 확인
        const tables = (markdownContent.match(/\|.*\|/g) || []).length;
        if (tables === 0) {
            issues.push('표가 없습니다. 최소 1개 이상의 표가 필요합니다.');
        }

        if (issues.length > 0) {
            return {
                valid: false,
                issues: issues
            };
        }

        return { valid: true };
    }

    /**
     * 메타데이터 추가
     */
    addMetadata(markdownContent, metadata) {
        const metadataSection = `---
title: ${metadata.reportName || '제목 없음'}
version: ${metadata.version || '1.0'}
date: ${metadata.date || DateHelper.formatISO()}
author: ${metadata.author || '작성자 미상'}
status: ${metadata.isDraft ? 'DRAFT' : 'FINAL'}
---

`;

        return metadataSection + markdownContent;
    }

    /**
     * 출력 이력 가져오기
     */
    getOutputHistory() {
        return this.outputHistory;
    }

    /**
     * 통계
     */
    getStatistics() {
        return {
            totalOutputs: this.outputHistory.length,
            draftOutputs: this.outputHistory.filter(item => item.isDraft).length,
            finalOutputs: this.outputHistory.filter(item => !item.isDraft).length
        };
    }

    /**
     * Blob 다운로드 헬퍼
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 출력 초기화
     */
    clearHistory() {
        this.outputHistory = [];
        console.log('✅ Output history cleared');
    }
}

// Singleton instance
const outputGenerator = new OutputGenerator();
console.log('✅ OutputGenerator instance created');

// 전역으로 내보내기 (ES6 모듈 대신)
if (typeof window !== 'undefined') {
    window.outputGenerator = outputGenerator;
    window.OutputGenerator = OutputGenerator;
    console.log('✅ window.outputGenerator set to OutputGenerator instance');
}

})(); // IIFE 종료

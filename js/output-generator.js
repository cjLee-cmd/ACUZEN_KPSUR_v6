/**
 * Output Generator
 * 최종 Word 문서 출력
 */

import { DateHelper } from './config.js';

class OutputGenerator {
    constructor() {
        this.outputHistory = [];
    }

    /**
     * 마크다운을 Word 문서로 변환
     * Note: docx 라이브러리 필요
     */
    async generateWordDocument(reportName, markdownContent, isDraft = false) {
        console.log(`📄 Generating Word document: ${reportName}`);

        console.warn('⚠️ Word document generation requires docx library');

        // docx 라이브러리를 사용한 Word 문서 생성 (실제 구현 필요)
        // const doc = new Document({
        //     sections: [{
        //         properties: {},
        //         children: this.markdownToDocxParagraphs(markdownContent)
        //     }]
        // });
        //
        // const blob = await Packer.toBlob(doc);
        //
        // const suffix = isDraft ? '_Draft' : '';
        // const timestamp = DateHelper.formatYYMMDD_hhmmss();
        // const filename = `${reportName}${suffix}_${timestamp}.docx`;
        //
        // this.downloadBlob(blob, filename);

        // 임시 구현: 마크다운 다운로드
        const suffix = isDraft ? '_Draft' : '';
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}${suffix}_${timestamp}.md`;

        const blob = new Blob([markdownContent], {
            type: 'text/markdown;charset=utf-8'
        });

        this.downloadBlob(blob, filename);

        // 출력 이력 기록
        this.outputHistory.push({
            reportName: reportName,
            filename: filename,
            isDraft: isDraft,
            generatedAt: DateHelper.formatISO()
        });

        console.log(`✅ Document generated: ${filename}`);

        return {
            success: true,
            filename: filename
        };
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

export default outputGenerator;

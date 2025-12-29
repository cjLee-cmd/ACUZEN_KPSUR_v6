/**
 * Markdown Converter
 * 소스 문서를 마크다운으로 변환
 */

import { DateHelper } from './config.js';
import llmClient from './llm-client.js';
import fileHandler from './file-handler.js';

class MarkdownConverter {
    constructor() {
        this.convertedFiles = [];
        this.conversionHistory = [];
    }

    /**
     * 파일을 마크다운으로 변환
     */
    async convertFile(file, rawId, options = {}) {
        console.log(`📝 Converting to markdown: ${file.name}`);

        try {
            // 파일 내용 읽기
            const fileData = await fileHandler.readFile(file);

            // LLM을 사용한 마크다운 변환
            const result = await llmClient.convertToMarkdown(
                fileData.text,
                file.name,
                rawId
            );

            if (result.success) {
                const converted = {
                    originalFileName: file.name,
                    rawId: rawId,
                    markdownFileName: `${rawId}_${file.name}.md`,
                    markdownContent: result.text,
                    convertedAt: DateHelper.formatISO(),
                    duration: result.duration,
                    model: result.model
                };

                this.convertedFiles.push(converted);
                this.conversionHistory.push({
                    ...converted,
                    success: true
                });

                console.log(`✅ Conversion complete: ${file.name} (${result.duration}s)`);

                return {
                    success: true,
                    data: converted
                };
            }

            throw new Error(result.error || '변환 실패');

        } catch (error) {
            console.error(`❌ Conversion failed (${file.name}):`, error.message);

            this.conversionHistory.push({
                originalFileName: file.name,
                rawId: rawId,
                error: error.message,
                success: false,
                convertedAt: DateHelper.formatISO()
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 여러 파일 일괄 변환
     */
    async convertFiles(classifiedFiles, options = {}) {
        const results = [];

        for (const item of classifiedFiles) {
            if (!item.rawId || item.rawId === 'UNKNOWN') {
                console.warn(`⚠️ Skipping file without RAW ID: ${item.fileName}`);
                results.push({
                    success: false,
                    fileName: item.fileName,
                    error: 'RAW ID가 지정되지 않음'
                });
                continue;
            }

            const result = await this.convertFile(item.file, item.rawId, options);
            results.push({
                ...result,
                fileName: item.fileName,
                rawId: item.rawId
            });

            // API 호출 간격 (Rate limit 방지)
            if (options.delay) {
                await new Promise(resolve => setTimeout(resolve, options.delay));
            }
        }

        return results;
    }

    /**
     * 변환된 마크다운 파일 다운로드 (Blob)
     */
    downloadMarkdown(markdownFileName, markdownContent) {
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = markdownFileName;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded: ${markdownFileName}`);
    }

    /**
     * 모든 변환된 마크다운 파일 ZIP으로 다운로드
     * Note: JSZip 라이브러리 필요
     */
    async downloadAllAsZip(reportName) {
        console.warn('⚠️ ZIP download requires JSZip library');

        // JSZip을 사용한 ZIP 생성 (실제 구현 필요)
        // const zip = new JSZip();
        //
        // this.convertedFiles.forEach(item => {
        //     zip.file(item.markdownFileName, item.markdownContent);
        // });
        //
        // const blob = await zip.generateAsync({ type: 'blob' });
        // this.downloadBlob(blob, `${reportName}_마크다운변환_${DateHelper.formatYYMMDD_hhmmss()}.zip`);

        console.log('ZIP 다운로드 기능은 JSZip 라이브러리가 필요합니다.');
    }

    /**
     * 변환 요약 생성
     */
    generateConversionSummary(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_변환요약_${timestamp}.md`;

        const successCount = this.conversionHistory.filter(item => item.success).length;
        const failCount = this.conversionHistory.filter(item => !item.success).length;

        let markdown = `# 마크다운 변환 요약: ${reportName}\n\n`;
        markdown += `**생성 시간**: ${DateHelper.formatISO()}\n\n`;
        markdown += `## 통계\n\n`;
        markdown += `- 총 파일 수: ${this.conversionHistory.length}\n`;
        markdown += `- 성공: ${successCount} ✅\n`;
        markdown += `- 실패: ${failCount} ❌\n\n`;

        markdown += `## 변환 결과\n\n`;
        markdown += `| 원본 파일명 | RAW ID | 상태 | 소요 시간 | 비고 |\n`;
        markdown += `|------------|--------|------|-----------|------|\n`;

        this.conversionHistory.forEach(item => {
            const status = item.success ? '✅' : '❌';
            const duration = item.duration ? `${item.duration}s` : '-';
            const note = item.error || '-';

            markdown += `| ${item.originalFileName} | ${item.rawId} | ${status} | ${duration} | ${note} |\n`;
        });

        markdown += `\n## 상세 정보\n\n`;

        this.convertedFiles.forEach((item, index) => {
            markdown += `### ${index + 1}. ${item.originalFileName}\n\n`;
            markdown += `- **RAW ID**: ${item.rawId}\n`;
            markdown += `- **변환 파일명**: ${item.markdownFileName}\n`;
            markdown += `- **변환 시간**: ${item.convertedAt}\n`;
            markdown += `- **소요 시간**: ${item.duration}s\n`;
            markdown += `- **모델**: ${item.model}\n\n`;
            markdown += `---\n\n`;
        });

        return {
            filename: filename,
            content: markdown
        };
    }

    /**
     * 변환된 파일 목록 가져오기
     */
    getConvertedFiles() {
        return this.convertedFiles;
    }

    /**
     * 특정 RAW ID의 변환된 파일 가져오기
     */
    getConvertedFileByRawId(rawId) {
        return this.convertedFiles.find(item => item.rawId === rawId);
    }

    /**
     * 변환 이력 가져오기
     */
    getConversionHistory() {
        return this.conversionHistory;
    }

    /**
     * 변환 초기화
     */
    clearConversions() {
        this.convertedFiles = [];
        this.conversionHistory = [];
        console.log('✅ Conversions cleared');
    }

    /**
     * 마크다운 검증
     */
    validateMarkdown(markdown) {
        // 기본 마크다운 구조 검증
        if (!markdown || markdown.trim().length === 0) {
            return {
                valid: false,
                error: '마크다운 내용이 비어있습니다.'
            };
        }

        // 최소 길이 확인
        if (markdown.length < 100) {
            return {
                valid: false,
                error: '마크다운 내용이 너무 짧습니다. (최소 100자)'
            };
        }

        return { valid: true };
    }

    /**
     * 마크다운 미리보기 생성 (HTML)
     */
    generatePreview(markdown) {
        // 간단한 마크다운 → HTML 변환
        // 실제 구현 시 marked.js 등의 라이브러리 사용 권장

        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        return html;
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
}

// Singleton instance
const markdownConverter = new MarkdownConverter();

export default markdownConverter;

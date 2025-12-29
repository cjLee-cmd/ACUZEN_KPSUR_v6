/**
 * Template Writer
 * 템플릿에 추출 데이터를 삽입하여 보고서 작성
 */

import { DateHelper } from './config.js';

class TemplateWriter {
    constructor() {
        this.templates = {};
        this.generatedSections = {};
    }

    /**
     * 템플릿 로드
     */
    async loadTemplate(sectionName, templatePath) {
        try {
            const response = await fetch(templatePath);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const templateContent = await response.text();

            this.templates[sectionName] = {
                content: templateContent,
                loadedAt: DateHelper.formatISO()
            };

            console.log(`✅ Template loaded: ${sectionName}`);
            return { success: true, content: templateContent };

        } catch (error) {
            console.error(`❌ Template load failed (${sectionName}):`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 템플릿에 데이터 삽입
     */
    populateTemplate(templateContent, data) {
        let result = templateContent;

        // [변수명] 형식의 플레이스홀더를 데이터로 치환
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = `[${key}]`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

            // 값이 배열인 경우 (충돌 데이터)
            if (Array.isArray(value)) {
                result = result.replace(regex, `[⚠️ 충돌: ${value.join(' / ')}]`);
            } else {
                result = result.replace(regex, value || '[데이터 없음]');
            }
        });

        return result;
    }

    /**
     * 섹션 생성
     */
    async generateSection(sectionName, templatePath, extractedData) {
        console.log(`📝 Generating section: ${sectionName}`);

        try {
            // 템플릿 로드
            const templateResult = await this.loadTemplate(sectionName, templatePath);

            if (!templateResult.success) {
                throw new Error(templateResult.error);
            }

            // 데이터 삽입
            const generatedContent = this.populateTemplate(
                templateResult.content,
                extractedData
            );

            // 생성된 섹션 저장
            this.generatedSections[sectionName] = {
                content: generatedContent,
                templatePath: templatePath,
                generatedAt: DateHelper.formatISO()
            };

            console.log(`✅ Section generated: ${sectionName}`);

            return {
                success: true,
                sectionName: sectionName,
                content: generatedContent
            };

        } catch (error) {
            console.error(`❌ Section generation failed (${sectionName}):`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 모든 섹션 생성
     */
    async generateAllSections(sectionMappings, extractedData) {
        const results = [];

        for (const mapping of sectionMappings) {
            const result = await this.generateSection(
                mapping.sectionName,
                mapping.templatePath,
                extractedData
            );

            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Generated ${successCount}/${results.length} sections`);

        return results;
    }

    /**
     * 전체 보고서 병합
     */
    mergeAllSections(sectionOrder) {
        let merged = '';

        sectionOrder.forEach((sectionName, index) => {
            const section = this.generatedSections[sectionName];

            if (section) {
                merged += section.content;
                merged += '\n\n';

                // 섹션 구분선 (마지막 섹션 제외)
                if (index < sectionOrder.length - 1) {
                    merged += '---\n\n';
                }
            } else {
                console.warn(`⚠️ Section not found: ${sectionName}`);
                merged += `[섹션 없음: ${sectionName}]\n\n`;
            }
        });

        console.log(`✅ Merged ${sectionOrder.length} sections`);
        return merged;
    }

    /**
     * 생성된 섹션 가져오기
     */
    getSection(sectionName) {
        return this.generatedSections[sectionName]?.content || null;
    }

    /**
     * 섹션 업데이트 (리뷰 후 수정)
     */
    updateSection(sectionName, newContent) {
        if (!this.generatedSections[sectionName]) {
            console.warn(`⚠️ Section not found: ${sectionName}`);
            return false;
        }

        this.generatedSections[sectionName] = {
            ...this.generatedSections[sectionName],
            content: newContent,
            updatedAt: DateHelper.formatISO()
        };

        console.log(`✅ Section updated: ${sectionName}`);
        return true;
    }

    /**
     * 섹션 목록 가져오기
     */
    getSectionList() {
        return Object.keys(this.generatedSections);
    }

    /**
     * 모든 섹션 가져오기
     */
    getAllSections() {
        return this.generatedSections;
    }

    /**
     * 템플릿 검증
     */
    validateTemplate(templateContent, requiredVariables) {
        const missingVariables = [];

        requiredVariables.forEach(variable => {
            const placeholder = `[${variable}]`;
            if (!templateContent.includes(placeholder)) {
                missingVariables.push(variable);
            }
        });

        if (missingVariables.length > 0) {
            return {
                valid: false,
                missingVariables: missingVariables
            };
        }

        return { valid: true };
    }

    /**
     * 미사용 플레이스홀더 확인
     */
    findUnusedPlaceholders(content) {
        const placeholderRegex = /\[([^\]]+)\]/g;
        const matches = content.matchAll(placeholderRegex);
        const unused = [];

        for (const match of matches) {
            const placeholder = match[1];

            // 특수 플레이스홀더는 제외
            if (placeholder.startsWith('⚠️') || placeholder === '데이터 없음') {
                continue;
            }

            unused.push(placeholder);
        }

        return unused;
    }

    /**
     * 섹션 다운로드 (마크다운)
     */
    downloadSection(sectionName) {
        const section = this.generatedSections[sectionName];

        if (!section) {
            console.error(`❌ Section not found: ${sectionName}`);
            return false;
        }

        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${sectionName}_${timestamp}.md`;

        const blob = new Blob([section.content], {
            type: 'text/markdown;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded: ${filename}`);
        return true;
    }

    /**
     * 전체 보고서 다운로드 (마크다운)
     */
    downloadFullReport(reportName, sectionOrder) {
        const mergedContent = this.mergeAllSections(sectionOrder);
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_전체보고서_${timestamp}.md`;

        const blob = new Blob([mergedContent], {
            type: 'text/markdown;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded full report: ${filename}`);
        return true;
    }

    /**
     * 섹션 초기화
     */
    clearSections() {
        this.generatedSections = {};
        console.log('✅ Sections cleared');
    }

    /**
     * 템플릿 초기화
     */
    clearTemplates() {
        this.templates = {};
        console.log('✅ Templates cleared');
    }
}

// Singleton instance
const templateWriter = new TemplateWriter();

export default templateWriter;

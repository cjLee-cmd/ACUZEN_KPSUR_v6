/**
 * Data Extractor
 * 마크다운에서 CS/PH/Table 데이터 추출
 */

import { DateHelper } from './config.js';
import llmClient from './llm-client.js';

class DataExtractor {
    constructor() {
        this.extractedData = {
            CS: {},   // Context-Specific data
            PH: {},   // Paragraph/Phrase data
            Table: {} // Table data
        };
        this.extractionHistory = [];
        this.conflicts = [];
    }

    /**
     * 마크다운에서 데이터 추출
     */
    async extractFromMarkdown(markdownContent, rawId, dataDefinitions) {
        console.log(`📊 Extracting data from RAW ID: ${rawId}`);

        try {
            // LLM을 사용한 데이터 추출
            const result = await llmClient.extractData(
                markdownContent,
                dataDefinitions,
                rawId
            );

            if (result.success) {
                // JSON 파싱
                const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);

                if (!jsonMatch) {
                    throw new Error('JSON 형식을 찾을 수 없습니다.');
                }

                const extractedData = JSON.parse(jsonMatch[1]);

                // 추출 이력 저장
                this.extractionHistory.push({
                    rawId: rawId,
                    extractedAt: DateHelper.formatISO(),
                    duration: result.duration,
                    model: result.model,
                    data: extractedData,
                    success: true
                });

                console.log(`✅ Data extracted from ${rawId} (${result.duration}s)`);

                return {
                    success: true,
                    data: extractedData
                };
            }

            throw new Error(result.error || '추출 실패');

        } catch (error) {
            console.error(`❌ Data extraction failed (${rawId}):`, error.message);

            this.extractionHistory.push({
                rawId: rawId,
                extractedAt: DateHelper.formatISO(),
                error: error.message,
                success: false
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 추출된 데이터 병합
     */
    mergeExtractedData(newData, dataType = 'CS') {
        Object.entries(newData).forEach(([key, value]) => {
            // 데이터가 "DATA_NOT_FOUND"인 경우 무시
            if (value === 'DATA_NOT_FOUND') {
                console.warn(`⚠️ ${key}: 데이터를 찾을 수 없음`);
                return;
            }

            // 기존 데이터와 충돌 확인
            if (this.extractedData[dataType][key]) {
                const existingValue = this.extractedData[dataType][key];

                if (existingValue !== value) {
                    // 충돌 발생!
                    console.warn(`⚠️ Conflict detected for ${key}`);

                    this.conflicts.push({
                        key: key,
                        dataType: dataType,
                        existingValue: existingValue,
                        newValue: value,
                        detectedAt: DateHelper.formatISO()
                    });

                    // 충돌 데이터는 배열로 저장
                    this.extractedData[dataType][key] = [existingValue, value];
                }
            } else {
                // 신규 데이터 저장
                this.extractedData[dataType][key] = value;
            }
        });
    }

    /**
     * CS 데이터 추출 및 병합
     */
    async extractCSData(markdownFiles, csDefinitions) {
        console.log('📊 Extracting CS Data...');

        for (const file of markdownFiles) {
            const result = await this.extractFromMarkdown(
                file.markdownContent,
                file.rawId,
                csDefinitions
            );

            if (result.success) {
                this.mergeExtractedData(result.data, 'CS');
            }
        }

        console.log(`✅ CS Data extraction complete (${Object.keys(this.extractedData.CS).length} variables)`);
        return this.extractedData.CS;
    }

    /**
     * PH 데이터 추출 및 병합
     */
    async extractPHData(markdownFiles, phDefinitions) {
        console.log('📊 Extracting PH Data...');

        for (const file of markdownFiles) {
            const result = await this.extractFromMarkdown(
                file.markdownContent,
                file.rawId,
                phDefinitions
            );

            if (result.success) {
                this.mergeExtractedData(result.data, 'PH');
            }
        }

        console.log(`✅ PH Data extraction complete (${Object.keys(this.extractedData.PH).length} variables)`);
        return this.extractedData.PH;
    }

    /**
     * Table 데이터 추출 및 병합
     */
    async extractTableData(markdownFiles, tableDefinitions) {
        console.log('📊 Extracting Table Data...');

        for (const file of markdownFiles) {
            const result = await this.extractFromMarkdown(
                file.markdownContent,
                file.rawId,
                tableDefinitions
            );

            if (result.success) {
                this.mergeExtractedData(result.data, 'Table');
            }
        }

        console.log(`✅ Table Data extraction complete (${Object.keys(this.extractedData.Table).length} tables)`);
        return this.extractedData.Table;
    }

    /**
     * 모든 데이터 추출 (CS + PH + Table)
     */
    async extractAllData(markdownFiles, definitions) {
        await this.extractCSData(markdownFiles, definitions.CS);
        await this.extractPHData(markdownFiles, definitions.PH);
        await this.extractTableData(markdownFiles, definitions.Table);

        return this.extractedData;
    }

    /**
     * 충돌 해결 (사용자 선택)
     */
    resolveConflict(key, selectedValue) {
        const conflict = this.conflicts.find(c => c.key === key);

        if (!conflict) {
            console.warn(`⚠️ Conflict not found for key: ${key}`);
            return false;
        }

        // 선택된 값으로 업데이트
        this.extractedData[conflict.dataType][key] = selectedValue;

        // 충돌 목록에서 제거
        this.conflicts = this.conflicts.filter(c => c.key !== key);

        console.log(`✅ Conflict resolved for ${key}: ${selectedValue}`);
        return true;
    }

    /**
     * 충돌 목록 가져오기
     */
    getConflicts() {
        return this.conflicts;
    }

    /**
     * 누락된 데이터 확인
     */
    findMissingData(requiredFields) {
        const missing = {
            CS: [],
            PH: [],
            Table: []
        };

        // CS 데이터 확인
        requiredFields.CS?.forEach(field => {
            if (!this.extractedData.CS[field]) {
                missing.CS.push(field);
            }
        });

        // PH 데이터 확인
        requiredFields.PH?.forEach(field => {
            if (!this.extractedData.PH[field]) {
                missing.PH.push(field);
            }
        });

        // Table 데이터 확인
        requiredFields.Table?.forEach(field => {
            if (!this.extractedData.Table[field]) {
                missing.Table.push(field);
            }
        });

        return missing;
    }

    /**
     * 추출 요약 생성
     */
    generateExtractionSummary(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_데이터추출요약_${timestamp}.md`;

        let markdown = `# 데이터 추출 요약: ${reportName}\n\n`;
        markdown += `**생성 시간**: ${DateHelper.formatISO()}\n\n`;

        markdown += `## 통계\n\n`;
        markdown += `- CS 데이터: ${Object.keys(this.extractedData.CS).length}개\n`;
        markdown += `- PH 데이터: ${Object.keys(this.extractedData.PH).length}개\n`;
        markdown += `- Table 데이터: ${Object.keys(this.extractedData.Table).length}개\n`;
        markdown += `- 충돌: ${this.conflicts.length}개\n\n`;

        if (this.conflicts.length > 0) {
            markdown += `## ⚠️ 충돌 발생\n\n`;
            markdown += `| 변수명 | 기존 값 | 새 값 |\n`;
            markdown += `|--------|---------|-------|\n`;

            this.conflicts.forEach(conflict => {
                markdown += `| ${conflict.key} | ${conflict.existingValue} | ${conflict.newValue} |\n`;
            });

            markdown += `\n`;
        }

        markdown += `## CS 데이터\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(this.extractedData.CS, null, 2)}\n\`\`\`\n\n`;

        markdown += `## PH 데이터\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(this.extractedData.PH, null, 2)}\n\`\`\`\n\n`;

        markdown += `## Table 데이터\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(this.extractedData.Table, null, 2)}\n\`\`\`\n\n`;

        markdown += `## 추출 이력\n\n`;
        markdown += `| RAW ID | 상태 | 소요 시간 | 추출 시간 |\n`;
        markdown += `|--------|------|-----------|----------|\n`;

        this.extractionHistory.forEach(item => {
            const status = item.success ? '✅' : '❌';
            const duration = item.duration ? `${item.duration}s` : '-';
            markdown += `| ${item.rawId} | ${status} | ${duration} | ${item.extractedAt} |\n`;
        });

        return {
            filename: filename,
            content: markdown
        };
    }

    /**
     * 추출된 데이터 가져오기
     */
    getExtractedData() {
        return this.extractedData;
    }

    /**
     * 특정 타입의 데이터 가져오기
     */
    getData(dataType) {
        return this.extractedData[dataType] || {};
    }

    /**
     * 추출 초기화
     */
    clearExtractions() {
        this.extractedData = {
            CS: {},
            PH: {},
            Table: {}
        };
        this.extractionHistory = [];
        this.conflicts = [];
        console.log('✅ Extractions cleared');
    }

    /**
     * JSON 파일로 내보내기
     */
    exportToJSON(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_extracted_data_${timestamp}.json`;

        const data = {
            reportName: reportName,
            extractedAt: DateHelper.formatISO(),
            data: this.extractedData,
            conflicts: this.conflicts,
            history: this.extractionHistory
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Exported to JSON: ${filename}`);
    }
}

// Singleton instance
const dataExtractor = new DataExtractor();

export default dataExtractor;

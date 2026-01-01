/**
 * QC Validator
 * 품질 검증 및 오류 확인
 * GitHub Pages 배포용 - 전역 window 객체 사용
 */

// IIFE로 감싸서 const 선언이 전역 스코프와 충돌하지 않도록 함
(function() {
'use strict';

// 전역 의존성 fallback (config.js에서 이미 선언된 경우 재선언하지 않음)
if (!window.DateHelper) {
    window.DateHelper = {
        formatYYMMDD_hhmmss: (date = new Date()) => {
            const yy = String(date.getFullYear()).slice(-2);
            const MM = String(date.getMonth() + 1).padStart(2, '0');
            const DD = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');
            return `${yy}${MM}${DD}_${hh}${mm}${ss}`;
        },
        formatISO: (date = new Date()) => date.toISOString()
    };
}

// llmClient fallback (llm-client.js에서 이미 선언된 경우 재선언하지 않음)
if (!window.llmClient && !window.multiLLMClient) {
    window.llmClient = {
        sendMessage: async (prompt) => ({ content: 'Mock response', usage: {} })
    };
}

// 로컬 참조 (기존 코드 호환성 유지)
const DateHelper = window.DateHelper;
const llmClient = window.llmClient || window.multiLLMClient;

class QCValidator {
    constructor() {
        this.validationResults = [];
        this.issues = [];
    }

    /**
     * 전체 QC 검증 실행
     */
    async runFullQC(draftReport, sourceDocuments, extractedData) {
        console.log('🔍 Starting full QC validation...');

        this.issues = [];

        // 1. 데이터 일관성 검증
        await this.validateDataConsistency(draftReport, extractedData);

        // 2. 소스 문서 vs Draft 대조 검증
        await this.validateAgainstSources(draftReport, sourceDocuments);

        // 3. 표 번호 순서 검증
        this.validateTableNumbering(draftReport);

        // 4. 섹션 완성도 검증
        this.validateSectionCompleteness(draftReport);

        // 5. 서술문 검증
        await this.validateNarratives(draftReport, sourceDocuments);

        const issueCount = this.issues.length;

        console.log(`✅ QC validation complete: ${issueCount} issue(s) found`);

        return {
            success: true,
            issueCount: issueCount,
            issues: this.issues
        };
    }

    /**
     * 데이터 일관성 검증
     */
    async validateDataConsistency(draftReport, extractedData) {
        console.log('🔍 Validating data consistency...');

        const prompt = `당신은 제약 보고서 품질 검증 전문가입니다.

아래 Draft 보고서와 추출된 데이터를 비교하여 일관성을 검증하세요.

**Draft 보고서**:
${draftReport.substring(0, 5000)}

**추출된 데이터**:
${JSON.stringify(extractedData, null, 2)}

**검증 사항**:
1. Draft 보고서의 CS 데이터가 추출된 데이터와 일치하는지 확인
2. 날짜, 숫자, 성분명 등의 정확성 확인
3. 불일치하거나 누락된 데이터 확인

**Think step by step. Take your time.**

**응답 형식**:
\`\`\`json
{
  "issues": [
    {
      "type": "data_inconsistency",
      "severity": "high|medium|low",
      "field": "CS0_성분명",
      "expected": "예상값",
      "actual": "실제값",
      "description": "상세 설명"
    }
  ]
}
\`\`\``;

        const result = await llmClient.generateContent(prompt, {
            temperature: 0.1,
            maxOutputTokens: 4096
        });

        if (result.success) {
            try {
                const responseText = result.text || result.content || '';
                const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const validation = JSON.parse(jsonMatch[1]);
                    this.issues.push(...(validation.issues || []));
                }
            } catch (error) {
                console.error('❌ Failed to parse QC validation result:', error.message);
            }
        }
    }

    /**
     * 소스 문서 대조 검증
     */
    async validateAgainstSources(draftReport, sourceDocuments) {
        console.log('🔍 Validating against source documents...');

        const prompt = `당신은 제약 보고서 품질 검증 전문가입니다.

아래 Draft 보고서와 소스 문서를 비교하여 내용이 일치하는지 확인하세요.

**Draft 보고서 (일부)**:
${draftReport.substring(0, 3000)}

**소스 문서 (일부)**:
${sourceDocuments.substring(0, 3000)}

**검증 사항**:
1. Draft의 내용이 소스 문서의 내용과 상충되는 부분이 없는지 확인
2. 임의로 추가되거나 변형된 내용이 없는지 확인
3. 중요 데이터가 누락되지 않았는지 확인

**Ultrathink. Think hard. Think step by step. Take your time.**

**응답 형식**:
\`\`\`json
{
  "issues": [
    {
      "type": "source_conflict",
      "severity": "high|medium|low",
      "section": "섹션명",
      "sourceContent": "소스 문서 내용",
      "draftContent": "Draft 내용",
      "description": "상세 설명"
    }
  ]
}
\`\`\``;

        const result = await llmClient.generateContent(prompt, {
            temperature: 0.1,
            maxOutputTokens: 4096
        });

        if (result.success) {
            try {
                const responseText = result.text || result.content || '';
                const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const validation = JSON.parse(jsonMatch[1]);
                    this.issues.push(...(validation.issues || []));
                }
            } catch (error) {
                console.error('❌ Failed to parse source validation result:', error.message);
            }
        }
    }

    /**
     * 표 번호 순서 검증
     */
    validateTableNumbering(draftReport) {
        console.log('🔍 Validating table numbering...');

        // 표 번호 추출: "표1", "표2", "표3"...
        const tableRegex = /표(\d+)[_:：\s]/g;
        const matches = [...draftReport.matchAll(tableRegex)];

        if (matches.length === 0) {
            return; // 표가 없음
        }

        const tableNumbers = matches.map(m => parseInt(m[1]));
        const uniqueNumbers = [...new Set(tableNumbers)].sort((a, b) => a - b);

        // 순차적인지 확인
        for (let i = 0; i < uniqueNumbers.length; i++) {
            const expected = i + 1;
            const actual = uniqueNumbers[i];

            if (actual !== expected) {
                this.issues.push({
                    type: 'table_numbering',
                    severity: 'medium',
                    expected: expected,
                    actual: actual,
                    description: `표 번호 순서 오류: 표${expected}이 예상되지만 표${actual}이 발견됨`
                });
            }
        }

        // 중복 확인
        const duplicates = tableNumbers.filter((num, index) =>
            tableNumbers.indexOf(num) !== index
        );

        if (duplicates.length > 0) {
            const uniqueDuplicates = [...new Set(duplicates)];

            uniqueDuplicates.forEach(num => {
                this.issues.push({
                    type: 'table_duplicate',
                    severity: 'high',
                    tableNumber: num,
                    description: `중복된 표 번호: 표${num}`
                });
            });
        }

        console.log(`✅ Table numbering validated: ${matches.length} tables found`);
    }

    /**
     * 섹션 완성도 검증
     */
    validateSectionCompleteness(draftReport) {
        console.log('🔍 Validating section completeness...');

        // 필수 섹션 목록
        const requiredSections = [
            '1. 서론',
            '2. 전세계 판매 승인 현황',
            '3. 시판 후 사용 현황',
            '4. 안전성 정보의 변경',
            '5. 약물이상반응 정보 현황'
        ];

        requiredSections.forEach(section => {
            if (!draftReport.includes(section)) {
                this.issues.push({
                    type: 'missing_section',
                    severity: 'high',
                    section: section,
                    description: `필수 섹션 누락: ${section}`
                });
            }
        });

        // 빈 섹션 확인
        const emptySectionRegex = /##\s+([^\n]+)\n\n\s*##/g;
        const emptyMatches = [...draftReport.matchAll(emptySectionRegex)];

        emptyMatches.forEach(match => {
            this.issues.push({
                type: 'empty_section',
                severity: 'medium',
                section: match[1],
                description: `빈 섹션: ${match[1]}`
            });
        });

        console.log(`✅ Section completeness validated`);
    }

    /**
     * 서술문 검증
     */
    async validateNarratives(draftReport, sourceDocuments) {
        console.log('🔍 Validating narrative content...');

        const prompt = `당신은 제약 보고서 품질 검증 전문가입니다.

아래 Draft 보고서의 서술문이 소스 문서의 내용과 일치하는지 확인하세요.

**Draft 보고서 서술문 (일부)**:
${draftReport.substring(0, 2000)}

**소스 문서 (일부)**:
${sourceDocuments.substring(0, 2000)}

**검증 사항**:
1. 서술문의 내용이 소스 문서의 사실과 부합하는지 확인
2. 과장되거나 왜곡된 표현이 없는지 확인
3. 누락된 중요 정보가 없는지 확인

**Think step by step. Take your time.**

**응답 형식**:
\`\`\`json
{
  "issues": [
    {
      "type": "narrative_mismatch",
      "severity": "high|medium|low",
      "section": "섹션명",
      "narrative": "서술문 내용",
      "issue": "문제점 설명"
    }
  ]
}
\`\`\``;

        const result = await llmClient.generateContent(prompt, {
            temperature: 0.1,
            maxOutputTokens: 2048
        });

        if (result.success) {
            try {
                const responseText = result.text || result.content || '';
                const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const validation = JSON.parse(jsonMatch[1]);
                    this.issues.push(...(validation.issues || []));
                }
            } catch (error) {
                console.error('❌ Failed to parse narrative validation result:', error.message);
            }
        }
    }

    /**
     * 이슈 필터링
     */
    filterIssues(severity = null, type = null) {
        let filtered = this.issues;

        if (severity) {
            filtered = filtered.filter(issue => issue.severity === severity);
        }

        if (type) {
            filtered = filtered.filter(issue => issue.type === type);
        }

        return filtered;
    }

    /**
     * 이슈 통계
     */
    getStatistics() {
        const stats = {
            total: this.issues.length,
            high: this.filterIssues('high').length,
            medium: this.filterIssues('medium').length,
            low: this.filterIssues('low').length,
            byType: {}
        };

        // 타입별 카운트
        this.issues.forEach(issue => {
            if (!stats.byType[issue.type]) {
                stats.byType[issue.type] = 0;
            }
            stats.byType[issue.type]++;
        });

        return stats;
    }

    /**
     * QC 보고서 생성
     */
    generateQCReport(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_QC보고서_${timestamp}.md`;

        const stats = this.getStatistics();

        let markdown = `# QC 검증 보고서: ${reportName}\n\n`;
        markdown += `**검증 시간**: ${DateHelper.formatISO()}\n\n`;

        markdown += `## 통계\n\n`;
        markdown += `- 총 이슈: ${stats.total}건\n`;
        markdown += `- 🔴 High: ${stats.high}건\n`;
        markdown += `- 🟡 Medium: ${stats.medium}건\n`;
        markdown += `- 🟢 Low: ${stats.low}건\n\n`;

        markdown += `### 타입별 이슈\n\n`;
        Object.entries(stats.byType).forEach(([type, count]) => {
            markdown += `- ${type}: ${count}건\n`;
        });

        markdown += `\n---\n\n`;

        if (this.issues.length === 0) {
            markdown += `## ✅ 모든 검증 통과\n\n`;
            markdown += `발견된 이슈가 없습니다. 보고서 품질이 우수합니다.\n\n`;
        } else {
            markdown += `## 발견된 이슈\n\n`;

            // High 이슈
            const highIssues = this.filterIssues('high');
            if (highIssues.length > 0) {
                markdown += `### 🔴 High Severity (${highIssues.length}건)\n\n`;

                highIssues.forEach((issue, index) => {
                    markdown += `#### ${index + 1}. ${issue.type}\n\n`;
                    markdown += `**설명**: ${issue.description}\n\n`;

                    if (issue.field) markdown += `- **필드**: ${issue.field}\n`;
                    if (issue.expected) markdown += `- **예상값**: ${issue.expected}\n`;
                    if (issue.actual) markdown += `- **실제값**: ${issue.actual}\n`;

                    markdown += `\n`;
                });

                markdown += `---\n\n`;
            }

            // Medium 이슈
            const mediumIssues = this.filterIssues('medium');
            if (mediumIssues.length > 0) {
                markdown += `### 🟡 Medium Severity (${mediumIssues.length}건)\n\n`;

                mediumIssues.forEach((issue, index) => {
                    markdown += `#### ${index + 1}. ${issue.type}\n\n`;
                    markdown += `**설명**: ${issue.description}\n\n`;
                });

                markdown += `---\n\n`;
            }

            // Low 이슈
            const lowIssues = this.filterIssues('low');
            if (lowIssues.length > 0) {
                markdown += `### 🟢 Low Severity (${lowIssues.length}건)\n\n`;

                lowIssues.forEach((issue, index) => {
                    markdown += `- ${issue.description}\n`;
                });

                markdown += `\n`;
            }
        }

        return {
            filename: filename,
            content: markdown,
            statistics: stats
        };
    }

    /**
     * QC 보고서 다운로드
     */
    downloadQCReport(reportName) {
        const report = this.generateQCReport(reportName);

        const blob = new Blob([report.content], {
            type: 'text/markdown;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = report.filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded QC report: ${report.filename}`);
        return true;
    }

    /**
     * 이슈 목록 가져오기
     */
    getIssues() {
        return this.issues;
    }

    /**
     * QC 통과 여부
     */
    isPassed() {
        const highIssues = this.filterIssues('high');
        return highIssues.length === 0;
    }

    /**
     * 검증 초기화
     */
    clearValidation() {
        this.issues = [];
        this.validationResults = [];
        console.log('✅ QC validation cleared');
    }
}

// Singleton instance
const qcValidator = new QCValidator();

// 전역으로 내보내기 (ES6 모듈 대신 window 객체 사용)
if (typeof window !== 'undefined') {
    window.qcValidator = qcValidator;
    window.QCValidator = QCValidator;
}

})(); // IIFE 종료

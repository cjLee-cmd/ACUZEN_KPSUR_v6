/**
 * Review Manager
 * 섹션별 리뷰 및 수정 관리
 */

import { DateHelper } from './config.js';
import supabaseClient from './supabase-client.js';
import authManager from './auth.js';

class ReviewManager {
    constructor() {
        this.reviewHistory = [];
        this.currentReviewSession = null;
    }

    /**
     * 리뷰 세션 시작
     */
    startReviewSession(reportId, reportName) {
        this.currentReviewSession = {
            reportId: reportId,
            reportName: reportName,
            startedAt: DateHelper.formatISO(),
            reviewer: authManager.getCurrentUser(),
            changes: []
        };

        console.log(`✅ Review session started: ${reportName}`);
        return this.currentReviewSession;
    }

    /**
     * 섹션 수정 기록
     * @param {string} sectionName - 섹션 이름 (표시용)
     * @param {string} beforeContent - 수정 전 내용
     * @param {string} afterContent - 수정 후 내용
     * @param {string} comment - 수정 사유
     * @param {string|null} sectionId - 섹션 ID (report_sections.id FK)
     */
    recordChange(sectionName, beforeContent, afterContent, comment = '', sectionId = null) {
        if (!this.currentReviewSession) {
            console.error('❌ No active review session');
            return false;
        }

        const change = {
            sectionName: sectionName,      // 표시용 (로컬)
            sectionId: sectionId,          // DB FK
            beforeContent: beforeContent,
            afterContent: afterContent,
            comment: comment,
            changedAt: DateHelper.formatISO(),
            reviewer: this.currentReviewSession.reviewer
        };

        this.currentReviewSession.changes.push(change);

        console.log(`✅ Change recorded: ${sectionName}`);
        return true;
    }

    /**
     * 변경사항 저장 (Supabase)
     */
    async saveChangesToDB() {
        if (!this.currentReviewSession) {
            console.error('❌ No active review session');
            return { success: false, error: 'No active session' };
        }

        try {
            const changes = this.currentReviewSession.changes;

            for (const change of changes) {
                // DB 스키마에 맞게 컬럼명 매핑
                const changeData = {
                    report_id: this.currentReviewSession.reportId,
                    section_id: change.sectionId || null,  // FK: report_sections.id
                    changed_by: change.reviewer?.id || null,  // FK: users.id
                    content_before: change.beforeContent,
                    content_after: change.afterContent,
                    change_type: this.determineChangeType(change.beforeContent, change.afterContent),
                    comment: change.comment || null
                    // created_at: 자동 생성됨
                };

                const result = await supabaseClient.query('review_changes')
                    .insert([changeData]);

                if (result.error) {
                    throw new Error(result.error.message);
                }
            }

            console.log(`✅ ${changes.length} changes saved to database`);

            return {
                success: true,
                changeCount: changes.length
            };

        } catch (error) {
            console.error('❌ Save changes failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 리뷰 세션 종료
     */
    async endReviewSession() {
        if (!this.currentReviewSession) {
            console.error('❌ No active review session');
            return { success: false };
        }

        // 변경사항 저장
        const saveResult = await this.saveChangesToDB();

        if (saveResult.success) {
            // 리뷰 이력에 추가
            this.reviewHistory.push({
                ...this.currentReviewSession,
                endedAt: DateHelper.formatISO()
            });

            const sessionInfo = this.currentReviewSession;
            this.currentReviewSession = null;

            console.log(`✅ Review session ended: ${sessionInfo.reportName}`);

            return {
                success: true,
                session: sessionInfo
            };
        }

        return saveResult;
    }

    /**
     * 변경사항 조회 (Supabase)
     */
    async getChangeHistory(reportId) {
        try {
            const result = await supabaseClient.query('review_changes')
                .select('*')
                .eq('report_id', reportId)
                .order('created_at', { ascending: false });

            if (result.error) {
                throw new Error(result.error.message);
            }

            console.log(`✅ Retrieved ${result.data.length} change records`);

            return {
                success: true,
                changes: result.data
            };

        } catch (error) {
            console.error('❌ Get change history failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 특정 섹션의 변경 이력 조회
     */
    async getSectionChangeHistory(reportId, sectionName) {
        try {
            const result = await supabaseClient.query('review_changes')
                .select('*')
                .eq('report_id', reportId)
                .eq('section_name', sectionName)
                .order('created_at', { ascending: false });

            if (result.error) {
                throw new Error(result.error.message);
            }

            console.log(`✅ Retrieved ${result.data.length} changes for ${sectionName}`);

            return {
                success: true,
                changes: result.data
            };

        } catch (error) {
            console.error('❌ Get section change history failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 변경 유형 결정 (DB 스키마: 'Edit', 'Add', 'Delete')
     */
    determineChangeType(beforeContent, afterContent) {
        if (!beforeContent || beforeContent.trim() === '') {
            return 'Add';
        }
        if (!afterContent || afterContent.trim() === '') {
            return 'Delete';
        }
        return 'Edit';
    }

    /**
     * 변경사항 비교 (diff)
     */
    generateDiff(beforeContent, afterContent) {
        // 간단한 라인별 비교
        const beforeLines = beforeContent.split('\n');
        const afterLines = afterContent.split('\n');

        const diff = [];
        const maxLen = Math.max(beforeLines.length, afterLines.length);

        for (let i = 0; i < maxLen; i++) {
            const before = beforeLines[i] || '';
            const after = afterLines[i] || '';

            if (before !== after) {
                diff.push({
                    lineNumber: i + 1,
                    before: before,
                    after: after,
                    type: before === '' ? 'added' : (after === '' ? 'removed' : 'modified')
                });
            }
        }

        return diff;
    }

    /**
     * 변경사항 요약 생성
     */
    generateChangeSummary(reportName) {
        if (!this.currentReviewSession) {
            console.error('❌ No active review session');
            return null;
        }

        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_리뷰변경사항_${timestamp}.md`;

        let markdown = `# 리뷰 변경사항: ${reportName}\n\n`;
        markdown += `**리뷰어**: ${this.currentReviewSession.reviewer.name}\n`;
        markdown += `**시작 시간**: ${this.currentReviewSession.startedAt}\n`;
        markdown += `**총 변경**: ${this.currentReviewSession.changes.length}건\n\n`;

        markdown += `---\n\n`;

        this.currentReviewSession.changes.forEach((change, index) => {
            markdown += `## ${index + 1}. ${change.sectionName}\n\n`;
            markdown += `**변경 시간**: ${change.changedAt}\n`;

            if (change.comment) {
                markdown += `**코멘트**: ${change.comment}\n`;
            }

            markdown += `\n### 변경 전\n\n\`\`\`\n${change.beforeContent}\n\`\`\`\n\n`;
            markdown += `### 변경 후\n\n\`\`\`\n${change.afterContent}\n\`\`\`\n\n`;

            // Diff 표시
            const diff = this.generateDiff(change.beforeContent, change.afterContent);

            if (diff.length > 0) {
                markdown += `### 변경 내용\n\n`;
                markdown += `| 라인 | 타입 | 변경 전 | 변경 후 |\n`;
                markdown += `|------|------|---------|--------|\n`;

                diff.forEach(d => {
                    const type = d.type === 'added' ? '➕' : (d.type === 'removed' ? '➖' : '✏️');
                    markdown += `| ${d.lineNumber} | ${type} | ${d.before} | ${d.after} |\n`;
                });

                markdown += `\n`;
            }

            markdown += `---\n\n`;
        });

        return {
            filename: filename,
            content: markdown
        };
    }

    /**
     * 변경사항 다운로드
     */
    downloadChangeSummary(reportName) {
        const summary = this.generateChangeSummary(reportName);

        if (!summary) {
            return false;
        }

        const blob = new Blob([summary.content], {
            type: 'text/markdown;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = summary.filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Downloaded: ${summary.filename}`);
        return true;
    }

    /**
     * 현재 세션 정보 가져오기
     */
    getCurrentSession() {
        return this.currentReviewSession;
    }

    /**
     * 리뷰 이력 가져오기
     */
    getReviewHistory() {
        return this.reviewHistory;
    }

    /**
     * 통계 정보
     */
    getStatistics() {
        if (!this.currentReviewSession) {
            return null;
        }

        const changes = this.currentReviewSession.changes;

        return {
            totalChanges: changes.length,
            sectionsModified: [...new Set(changes.map(c => c.sectionName))].length,
            reviewer: this.currentReviewSession.reviewer.name,
            duration: this.getDuration()
        };
    }

    /**
     * 세션 경과 시간
     */
    getDuration() {
        if (!this.currentReviewSession) {
            return 0;
        }

        const start = new Date(this.currentReviewSession.startedAt);
        const now = new Date();
        const durationMs = now - start;
        const durationMin = Math.floor(durationMs / (1000 * 60));

        return durationMin;
    }

    /**
     * 변경사항 취소
     */
    undoLastChange() {
        if (!this.currentReviewSession || this.currentReviewSession.changes.length === 0) {
            console.warn('⚠️ No changes to undo');
            return null;
        }

        const lastChange = this.currentReviewSession.changes.pop();
        console.log(`✅ Undone: ${lastChange.sectionName}`);

        return lastChange;
    }

    /**
     * 세션 초기화
     */
    clearSession() {
        this.currentReviewSession = null;
        console.log('✅ Review session cleared');
    }
}

// Singleton instance
const reviewManager = new ReviewManager();

export default reviewManager;

/**
 * Diff Viewer Component
 * 원본 vs 생성된 문서 비교 뷰어
 * GitHub Pages 정적 호스팅 호환
 */

import { Storage, DateHelper } from './config.js';

// Diff 타입 정의
const DIFF_TYPES = {
    ADDED: 'added',
    REMOVED: 'removed',
    MODIFIED: 'modified',
    UNCHANGED: 'unchanged'
};

class DiffViewer {
    constructor(container) {
        this.container = typeof container === 'string'
            ? document.getElementById(container)
            : container;
        this.original = '';
        this.modified = '';
        this.diffs = [];
        this.viewMode = 'split'; // 'split', 'unified', 'inline'
        this.highlightChanges = true;
        this.syncScroll = true;
    }

    /**
     * 문서 설정
     */
    setDocuments(original, modified) {
        this.original = original || '';
        this.modified = modified || '';
        this.diffs = this.computeDiff(this.original, this.modified);
        this.render();
    }

    /**
     * Diff 계산 (라인 기반)
     */
    computeDiff(original, modified) {
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');
        const diffs = [];

        // Simple LCS-based diff algorithm
        const lcs = this.longestCommonSubsequence(originalLines, modifiedLines);

        let origIdx = 0;
        let modIdx = 0;
        let lcsIdx = 0;

        while (origIdx < originalLines.length || modIdx < modifiedLines.length) {
            if (lcsIdx < lcs.length &&
                origIdx < originalLines.length &&
                originalLines[origIdx] === lcs[lcsIdx]) {

                if (modIdx < modifiedLines.length && modifiedLines[modIdx] === lcs[lcsIdx]) {
                    // 동일한 라인
                    diffs.push({
                        type: DIFF_TYPES.UNCHANGED,
                        original: originalLines[origIdx],
                        modified: modifiedLines[modIdx],
                        originalLine: origIdx + 1,
                        modifiedLine: modIdx + 1
                    });
                    origIdx++;
                    modIdx++;
                    lcsIdx++;
                } else {
                    // 추가된 라인
                    diffs.push({
                        type: DIFF_TYPES.ADDED,
                        original: null,
                        modified: modifiedLines[modIdx],
                        originalLine: null,
                        modifiedLine: modIdx + 1
                    });
                    modIdx++;
                }
            } else if (modIdx < modifiedLines.length &&
                       lcsIdx < lcs.length &&
                       modifiedLines[modIdx] === lcs[lcsIdx]) {
                // 삭제된 라인
                diffs.push({
                    type: DIFF_TYPES.REMOVED,
                    original: originalLines[origIdx],
                    modified: null,
                    originalLine: origIdx + 1,
                    modifiedLine: null
                });
                origIdx++;
            } else if (origIdx < originalLines.length && modIdx < modifiedLines.length) {
                // 수정된 라인
                diffs.push({
                    type: DIFF_TYPES.MODIFIED,
                    original: originalLines[origIdx],
                    modified: modifiedLines[modIdx],
                    originalLine: origIdx + 1,
                    modifiedLine: modIdx + 1,
                    wordDiffs: this.computeWordDiff(originalLines[origIdx], modifiedLines[modIdx])
                });
                origIdx++;
                modIdx++;
            } else if (origIdx < originalLines.length) {
                // 삭제된 라인
                diffs.push({
                    type: DIFF_TYPES.REMOVED,
                    original: originalLines[origIdx],
                    modified: null,
                    originalLine: origIdx + 1,
                    modifiedLine: null
                });
                origIdx++;
            } else if (modIdx < modifiedLines.length) {
                // 추가된 라인
                diffs.push({
                    type: DIFF_TYPES.ADDED,
                    original: null,
                    modified: modifiedLines[modIdx],
                    originalLine: null,
                    modifiedLine: modIdx + 1
                });
                modIdx++;
            }
        }

        return diffs;
    }

    /**
     * LCS (Longest Common Subsequence) 계산
     */
    longestCommonSubsequence(arr1, arr2) {
        const m = arr1.length;
        const n = arr2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // 역추적
        const lcs = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (arr1[i - 1] === arr2[j - 1]) {
                lcs.unshift(arr1[i - 1]);
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return lcs;
    }

    /**
     * 단어 수준 Diff 계산
     */
    computeWordDiff(originalLine, modifiedLine) {
        const originalWords = (originalLine || '').split(/\s+/);
        const modifiedWords = (modifiedLine || '').split(/\s+/);
        const lcs = this.longestCommonSubsequence(originalWords, modifiedWords);

        const diffs = [];
        let origIdx = 0;
        let modIdx = 0;
        let lcsIdx = 0;

        while (origIdx < originalWords.length || modIdx < modifiedWords.length) {
            if (lcsIdx < lcs.length && originalWords[origIdx] === lcs[lcsIdx]) {
                if (modifiedWords[modIdx] === lcs[lcsIdx]) {
                    diffs.push({ type: 'unchanged', text: originalWords[origIdx] });
                    origIdx++;
                    modIdx++;
                    lcsIdx++;
                } else {
                    diffs.push({ type: 'added', text: modifiedWords[modIdx] });
                    modIdx++;
                }
            } else if (modIdx < modifiedWords.length &&
                       lcsIdx < lcs.length &&
                       modifiedWords[modIdx] === lcs[lcsIdx]) {
                diffs.push({ type: 'removed', text: originalWords[origIdx] });
                origIdx++;
            } else if (origIdx < originalWords.length) {
                diffs.push({ type: 'removed', text: originalWords[origIdx] });
                origIdx++;
            } else if (modIdx < modifiedWords.length) {
                diffs.push({ type: 'added', text: modifiedWords[modIdx] });
                modIdx++;
            }
        }

        return diffs;
    }

    /**
     * 뷰 모드 설정
     */
    setViewMode(mode) {
        this.viewMode = mode;
        this.render();
    }

    /**
     * 렌더링
     */
    render() {
        if (!this.container) return;

        switch (this.viewMode) {
            case 'split':
                this.renderSplitView();
                break;
            case 'unified':
                this.renderUnifiedView();
                break;
            case 'inline':
                this.renderInlineView();
                break;
        }

        if (this.syncScroll) {
            this.setupSyncScroll();
        }
    }

    /**
     * Split View 렌더링
     */
    renderSplitView() {
        const stats = this.getStats();

        this.container.innerHTML = `
            <div class="diff-viewer-header">
                <div class="diff-stats">
                    <span class="diff-stat added">+${stats.added}</span>
                    <span class="diff-stat removed">-${stats.removed}</span>
                    <span class="diff-stat modified">~${stats.modified}</span>
                </div>
                <div class="diff-view-toggle">
                    <button class="view-btn ${this.viewMode === 'split' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('split')">분할</button>
                    <button class="view-btn ${this.viewMode === 'unified' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('unified')">통합</button>
                    <button class="view-btn ${this.viewMode === 'inline' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('inline')">인라인</button>
                </div>
            </div>
            <div class="diff-split-container">
                <div class="diff-panel diff-original" id="diffOriginal">
                    <div class="diff-panel-header">
                        <span class="diff-panel-title">원본 (Phase 1)</span>
                    </div>
                    <div class="diff-panel-content" id="diffOriginalContent">
                        ${this.renderOriginalLines()}
                    </div>
                </div>
                <div class="diff-panel diff-modified" id="diffModified">
                    <div class="diff-panel-header">
                        <span class="diff-panel-title">개선됨 (Phase 2 적용)</span>
                    </div>
                    <div class="diff-panel-content" id="diffModifiedContent">
                        ${this.renderModifiedLines()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 원본 라인 렌더링
     */
    renderOriginalLines() {
        return this.diffs.map(diff => {
            if (diff.type === DIFF_TYPES.ADDED) {
                return `<div class="diff-line diff-placeholder">
                    <span class="diff-line-number"></span>
                    <span class="diff-line-content"></span>
                </div>`;
            }

            const lineClass = diff.type === DIFF_TYPES.REMOVED ? 'diff-removed' :
                              diff.type === DIFF_TYPES.MODIFIED ? 'diff-modified-old' : '';

            return `<div class="diff-line ${lineClass}">
                <span class="diff-line-number">${diff.originalLine || ''}</span>
                <span class="diff-line-content">${this.escapeHtml(diff.original || '')}</span>
            </div>`;
        }).join('');
    }

    /**
     * 수정본 라인 렌더링
     */
    renderModifiedLines() {
        return this.diffs.map(diff => {
            if (diff.type === DIFF_TYPES.REMOVED) {
                return `<div class="diff-line diff-placeholder">
                    <span class="diff-line-number"></span>
                    <span class="diff-line-content"></span>
                </div>`;
            }

            const lineClass = diff.type === DIFF_TYPES.ADDED ? 'diff-added' :
                              diff.type === DIFF_TYPES.MODIFIED ? 'diff-modified-new' : '';

            return `<div class="diff-line ${lineClass}">
                <span class="diff-line-number">${diff.modifiedLine || ''}</span>
                <span class="diff-line-content">${this.escapeHtml(diff.modified || '')}</span>
            </div>`;
        }).join('');
    }

    /**
     * Unified View 렌더링
     */
    renderUnifiedView() {
        const stats = this.getStats();

        this.container.innerHTML = `
            <div class="diff-viewer-header">
                <div class="diff-stats">
                    <span class="diff-stat added">+${stats.added}</span>
                    <span class="diff-stat removed">-${stats.removed}</span>
                    <span class="diff-stat modified">~${stats.modified}</span>
                </div>
                <div class="diff-view-toggle">
                    <button class="view-btn ${this.viewMode === 'split' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('split')">분할</button>
                    <button class="view-btn ${this.viewMode === 'unified' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('unified')">통합</button>
                    <button class="view-btn ${this.viewMode === 'inline' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('inline')">인라인</button>
                </div>
            </div>
            <div class="diff-unified-container">
                ${this.renderUnifiedLines()}
            </div>
        `;
    }

    /**
     * Unified 라인 렌더링
     */
    renderUnifiedLines() {
        return this.diffs.map(diff => {
            switch (diff.type) {
                case DIFF_TYPES.ADDED:
                    return `<div class="diff-line diff-added">
                        <span class="diff-line-prefix">+</span>
                        <span class="diff-line-number"></span>
                        <span class="diff-line-number">${diff.modifiedLine}</span>
                        <span class="diff-line-content">${this.escapeHtml(diff.modified)}</span>
                    </div>`;
                case DIFF_TYPES.REMOVED:
                    return `<div class="diff-line diff-removed">
                        <span class="diff-line-prefix">-</span>
                        <span class="diff-line-number">${diff.originalLine}</span>
                        <span class="diff-line-number"></span>
                        <span class="diff-line-content">${this.escapeHtml(diff.original)}</span>
                    </div>`;
                case DIFF_TYPES.MODIFIED:
                    return `
                        <div class="diff-line diff-modified-old">
                            <span class="diff-line-prefix">-</span>
                            <span class="diff-line-number">${diff.originalLine}</span>
                            <span class="diff-line-number"></span>
                            <span class="diff-line-content">${this.escapeHtml(diff.original)}</span>
                        </div>
                        <div class="diff-line diff-modified-new">
                            <span class="diff-line-prefix">+</span>
                            <span class="diff-line-number"></span>
                            <span class="diff-line-number">${diff.modifiedLine}</span>
                            <span class="diff-line-content">${this.escapeHtml(diff.modified)}</span>
                        </div>`;
                default:
                    return `<div class="diff-line">
                        <span class="diff-line-prefix"> </span>
                        <span class="diff-line-number">${diff.originalLine}</span>
                        <span class="diff-line-number">${diff.modifiedLine}</span>
                        <span class="diff-line-content">${this.escapeHtml(diff.original)}</span>
                    </div>`;
            }
        }).join('');
    }

    /**
     * Inline View 렌더링
     */
    renderInlineView() {
        const stats = this.getStats();

        this.container.innerHTML = `
            <div class="diff-viewer-header">
                <div class="diff-stats">
                    <span class="diff-stat added">+${stats.added}</span>
                    <span class="diff-stat removed">-${stats.removed}</span>
                    <span class="diff-stat modified">~${stats.modified}</span>
                </div>
                <div class="diff-view-toggle">
                    <button class="view-btn ${this.viewMode === 'split' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('split')">분할</button>
                    <button class="view-btn ${this.viewMode === 'unified' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('unified')">통합</button>
                    <button class="view-btn ${this.viewMode === 'inline' ? 'active' : ''}"
                            onclick="diffViewer.setViewMode('inline')">인라인</button>
                </div>
            </div>
            <div class="diff-inline-container">
                ${this.renderInlineLines()}
            </div>
        `;
    }

    /**
     * Inline 라인 렌더링 (단어 수준 하이라이트)
     */
    renderInlineLines() {
        return this.diffs.map(diff => {
            if (diff.type === DIFF_TYPES.MODIFIED && diff.wordDiffs) {
                const content = diff.wordDiffs.map(wd => {
                    if (wd.type === 'removed') {
                        return `<span class="diff-word-removed">${this.escapeHtml(wd.text)}</span>`;
                    } else if (wd.type === 'added') {
                        return `<span class="diff-word-added">${this.escapeHtml(wd.text)}</span>`;
                    }
                    return this.escapeHtml(wd.text);
                }).join(' ');

                return `<div class="diff-line diff-modified-inline">
                    <span class="diff-line-number">${diff.modifiedLine}</span>
                    <span class="diff-line-content">${content}</span>
                </div>`;
            }

            const lineClass = diff.type === DIFF_TYPES.ADDED ? 'diff-added' :
                              diff.type === DIFF_TYPES.REMOVED ? 'diff-removed' : '';
            const content = diff.modified || diff.original || '';
            const lineNum = diff.modifiedLine || diff.originalLine || '';

            return `<div class="diff-line ${lineClass}">
                <span class="diff-line-number">${lineNum}</span>
                <span class="diff-line-content">${this.escapeHtml(content)}</span>
            </div>`;
        }).join('');
    }

    /**
     * 스크롤 동기화 설정
     */
    setupSyncScroll() {
        const originalPanel = document.getElementById('diffOriginalContent');
        const modifiedPanel = document.getElementById('diffModifiedContent');

        if (originalPanel && modifiedPanel) {
            let isSyncing = false;

            originalPanel.addEventListener('scroll', () => {
                if (!isSyncing) {
                    isSyncing = true;
                    modifiedPanel.scrollTop = originalPanel.scrollTop;
                    setTimeout(() => isSyncing = false, 50);
                }
            });

            modifiedPanel.addEventListener('scroll', () => {
                if (!isSyncing) {
                    isSyncing = true;
                    originalPanel.scrollTop = modifiedPanel.scrollTop;
                    setTimeout(() => isSyncing = false, 50);
                }
            });
        }
    }

    /**
     * 통계 조회
     */
    getStats() {
        return {
            total: this.diffs.length,
            added: this.diffs.filter(d => d.type === DIFF_TYPES.ADDED).length,
            removed: this.diffs.filter(d => d.type === DIFF_TYPES.REMOVED).length,
            modified: this.diffs.filter(d => d.type === DIFF_TYPES.MODIFIED).length,
            unchanged: this.diffs.filter(d => d.type === DIFF_TYPES.UNCHANGED).length
        };
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * CSS 스타일 반환 (inline 사용 시)
     */
    static getStyles() {
        return `
            .diff-viewer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: var(--section-bg, #f8fafc);
                border-bottom: 1px solid var(--border-color, #e2e8f0);
            }

            .diff-stats {
                display: flex;
                gap: 12px;
            }

            .diff-stat {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 4px;
            }

            .diff-stat.added {
                background: #D1FAE5;
                color: #065F46;
            }

            .diff-stat.removed {
                background: #FEE2E2;
                color: #991B1B;
            }

            .diff-stat.modified {
                background: #FEF3C7;
                color: #92400E;
            }

            [data-theme="dark"] .diff-stat.added {
                background: rgba(16, 185, 129, 0.2);
                color: #34d399;
            }

            [data-theme="dark"] .diff-stat.removed {
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
            }

            [data-theme="dark"] .diff-stat.modified {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
            }

            .diff-view-toggle {
                display: flex;
                gap: 4px;
            }

            .view-btn {
                padding: 6px 12px;
                font-size: 12px;
                border: 1px solid var(--border-color, #e2e8f0);
                background: var(--card-bg, white);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .view-btn.active {
                background: #25739B;
                color: white;
                border-color: #25739B;
            }

            .diff-split-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
                height: 500px;
            }

            .diff-panel {
                display: flex;
                flex-direction: column;
                border-right: 1px solid var(--border-color, #e2e8f0);
            }

            .diff-panel:last-child {
                border-right: none;
            }

            .diff-panel-header {
                padding: 8px 12px;
                background: var(--section-bg, #f8fafc);
                border-bottom: 1px solid var(--border-color, #e2e8f0);
                font-size: 12px;
                font-weight: 600;
                color: var(--text-secondary, #64748b);
            }

            .diff-panel-content {
                flex: 1;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }

            .diff-unified-container,
            .diff-inline-container {
                height: 500px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }

            .diff-line {
                display: flex;
                padding: 0 12px;
                line-height: 1.6;
                min-height: 24px;
            }

            .diff-line-prefix {
                width: 20px;
                flex-shrink: 0;
                color: var(--text-muted, #94a3b8);
            }

            .diff-line-number {
                width: 40px;
                flex-shrink: 0;
                color: var(--text-muted, #94a3b8);
                text-align: right;
                padding-right: 8px;
                user-select: none;
            }

            .diff-line-content {
                flex: 1;
                white-space: pre-wrap;
                word-break: break-all;
            }

            .diff-line.diff-added {
                background: #D1FAE5;
            }

            .diff-line.diff-removed {
                background: #FEE2E2;
            }

            .diff-line.diff-modified-old {
                background: #FEE2E2;
            }

            .diff-line.diff-modified-new {
                background: #D1FAE5;
            }

            .diff-line.diff-modified-inline {
                background: #FEF3C7;
            }

            .diff-line.diff-placeholder {
                background: var(--section-bg, #f8fafc);
            }

            [data-theme="dark"] .diff-line.diff-added {
                background: rgba(16, 185, 129, 0.15);
            }

            [data-theme="dark"] .diff-line.diff-removed {
                background: rgba(239, 68, 68, 0.15);
            }

            [data-theme="dark"] .diff-line.diff-modified-old {
                background: rgba(239, 68, 68, 0.15);
            }

            [data-theme="dark"] .diff-line.diff-modified-new {
                background: rgba(16, 185, 129, 0.15);
            }

            [data-theme="dark"] .diff-line.diff-modified-inline {
                background: rgba(251, 191, 36, 0.15);
            }

            .diff-word-added {
                background: #34D399;
                padding: 0 2px;
                border-radius: 2px;
            }

            .diff-word-removed {
                background: #F87171;
                padding: 0 2px;
                border-radius: 2px;
                text-decoration: line-through;
            }

            [data-theme="dark"] .diff-word-added {
                background: rgba(52, 211, 153, 0.4);
            }

            [data-theme="dark"] .diff-word-removed {
                background: rgba(248, 113, 113, 0.4);
            }
        `;
    }
}

// Export
export default DiffViewer;
export { DIFF_TYPES };

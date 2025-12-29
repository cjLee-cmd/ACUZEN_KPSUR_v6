/**
 * AppLayout - 메인 애플리케이션 레이아웃
 * 우측 사이드바에 워크플로우 진행 상황 표시
 */

class AppLayout {
    constructor(options = {}) {
        this.currentStage = options.currentStage || 1;
        this.reportName = options.reportName || '보고서명 없음';
        this.userName = options.userName || '사용자';
        this.userRole = options.userRole || 'Author';
        this.deploymentMode = options.deploymentMode || 'test'; // 'test' or 'production'
        this.hideWorkflowSidebar = options.hideWorkflowSidebar || false; // 워크플로우 사이드바 숨김 옵션

        this.stages = [
            { id: 1, name: 'Login', label: '로그인', icon: '🔐' },
            { id: 2, name: 'Report Status', label: '보고서 상태', icon: '📋' },
            { id: 3, name: 'File Upload', label: '파일 업로드', icon: '📤' },
            { id: 4, name: 'Markdown', label: 'MD 변환', icon: '🔄' },
            { id: 5, name: 'Data Extract', label: '데이터 추출', icon: '⚙️' },
            { id: 6, name: 'Template', label: '템플릿 작성', icon: '📄' },
            { id: 7, name: 'Review', label: '리뷰', icon: '✏️' },
            { id: 8, name: 'QC', label: 'QC 검증', icon: '✅' },
            { id: 9, name: 'Output', label: '최종 출력', icon: '📤' }
        ];
    }

    /**
     * 전체 레이아웃 HTML 생성
     */
    render(contentHtml) {
        return `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="../styles/globals.css">
                <link rel="stylesheet" href="../styles/layout.css">
            </head>
            <body>
                <div class="app-layout">
                    ${this.renderHeader()}
                    <div class="app-content">
                        <main class="main-content${this.hideWorkflowSidebar ? ' full-width' : ''}">
                            ${contentHtml}
                        </main>
                        ${this.hideWorkflowSidebar ? '' : this.renderWorkflowSidebar()}
                    </div>
                    ${this.renderFooter()}
                </div>
            </body>
            </html>
        `;
    }

    /**
     * 헤더 렌더링
     */
    renderHeader() {
        const deploymentBadge = this.deploymentMode === 'production'
            ? '<span class="deployment-badge production">프로덕션</span>'
            : '<span class="deployment-badge test">테스트</span>';

        return `
            <header class="app-header">
                <div class="header-left">
                    <div class="logo">
                        <span class="logo-text">KPSUR AGENT</span>
                        <span class="logo-subtitle">ACUZEN AI</span>
                    </div>
                    ${deploymentBadge}
                </div>

                <div class="header-center">
                    <div class="breadcrumb">
                        <span class="breadcrumb-item">${this.reportName}</span>
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-item active">${this.stages.find(s => s.id === this.currentStage)?.label}</span>
                    </div>
                </div>

                <div class="header-right">
                    <div class="user-menu">
                        <div class="user-avatar">${this.userName.charAt(0)}</div>
                        <div class="user-info">
                            <div class="user-name">${this.userName}</div>
                            <div class="user-role">${this.userRole}</div>
                        </div>
                        <button class="user-menu-toggle">▼</button>
                    </div>
                </div>
            </header>
        `;
    }

    /**
     * 워크플로우 사이드바 렌더링 (우측)
     */
    renderWorkflowSidebar() {
        const stagesHtml = this.stages.map(stage => {
            const isCompleted = stage.id < this.currentStage;
            const isCurrent = stage.id === this.currentStage;
            const isPending = stage.id > this.currentStage;

            let statusClass = '';
            let statusIcon = '';

            if (isCompleted) {
                statusClass = 'completed';
                statusIcon = '✓';
            } else if (isCurrent) {
                statusClass = 'current';
                statusIcon = '◉';
            } else {
                statusClass = 'pending';
                statusIcon = '○';
            }

            return `
                <div class="workflow-stage ${statusClass}">
                    <div class="stage-icon">${stage.icon}</div>
                    <div class="stage-info">
                        <div class="stage-name">Stage ${stage.id}</div>
                        <div class="stage-label">${stage.label}</div>
                    </div>
                    <div class="stage-status">${statusIcon}</div>
                </div>
            `;
        }).join('');

        const progress = ((this.currentStage - 1) / (this.stages.length - 1)) * 100;

        return `
            <aside class="workflow-sidebar">
                <div class="workflow-header">
                    <h3>진행 상황</h3>
                    <div class="workflow-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            ${this.currentStage} / ${this.stages.length} 단계
                        </div>
                    </div>
                </div>

                <div class="workflow-stages">
                    ${stagesHtml}
                </div>

                <div class="workflow-footer">
                    <div class="medical-badge">의료용 AI 소프트웨어</div>
                </div>
            </aside>
        `;
    }

    /**
     * 푸터 렌더링
     */
    renderFooter() {
        return `
            <footer class="app-footer">
                <div class="footer-content">
                    Copyright. Power Solution., Inc. 2026.
                </div>
            </footer>
        `;
    }

    /**
     * 현재 스테이지 업데이트
     */
    setCurrentStage(stageId) {
        this.currentStage = stageId;
    }

    /**
     * 보고서명 업데이트
     */
    setReportName(name) {
        this.reportName = name;
    }

    /**
     * 배포 모드 업데이트
     */
    setDeploymentMode(mode) {
        this.deploymentMode = mode;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppLayout;
}

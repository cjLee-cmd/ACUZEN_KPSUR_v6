/**
 * AppLayout.js
 * 앱 레이아웃 컴포넌트 (헤더, 사이드바, 푸터)
 * P18_Review.html에서 사용
 */

import { loadSessionData } from '../utils/session.js';
import { navigateTo } from '../utils/navigation.js';

export class AppLayout {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.pageTitle = options.pageTitle || '페이지';
        this.breadcrumb = options.breadcrumb || [];
        this.showWorkflowSidebar = options.showWorkflowSidebar !== false;
    }

    /**
     * 레이아웃 렌더링
     */
    render() {
        const session = loadSessionData();
        const userName = session?.userName || '사용자';
        const userRole = session?.userRole || 'Viewer';

        const layout = `
            <div class="app-layout">
                ${this.renderHeader(userName, userRole)}

                <div class="app-content">
                    <main class="main-content" id="mainContent">
                        <!-- Main content will be inserted here -->
                    </main>

                    ${this.showWorkflowSidebar ? this.renderWorkflowSidebar() : ''}
                </div>

                ${this.renderFooter()}
            </div>
        `;

        if (typeof this.container === 'string') {
            document.querySelector(this.container).innerHTML = layout;
        } else {
            this.container.innerHTML = layout;
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();

        return document.getElementById('mainContent');
    }

    /**
     * 헤더 렌더링
     */
    renderHeader(userName, userRole) {
        const breadcrumbHTML = this.breadcrumb.length > 0
            ? this.breadcrumb.map(item => `<span class="breadcrumb-item">${item}</span>`).join(' / ')
            : `<span class="breadcrumb-item active">${this.pageTitle}</span>`;

        return `
            <header class="app-header">
                <div class="header-left">
                    <div class="logo">
                        <span class="logo-text">KPSUR AGENT</span>
                        <span class="logo-subtitle">ACUZEN AI</span>
                    </div>
                    <span class="deployment-badge test">테스트</span>
                </div>

                <div class="header-center">
                    <div class="breadcrumb">
                        ${breadcrumbHTML}
                    </div>
                </div>

                <div class="header-right">
                    <div class="user-menu">
                        <div class="user-avatar">${userName.charAt(0)}</div>
                        <div class="user-info">
                            <div class="user-name">${userName}</div>
                            <div class="user-role">${userRole}</div>
                        </div>
                        <button class="user-menu-toggle">▼</button>
                    </div>
                </div>
            </header>
        `;
    }

    /**
     * 워크플로우 사이드바 렌더링
     */
    renderWorkflowSidebar() {
        const stages = [
            { num: 1, icon: '🔐', label: '로그인' },
            { num: 2, icon: '📋', label: '보고서 상태' },
            { num: 3, icon: '📤', label: '파일 업로드' },
            { num: 4, icon: '🔄', label: 'MD 변환' },
            { num: 5, icon: '⚙️', label: '데이터 추출' },
            { num: 6, icon: '📄', label: '템플릿 작성' },
            { num: 7, icon: '✏️', label: '리뷰' },
            { num: 8, icon: '✅', label: 'QC 검증' },
            { num: 9, icon: '📤', label: '최종 출력' }
        ];

        const stagesHTML = stages.map(stage => `
            <div class="workflow-stage pending">
                <div class="stage-icon">${stage.icon}</div>
                <div class="stage-info">
                    <div class="stage-name">Stage ${stage.num}</div>
                    <div class="stage-label">${stage.label}</div>
                </div>
                <div class="stage-status">○</div>
            </div>
        `).join('');

        return `
            <aside class="workflow-sidebar">
                <div class="workflow-header">
                    <h3>진행 상황</h3>
                    <div class="workflow-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">${this.pageTitle}</div>
                    </div>
                </div>

                <div class="workflow-stages">
                    ${stagesHTML}
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
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 로고 클릭 시 대시보드로 이동
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                navigateTo('P10_Dashboard.html');
            });
        }

        // 사용자 메뉴 설정
        if (window.setupUserMenu) {
            window.setupUserMenu();
        }
    }

    /**
     * 메인 콘텐츠 영역에 HTML 삽입
     * @param {string} html - 삽입할 HTML
     */
    setContent(html) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = html;
        }
    }

    /**
     * 워크플로우 진행률 업데이트
     * @param {number} progress - 진행률 (0-100)
     */
    updateProgress(progress) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }

    /**
     * 워크플로우 단계 활성화
     * @param {number} stageNumber - 단계 번호 (1-9)
     */
    activateStage(stageNumber) {
        const stages = document.querySelectorAll('.workflow-stage');
        stages.forEach((stage, index) => {
            const num = index + 1;
            if (num < stageNumber) {
                stage.className = 'workflow-stage completed';
                stage.querySelector('.stage-status').textContent = '✓';
            } else if (num === stageNumber) {
                stage.className = 'workflow-stage active';
                stage.querySelector('.stage-status').textContent = '●';
            } else {
                stage.className = 'workflow-stage pending';
                stage.querySelector('.stage-status').textContent = '○';
            }
        });
    }
}

// Default export
export default AppLayout;

/**
 * layout-helper.js
 * 레이아웃 관련 헬퍼 함수
 */

import { navigateTo } from './navigation.js';
import { loadSessionData, clearSessionData, getDeploymentMode, setDeploymentMode } from './session.js';

/**
 * 사용자 메뉴 초기화
 */
export function setupUserMenu() {
    try {
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        const userMenu = document.querySelector('.user-menu');

        if (!userMenuToggle || !userMenu) {
            console.warn('User menu elements not found');
            return;
        }

        // 메뉴 토글
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();

            // 메뉴 생성 (없으면)
            let dropdown = document.querySelector('.user-menu-dropdown');
            if (!dropdown) {
                dropdown = createUserMenuDropdown();
                userMenu.appendChild(dropdown);
            }

            // 토글
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.user-menu-dropdown');
            if (dropdown && !userMenu.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('setupUserMenu error:', error);
    }
}

/**
 * 사용자 메뉴 드롭다운 생성
 */
function createUserMenuDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'user-menu-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        z-index: 1000;
        display: none;
    `;

    const session = loadSessionData();
    const menuItems = [
        { icon: '👤', label: '내 프로필', action: () => navigateTo('P30_UserManagement.html') },
        { icon: '⚙️', label: '설정', action: () => navigateTo('P91_Settings.html') },
        { divider: true },
        { icon: '🚪', label: '로그아웃', action: handleLogout }
    ];

    menuItems.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('div');
            divider.style.cssText = 'height: 1px; background: #E5E7EB; margin: 8px 0;';
            dropdown.appendChild(divider);
        } else {
            const menuItem = document.createElement('div');
            menuItem.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: background 0.2s;
            `;
            menuItem.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = '#F3F4F6';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'transparent';
            });
            menuItem.addEventListener('click', () => {
                dropdown.style.display = 'none';
                item.action();
            });

            dropdown.appendChild(menuItem);
        }
    });

    return dropdown;
}

/**
 * 로그아웃 처리
 */
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        clearSessionData();
        navigateTo('P01_Login.html');
    }
}

/**
 * 배포 모드 뱃지 업데이트
 * @param {string} mode - 'test' 또는 'production'
 */
export function updateDeploymentMode(mode) {
    try {
        const badge = document.querySelector('.deployment-badge');
        if (!badge) {
            console.warn('Deployment badge not found');
            return;
        }

        badge.textContent = mode === 'production' ? '운영' : '테스트';
        badge.className = `deployment-badge ${mode}`;

        // 배포 모드 저장
        setDeploymentMode(mode);
    } catch (error) {
        console.error('updateDeploymentMode error:', error);
    }
}

/**
 * 브레드크럼 업데이트
 * @param {Array<{label: string, page?: string}>} items - 브레드크럼 항목
 */
export function updateBreadcrumb(items) {
    try {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) {
            console.warn('Breadcrumb element not found');
            return;
        }

        breadcrumb.innerHTML = '';

        items.forEach((item, index) => {
            const span = document.createElement('span');
            span.className = 'breadcrumb-item';

            if (item.page) {
                span.style.cursor = 'pointer';
                span.style.color = '#6B7280';
                span.addEventListener('click', () => navigateTo(item.page));
                span.addEventListener('mouseenter', () => {
                    span.style.textDecoration = 'underline';
                });
                span.addEventListener('mouseleave', () => {
                    span.style.textDecoration = 'none';
                });
            } else {
                span.className += ' active';
            }

            span.textContent = item.label;
            breadcrumb.appendChild(span);

            // 구분자 추가 (마지막 항목 제외)
            if (index < items.length - 1) {
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                separator.style.color = '#D1D5DB';
                separator.style.margin = '0 8px';
                breadcrumb.appendChild(separator);
            }
        });
    } catch (error) {
        console.error('updateBreadcrumb error:', error);
    }
}

/**
 * 워크플로우 진행률 업데이트
 * @param {number} progress - 진행률 (0-100)
 */
export function updateWorkflowProgress(progress) {
    try {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    } catch (error) {
        console.error('updateWorkflowProgress error:', error);
    }
}

/**
 * 워크플로우 단계 활성화
 * @param {number} stageNumber - 단계 번호 (1-9)
 */
export function activateWorkflowStage(stageNumber) {
    try {
        const stages = document.querySelectorAll('.workflow-stage');
        stages.forEach((stage, index) => {
            const stageNum = index + 1;

            if (stageNum < stageNumber) {
                stage.className = 'workflow-stage completed';
            } else if (stageNum === stageNumber) {
                stage.className = 'workflow-stage active';
            } else {
                stage.className = 'workflow-stage pending';
            }
        });
    } catch (error) {
        console.error('activateWorkflowStage error:', error);
    }
}

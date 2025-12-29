/**
 * Layout Helper Utilities
 * 페이지에서 레이아웃을 쉽게 초기화하고 관리하기 위한 유틸리티
 */

/**
 * 레이아웃 초기화
 * @param {Object} options - 레이아웃 옵션
 * @param {number} options.currentStage - 현재 진행 단계 (1-9)
 * @param {string} options.reportName - 보고서명
 * @param {string} options.userName - 사용자명
 * @param {string} options.userRole - 사용자 역할 (Master/Author/Reviewer/Viewer)
 * @param {string} options.deploymentMode - 배포 모드 (test/production)
 */
function initializeLayout(options = {}) {
    const layout = new AppLayout(options);

    // 사용자 메뉴 드롭다운 이벤트
    setupUserMenu();

    // 로컬 스토리지에서 설정 로드
    loadLayoutSettings();

    return layout;
}

/**
 * 사용자 메뉴 설정
 */
function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserDropdown();
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', () => {
        closeUserDropdown();
    });
}

/**
 * 사용자 드롭다운 토글
 */
function toggleUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    } else {
        createUserDropdown();
    }
}

/**
 * 사용자 드롭다운 생성
 */
function createUserDropdown() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown show';
    dropdown.innerHTML = `
        <div class="dropdown-item" onclick="navigateTo('P33_Profile.html')">
            <span class="dropdown-icon">👤</span>
            <span class="dropdown-label">내 프로필</span>
        </div>
        <div class="dropdown-item" onclick="navigateTo('P31_SystemSettings.html')">
            <span class="dropdown-icon">⚙️</span>
            <span class="dropdown-label">시스템 설정</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" onclick="logout()">
            <span class="dropdown-icon">🚪</span>
            <span class="dropdown-label">로그아웃</span>
        </div>
    `;

    userMenu.appendChild(dropdown);
}

/**
 * 사용자 드롭다운 닫기
 */
function closeUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

/**
 * 페이지 이동
 */
function navigateTo(page) {
    window.location.href = page;
}

/**
 * 로그아웃
 */
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 세션 정리
        localStorage.removeItem('userSession');
        sessionStorage.clear();

        // 로그인 페이지로 이동
        window.location.href = 'P01_Login.html';
    }
}

/**
 * 레이아웃 설정 로드
 */
function loadLayoutSettings() {
    const settings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');

    // 컴팩트 모드 적용
    if (settings.compactMode) {
        document.body.classList.add('compact-mode');
    }

    // 사이드바 접기/펼치기 상태
    if (settings.sidebarCollapsed) {
        toggleSidebar(false);
    }
}

/**
 * 레이아웃 설정 저장
 */
function saveLayoutSettings(settings) {
    const current = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    const updated = { ...current, ...settings };
    localStorage.setItem('layoutSettings', JSON.stringify(updated));
}

/**
 * 사이드바 토글
 */
function toggleSidebar(animate = true) {
    const sidebar = document.querySelector('.workflow-sidebar');
    if (!sidebar) return;

    const isCollapsed = sidebar.classList.toggle('collapsed');

    if (!animate) {
        sidebar.style.transition = 'none';
        setTimeout(() => {
            sidebar.style.transition = '';
        }, 0);
    }

    saveLayoutSettings({ sidebarCollapsed: isCollapsed });
}

/**
 * LLM 처리 중 로딩 오버레이 표시
 */
function showLLMLoading(message = 'AI가 데이터를 처리하고 있습니다...') {
    const overlay = document.createElement('div');
    overlay.id = 'llmLoadingOverlay';
    overlay.className = 'loading-overlay magic-effect';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner-large"></div>
            <div class="loading-text">${message}</div>
            <div class="loading-subtext">잠시만 기다려주세요</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

/**
 * LLM 로딩 오버레이 숨기기
 */
function hideLLMLoading() {
    const overlay = document.getElementById('llmLoadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * 토스트 메시지 표시
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${getToastIcon(type)}</div>
        <div class="toast-message">${message}</div>
    `;

    const container = document.querySelector('.toast-container') || createToastContainer();
    container.appendChild(toast);

    // 애니메이션
    setTimeout(() => toast.classList.add('show'), 10);

    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 토스트 컨테이너 생성
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/**
 * 토스트 아이콘 가져오기
 */
function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

/**
 * 진행 상황 업데이트
 */
function updateWorkflowProgress(stageId) {
    // 모든 단계 요소 가져오기
    const stages = document.querySelectorAll('.workflow-stage');

    stages.forEach((stage, index) => {
        const currentStageId = index + 1;

        // 상태 클래스 제거
        stage.classList.remove('completed', 'current', 'pending');

        // 새 상태 클래스 추가
        if (currentStageId < stageId) {
            stage.classList.add('completed');
        } else if (currentStageId === stageId) {
            stage.classList.add('current');
        } else {
            stage.classList.add('pending');
        }
    });

    // 진행률 바 업데이트
    const progress = ((stageId - 1) / 8) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }

    // 진행률 텍스트 업데이트
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${stageId} / 9 단계`;
    }
}

/**
 * 보고서명 업데이트
 */
function updateReportName(reportName) {
    const breadcrumbItem = document.querySelector('.breadcrumb-item');
    if (breadcrumbItem) {
        breadcrumbItem.textContent = reportName;
    }
}

/**
 * 배포 모드 업데이트
 */
function updateDeploymentMode(mode) {
    const badge = document.querySelector('.deployment-badge');
    if (!badge) return;

    badge.classList.remove('test', 'production');
    badge.classList.add(mode);
    badge.textContent = mode === 'production' ? '프로덕션' : '테스트';

    // 로컬 스토리지에 저장
    localStorage.setItem('deploymentMode', mode);
}

/**
 * 세션 데이터 로드
 */
function loadSessionData() {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) {
        // 세션 없으면 로그인 페이지로
        window.location.href = 'P01_Login.html';
        return null;
    }

    try {
        return JSON.parse(sessionData);
    } catch (e) {
        console.error('Failed to parse session data:', e);
        return null;
    }
}

/**
 * 세션 데이터 저장
 */
function saveSessionData(data) {
    localStorage.setItem('userSession', JSON.stringify(data));
}

/**
 * 권한 체크
 */
function checkPermission(requiredRole) {
    const session = loadSessionData();
    if (!session) return false;

    const roleHierarchy = {
        'Master': 4,
        'Author': 3,
        'Reviewer': 2,
        'Viewer': 1
    };

    return roleHierarchy[session.userRole] >= roleHierarchy[requiredRole];
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeLayout,
        showLLMLoading,
        hideLLMLoading,
        showToast,
        updateWorkflowProgress,
        updateReportName,
        updateDeploymentMode,
        loadSessionData,
        saveSessionData,
        checkPermission,
        navigateTo,
        logout
    };
}

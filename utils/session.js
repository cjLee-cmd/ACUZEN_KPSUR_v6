/**
 * session.js
 * 세션 관리 유틸리티 (localStorage 기반)
 */

const SESSION_KEY = 'kpsur_session';
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8시간

/**
 * 세션 데이터 로드
 * @returns {Object|null} 세션 데이터 또는 null
 */
function loadSessionData() {
    try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) {
            return null;
        }

        const session = JSON.parse(sessionStr);

        // 세션 타임아웃 체크
        if (session.timestamp) {
            const now = Date.now();
            const elapsed = now - session.timestamp;

            if (elapsed > SESSION_TIMEOUT) {
                console.warn('Session expired');
                clearSessionData();
                return null;
            }
        }

        return session;
    } catch (error) {
        console.error('Session load error:', error);
        return null;
    }
}

/**
 * 세션 데이터 저장
 * @param {Object} data - 저장할 세션 데이터
 * @returns {boolean} 성공 여부
 */
function saveSessionData(data) {
    try {
        if (!data || typeof data !== 'object') {
            console.warn('saveSessionData: data must be an object');
            return false;
        }

        // 타임스탬프 추가
        const sessionData = {
            ...data,
            timestamp: Date.now()
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        return true;
    } catch (error) {
        console.error('Session save error:', error);
        return false;
    }
}

/**
 * 세션 데이터 삭제
 */
function clearSessionData() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error('Session clear error:', error);
    }
}

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
function isAuthenticated() {
    const session = loadSessionData();
    return session !== null && session.email && session.userName;
}

/**
 * 현재 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보
 */
function getCurrentUser() {
    const session = loadSessionData();
    if (!session) {
        return null;
    }

    return {
        userName: session.userName || '사용자',
        userRole: session.userRole || 'Viewer',
        email: session.email || '',
        userId: session.userId || null
    };
}

/**
 * 세션 데이터 업데이트 (부분 업데이트)
 * @param {Object} updates - 업데이트할 데이터
 * @returns {boolean} 성공 여부
 */
function updateSessionData(updates) {
    try {
        const currentSession = loadSessionData();
        if (!currentSession) {
            return false;
        }

        const updatedSession = {
            ...currentSession,
            ...updates,
            timestamp: Date.now()
        };

        return saveSessionData(updatedSession);
    } catch (error) {
        console.error('Session update error:', error);
        return false;
    }
}

/**
 * 배포 모드 가져오기
 * @returns {string} 'test' 또는 'production'
 */
function getDeploymentMode() {
    try {
        return localStorage.getItem('deploymentMode') || 'test';
    } catch (error) {
        console.error('getDeploymentMode error:', error);
        return 'test';
    }
}

/**
 * 배포 모드 설정
 * @param {string} mode - 'test' 또는 'production'
 */
function setDeploymentMode(mode) {
    try {
        if (mode !== 'test' && mode !== 'production') {
            console.warn('Invalid deployment mode:', mode);
            return;
        }
        localStorage.setItem('deploymentMode', mode);
    } catch (error) {
        console.error('setDeploymentMode error:', error);
    }
}

/**
 * 네비게이션 보안 체크 (세션 기반)
 * 유효한 세션이 있으면 통과, 없으면 로그인 페이지로 리다이렉트
 * @returns {boolean} true: 정상 네비게이션, false: 세션 없음으로 인한 리다이렉트
 */
function checkNavigationSecurity() {
    try {
        const currentPage = window.location.pathname;

        // 로그인 페이지는 체크 제외
        if (currentPage.includes('P01_Login') || currentPage.includes('index.html') || currentPage.endsWith('/')) {
            return true;
        }

        // 네비게이션 플래그 확인 (정상 페이지 이동)
        const validNavigation = sessionStorage.getItem('kpsur_valid_navigation');
        if (validNavigation === 'true') {
            sessionStorage.removeItem('kpsur_valid_navigation');
            return true;
        }

        // 세션 데이터 확인 (리프레시 또는 직접 URL 접근 시)
        const session = loadSessionData();
        if (session && session.userName) {
            // 유효한 세션 존재 - 통과 (cellular-test: 리프레시 허용)
            return true;
        }

        // 세션 없음 - 로그인 페이지로 리다이렉트
        console.warn('Security: No valid session. Redirecting to login.');
        const basePath = window.location.pathname.split('/pages/')[0];
        window.location.href = `${basePath}/pages/P01_Login.html`;
        return false;

    } catch (error) {
        console.error('checkNavigationSecurity error:', error);
        return true; // 에러 시 통과
    }
}

/**
 * 네비게이션 플래그 설정 (외부에서 수동 호출용)
 * 로그인 성공 후 호출하여 다음 페이지 이동 허용
 */
function setNavigationFlag() {
    try {
        sessionStorage.setItem('kpsur_valid_navigation', 'true');
    } catch (error) {
        console.error('setNavigationFlag error:', error);
    }
}

// 전역으로 내보내기 (window 객체)
if (typeof window !== 'undefined') {
    window.loadSessionData = loadSessionData;
    window.saveSessionData = saveSessionData;
    window.clearSessionData = clearSessionData;
    window.isAuthenticated = isAuthenticated;
    window.getCurrentUser = getCurrentUser;
    window.updateSessionData = updateSessionData;
    window.getDeploymentMode = getDeploymentMode;
    window.setDeploymentMode = setDeploymentMode;
    window.checkNavigationSecurity = checkNavigationSecurity;
    window.setNavigationFlag = setNavigationFlag;

    // 페이지 로드 시 자동 보안 체크 (리프레시 감지)
    document.addEventListener('DOMContentLoaded', () => {
        checkNavigationSecurity();
    });
}

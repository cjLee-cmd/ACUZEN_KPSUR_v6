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
export function loadSessionData() {
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
export function saveSessionData(data) {
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
export function clearSessionData() {
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
export function isAuthenticated() {
    const session = loadSessionData();
    return session !== null && session.email && session.userName;
}

/**
 * 현재 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보
 */
export function getCurrentUser() {
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
export function updateSessionData(updates) {
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
export function getDeploymentMode() {
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
export function setDeploymentMode(mode) {
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

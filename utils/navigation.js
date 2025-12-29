/**
 * navigation.js
 * 페이지 네비게이션 유틸리티
 */

/**
 * 페이지 이동 (세션 보존)
 * @param {string} page - 이동할 페이지 파일명 (예: 'P10_Dashboard.html')
 */
export function navigateTo(page) {
    if (!page) {
        console.warn('navigateTo: page parameter is required');
        return;
    }

    try {
        // 현재 경로에서 /pages/ 이전 경로 추출
        const basePath = window.location.pathname.split('/pages/')[0];
        const targetPath = `${basePath}/pages/${page}`;

        console.log(`Navigating to: ${targetPath}`);
        window.location.href = targetPath;
    } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: 상대 경로로 이동 시도
        window.location.href = page;
    }
}

/**
 * 현재 페이지명 반환
 * @returns {string} 현재 페이지 파일명 (예: 'P10_Dashboard.html')
 */
export function getCurrentPage() {
    try {
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').pop();
        return pageName || 'index.html';
    } catch (error) {
        console.error('getCurrentPage error:', error);
        return 'unknown';
    }
}

/**
 * URL 파라미터 파싱
 * @returns {Object} URL 파라미터 객체
 */
export function getUrlParams() {
    try {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);

        for (const [key, value] of searchParams) {
            params[key] = value;
        }

        return params;
    } catch (error) {
        console.error('getUrlParams error:', error);
        return {};
    }
}

/**
 * URL 파라미터 가져오기
 * @param {string} key - 파라미터 키
 * @returns {string|null} 파라미터 값
 */
export function getUrlParam(key) {
    try {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(key);
    } catch (error) {
        console.error('getUrlParam error:', error);
        return null;
    }
}

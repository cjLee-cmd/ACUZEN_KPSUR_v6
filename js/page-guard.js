/**
 * Page Guard - 페이지 접근 제어
 * 각 페이지에서 로드 시 권한을 확인합니다.
 */

(function() {
    'use strict';

    // 현재 페이지 파일명 추출
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // 공개 페이지 목록
    const publicPages = [
        'P01_Login.html',
        'P02_Signup.html',
        'P03_PasswordReset.html',
        'P05_SystemCheck.html',
        'index.html'
    ];

    // 공개 페이지는 체크하지 않음
    if (publicPages.includes(currentPage)) {
        return;
    }

    /**
     * 세션 체크 및 권한 확인
     */
    function checkAccess() {
        // config.js와 auth.js가 로드될 때까지 대기
        if (typeof window.Storage === 'undefined' || typeof window.CONFIG === 'undefined') {
            // 잠시 후 재시도
            setTimeout(checkAccess, 50);
            return;
        }

        // 세션 확인
        const session = window.Storage.get(window.CONFIG.STORAGE_KEYS?.SESSION || 'kpsur_session');

        if (!session) {
            console.warn('⚠️ No session found, redirecting to login');
            redirectToLogin();
            return;
        }

        // 세션 만료 확인
        if (!session.rememberMe) {
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursPassed = (now - loginTime) / (1000 * 60 * 60);

            if (hoursPassed > 24) {
                console.warn('⚠️ Session expired');
                window.Storage.remove(window.CONFIG.STORAGE_KEYS?.SESSION || 'kpsur_session');
                redirectToLogin();
                return;
            }
        }

        // 권한 확인 (permissionManager가 로드된 경우)
        if (typeof window.permissionManager !== 'undefined') {
            const user = {
                id: session.userId,
                email: session.email,
                name: session.userName,
                role: session.userRole,
                position: session.userPosition
            };
            window.permissionManager.setCurrentUser(user);

            if (!window.permissionManager.canAccessPage(currentPage)) {
                console.warn(`⚠️ Access denied to ${currentPage}`);
                return; // permissionManager가 리다이렉트 처리
            }
        } else {
            // permissionManager 없이 기본 역할 체크
            checkBasicPermission(session, currentPage);
        }

        console.log(`✅ Access granted to ${currentPage}`);
    }

    /**
     * 기본 권한 체크 (permissionManager 없이)
     */
    function checkBasicPermission(session, page) {
        const roleHierarchy = {
            'Master': 4,
            'Author': 3,
            'Reviewer': 2,
            'Viewer': 1
        };

        const pagePermissions = {
            'P30_UserManagement.html': 'Master',
            'P90_SystemTest.html': 'Master',
            'P91_Settings.html': 'Master',
            'P18_Review.html': 'Reviewer',
            'P19_QC.html': 'Reviewer',
            'P13_NewReport.html': 'Author',
            'P14_UnifiedProcessing.html': 'Author',
            'P15_SectionEditor.html': 'Author',
            'P20_Output.html': 'Author'
        };

        const requiredRole = pagePermissions[page];
        if (!requiredRole) return; // 기본 접근 허용

        const userLevel = roleHierarchy[session.userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
            alert(`접근 권한이 없습니다.\n이 페이지는 "${requiredRole}" 이상의 권한이 필요합니다.`);
            window.location.href = 'P10_Dashboard.html';
        }
    }

    /**
     * 로그인 페이지로 리다이렉트
     */
    function redirectToLogin() {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `P01_Login.html?returnUrl=${returnUrl}`;
    }

    // DOM 로드 후 체크
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccess);
    } else {
        checkAccess();
    }
})();

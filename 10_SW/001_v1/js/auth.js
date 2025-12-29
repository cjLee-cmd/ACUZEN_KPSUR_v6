/**
 * Authentication & Session Management
 * 사용자 인증 및 세션 관리
 */

import { CONFIG, Storage } from './config.js';
import supabaseClient from './supabase-client.js';
import env from './env.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
    }

    /**
     * 로그인 (테스트 계정 + Supabase Auth)
     * 테스트 계정은 개발 모드에서만 활성화됨
     */
    async login(email, password, rememberMe = false) {
        // 테스트 계정 (개발 모드에서만 활성화)
        const testAccountsEnabled = env.getConfig().features.testAccounts;

        if (testAccountsEnabled) {
            const testAccounts = {
                'author@kpsur.test': {
                    password: 'test1234',
                    id: '6f19f4a9-48ec-4a43-a032-b8f79e71d2d3',
                    name: 'Test Author',
                    role: 'Author'
                },
                'main@main.com': {
                    password: '1111',
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    name: 'Master Admin',
                    role: 'Master'
                }
            };

            // 테스트 계정 확인
            const testAccount = testAccounts[email];

            if (testAccount && testAccount.password === password) {
            // 테스트 계정 로그인 성공
            const sessionData = {
                user: {
                    id: testAccount.id,
                    email: email,
                    name: testAccount.name,
                    role: testAccount.role
                },
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe,
                type: 'test'
            };

            this.currentUser = sessionData.user;
            this.currentSession = sessionData;
            Storage.set(CONFIG.STORAGE_KEYS.SESSION, sessionData);

            console.log('✅ Login successful (test account):', email);

            return {
                success: true,
                user: sessionData.user,
                session: sessionData
            };
            }
        }

        // Supabase Auth 시도
        const result = await supabaseClient.signInWithPassword(email, password);

        if (result.success) {
            const sessionData = {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.user_metadata?.name || email,
                    role: result.user.user_metadata?.role || 'Author'
                },
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe,
                type: 'supabase'
            };

            this.currentUser = sessionData.user;
            this.currentSession = sessionData;
            Storage.set(CONFIG.STORAGE_KEYS.SESSION, sessionData);

            console.log('✅ Login successful (Supabase):', email);

            return {
                success: true,
                user: sessionData.user,
                session: sessionData
            };
        }

        // 로그인 실패
        console.error('❌ Login failed:', result.error);
        return {
            success: false,
            error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        };
    }

    /**
     * 로그아웃
     */
    async logout() {
        // Supabase 로그아웃
        if (this.currentSession?.type === 'supabase') {
            await supabaseClient.signOut();
        }

        // 세션 정보 제거
        this.currentUser = null;
        this.currentSession = null;
        Storage.remove(CONFIG.STORAGE_KEYS.SESSION);
        Storage.remove(CONFIG.STORAGE_KEYS.CURRENT_REPORT);
        Storage.remove(CONFIG.STORAGE_KEYS.LAST_STAGE);

        console.log('✅ Logout successful');

        return { success: true };
    }

    /**
     * 세션 확인
     */
    checkSession() {
        const session = Storage.get(CONFIG.STORAGE_KEYS.SESSION);

        if (!session) {
            return { authenticated: false };
        }

        // Remember Me 확인
        if (!session.rememberMe) {
            // 로그인 시간 확인 (24시간)
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursPassed = (now - loginTime) / (1000 * 60 * 60);

            if (hoursPassed > 24) {
                this.logout();
                return { authenticated: false, expired: true };
            }
        }

        this.currentUser = session.user;
        this.currentSession = session;

        return {
            authenticated: true,
            user: session.user,
            session: session
        };
    }

    /**
     * 현재 사용자 가져오기
     */
    getCurrentUser() {
        if (!this.currentUser) {
            const session = this.checkSession();
            if (session.authenticated) {
                return session.user;
            }
            return null;
        }
        return this.currentUser;
    }

    /**
     * 권한 확인
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const roleHierarchy = {
            'Master': 4,
            'Author': 3,
            'Reviewer': 2,
            'Viewer': 1
        };

        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[role] || 0;

        return userLevel >= requiredLevel;
    }

    /**
     * 로그인 페이지로 리다이렉트
     */
    redirectToLogin() {
        window.location.href = `pages/${CONFIG.PAGES.LOGIN}`;
    }

    /**
     * 페이지 접근 권한 확인 (가드)
     */
    requireAuth(requiredRole = null) {
        const session = this.checkSession();

        if (!session.authenticated) {
            console.warn('⚠️ Authentication required');
            this.redirectToLogin();
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            console.warn('⚠️ Insufficient permissions');
            alert('접근 권한이 없습니다.');
            window.location.href = `pages/${CONFIG.PAGES.DASHBOARD}`;
            return false;
        }

        return true;
    }
}

// Singleton instance
const authManager = new AuthManager();

export default authManager;

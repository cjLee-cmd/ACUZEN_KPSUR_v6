/**
 * Authentication & Session Management
 * 사용자 인증 및 세션 관리
 */

// 전역 의존성 fallback (config.js에서 이미 선언된 경우 재선언하지 않음)
if (!window.CONFIG) {
    window.CONFIG = {
        PAGES: {
            LOGIN: 'P01_Login.html',
            DASHBOARD: 'P10_Dashboard.html',
            SYSTEM_CHECK: 'P05_SystemCheck.html'
        }
    };
}

if (!window.Storage) {
    window.Storage = {
        get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
        set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
        remove: (key) => { try { localStorage.removeItem(key); } catch {} }
    };
}

// env fallback
if (!window.env) {
    window.env = {
        getConfig: () => ({
            features: { testAccounts: true },
            isTest: true
        })
    };
}

// config.js에서 로드된 전역 객체 사용 (CONFIG, Storage)
// (const 재선언 금지 - 전역 스코프 충돌 방지)

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
        const testAccountsEnabled = window.env.getConfig().features.testAccounts;

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
            // session.js 형식에 맞춤 (email, userName, userRole, userId, timestamp)
            const sessionData = {
                userId: testAccount.id,
                email: email,
                userName: testAccount.name,
                userRole: testAccount.role,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe,
                type: 'test',
                timestamp: Date.now()
            };
            // 기존 호환성을 위한 user 객체
            const userObj = {
                id: testAccount.id,
                email: email,
                name: testAccount.name,
                role: testAccount.role
            };

            this.currentUser = userObj;
            this.currentSession = sessionData;
            Storage.set(CONFIG.STORAGE_KEYS.SESSION, sessionData);

            // Supabase 인증도 시도 (RLS 정책 통과를 위해)
            try {
                const supabaseResult = await supabaseClient.signInWithPassword(email, password);
                if (supabaseResult.success) {
                    console.log('✅ Supabase auth also successful for test account');
                    sessionData.type = 'test+supabase';
                    Storage.set(CONFIG.STORAGE_KEYS.SESSION, sessionData);
                }
            } catch (e) {
                console.log('ℹ️ Supabase auth skipped for test account (account may not exist in Supabase)');
            }

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
            // session.js 형식에 맞춤 (email, userName, userRole, userId, timestamp)
            const sessionData = {
                userId: result.user.id,
                email: result.user.email,
                userName: result.user.user_metadata?.name || email,
                userRole: result.user.user_metadata?.role || 'Author',
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe,
                type: 'supabase',
                timestamp: Date.now()
            };
            // 기존 호환성을 위한 user 객체
            const userObj = {
                id: result.user.id,
                email: result.user.email,
                name: result.user.user_metadata?.name || email,
                role: result.user.user_metadata?.role || 'Author'
            };

            this.currentUser = userObj;
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

// 전역으로 내보내기 (window 객체)
if (typeof window !== 'undefined') {
    window.authManager = authManager;
    window.AuthManager = AuthManager;
}

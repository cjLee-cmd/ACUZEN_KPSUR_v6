/**
 * Environment Configuration
 * 환경 설정 (개발/프로덕션 모드)
 */

class Environment {
    constructor() {
        // GitHub Pages에서 실행 중인지 확인
        this.isProduction = window.location.hostname.includes('github.io');

        // 수동 모드 설정 (localStorage에서 확인)
        const manualMode = localStorage.getItem('ENV_MODE');
        if (manualMode === 'development' || manualMode === 'production') {
            this.mode = manualMode;
        } else {
            this.mode = this.isProduction ? 'production' : 'development';
        }

        // 프로덕션 모드에서 console.log 비활성화
        if (this.mode === 'production') {
            this.disableConsoleLogs();
        }
    }

    /**
     * 현재 환경 모드 반환
     */
    getMode() {
        return this.mode;
    }

    /**
     * 개발 모드 여부
     */
    isDevelopment() {
        return this.mode === 'development';
    }

    /**
     * 프로덕션 모드 여부
     */
    isProductionMode() {
        return this.mode === 'production';
    }

    /**
     * console.log 비활성화 (프로덕션 모드)
     */
    disableConsoleLogs() {
        // console.error와 console.warn은 유지 (에러 추적용)
        console.log = () => {};
        console.debug = () => {};
        console.info = () => {};
    }

    /**
     * 환경별 설정 가져오기
     */
    getConfig() {
        return {
            mode: this.mode,
            isProduction: this.isProduction,
            features: {
                testAccounts: this.isDevelopment(), // 개발 모드에서만 테스트 계정 활성화
                debugLogs: this.isDevelopment(),    // 개발 모드에서만 디버그 로그
                analytics: this.isProductionMode()  // 프로덕션에서만 분석 활성화
            }
        };
    }

    /**
     * 환경 모드 수동 설정 (개발용)
     * localStorage.setItem('ENV_MODE', 'development') 또는 'production'
     */
    static setMode(mode) {
        if (mode === 'development' || mode === 'production') {
            localStorage.setItem('ENV_MODE', mode);
            console.log(`Environment mode set to: ${mode}`);
            console.log('Reload the page for changes to take effect.');
        } else {
            console.error('Invalid mode. Use "development" or "production"');
        }
    }

    /**
     * 환경 모드 초기화 (자동 감지 사용)
     */
    static resetMode() {
        localStorage.removeItem('ENV_MODE');
        console.log('Environment mode reset to auto-detect.');
        console.log('Reload the page for changes to take effect.');
    }
}

// Singleton 인스턴스 생성 및 내보내기
const env = new Environment();

// 전역으로 사용 가능하도록 설정 (디버깅용)
window.ENV = env;
window.setEnvMode = Environment.setMode;
window.resetEnvMode = Environment.resetMode;

export default env;

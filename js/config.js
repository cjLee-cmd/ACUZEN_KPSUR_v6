/**
 * KSUR System Configuration
 * GitHub Pages 배포용 - API 키는 localStorage에서 관리
 */

const CONFIG = {
    // Supabase 설정 (공개 정보 - GitHub Pages에서 사용 가능)
    SUPABASE_URL: 'https://toelnxgizxwbdikskmxa.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZWxueGdpenh3YmRpa3NrbXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDAyMzUsImV4cCI6MjA3NzU3NjIzNX0.mpBAWTufodmfPUp6nmg7Qez6uygrplK9S91xl8c4mR8',

    // LLM 설정
    LLM: {
        DEFAULT_MODEL: 'gemini-2.0-flash-exp',
        MODELS: {
            FLASH: 'gemini-2.0-flash-exp',
            PRO: 'gemini-2.0-pro-exp'
        },
        API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models'
    },

    // 로컬 저장 키
    STORAGE_KEYS: {
        GOOGLE_API_KEY: 'GOOGLE_API_KEY',
        SESSION: 'session',
        CURRENT_REPORT: 'current_report',
        LAST_STAGE: 'last_stage'
    },

    // RAW ID 분류 (소스 문서 타입)
    RAW_IDS: {
        'RAW1': '최신첨부문서',
        'RAW2.1': '용법용량',
        'RAW2.2': '효능효과',
        'RAW2.3': '사용상의주의사항',
        'RAW3': '시판후sales데이터',
        'RAW4': '허가현황',
        'RAW12': '국내신속보고LineListing',
        'RAW14': '원시자료LineListing',
        'RAW15': '정기보고LineListing'
    },

    // 워크플로우 단계
    STAGES: {
        LOGIN: 0,
        REPORT_STATUS: 1,
        FILE_UPLOAD: 2,
        MARKDOWN_CONVERSION: 3,
        DATA_EXTRACTION: 4,
        TEMPLATE_WRITING: 5,
        REVIEW: 6,
        QC: 7,
        OUTPUT: 8
    },

    // 페이지 라우팅
    PAGES: {
        LOGIN: 'P01_Login.html',
        SIGNUP: 'P02_Signup.html',
        PASSWORD_RESET: 'P03_PasswordReset.html',
        PASSWORD_CHANGE: 'P04_PasswordChange.html',
        SYSTEM_CHECK: 'P05_SystemCheck.html',
        DASHBOARD: 'P10_Dashboard.html',
        REPORT_LIST: 'P11_ReportList.html',
        REPORT_DETAIL: 'P12_ReportDetail.html',
        NEW_REPORT: 'P13_NewReport.html',
        FILE_UPLOAD: 'P14_FileUpload.html',
        MARKDOWN_CONVERSION: 'P15_MarkdownConversion.html',
        DATA_EXTRACTION: 'P16_DataExtraction.html',
        TEMPLATE_WRITING: 'P17_TemplateWriting.html',
        REVIEW: 'P18_Review.html',
        QC: 'P19_QC.html',
        OUTPUT: 'P20_Output.html'
    }
};

// localStorage 헬퍼 함수
const Storage = {
    get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error(`Error reading from localStorage (${key}):`, e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing to localStorage (${key}):`, e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing from localStorage (${key}):`, e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// 날짜/시간 헬퍼 함수
const DateHelper = {
    now() {
        return new Date();
    },

    formatYYMMDD_hhmmss(date = new Date()) {
        const yy = String(date.getFullYear()).slice(-2);
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const DD = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yy}${MM}${DD}_${hh}${mm}${ss}`;
    },

    formatISO(date = new Date()) {
        return date.toISOString();
    }
};

// Export for ES6 modules
export { CONFIG, Storage, DateHelper };

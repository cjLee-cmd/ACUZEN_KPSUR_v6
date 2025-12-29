# KPSUR UI Components

## 📁 디렉토리 구조

```
05_UI/
├── pages/              # 페이지 HTML 파일
│   ├── P01_Login.html              ✅ 완료
│   ├── P05_SystemCheck.html        ✅ 완료 (시스템 점검)
│   ├── P02_Signup.html             ✅ 완료
│   ├── P03_PasswordReset.html      ✅ 완료
│   ├── P04_PasswordChange.html     ✅ 완료
│   ├── P90_SystemTest.html         ✅ 완료 (시스템 테스트)
│   ├── _template.html              ✅ 완료 (템플릿)
│   └── P10_Dashboard.html          ⏳ 대기
│
├── components/         # 재사용 가능 컴포넌트
│   └── AppLayout.js                ✅ 완료
│
├── styles/             # 스타일시트
│   ├── globals.css                 ✅ 완료
│   ├── layout.css                  ✅ 완료
│   └── theme.ts                    ✅ 완료
│
└── utils/              # 유틸리티 함수
    ├── layout-helper.js            ✅ 완료
    └── test-runner.js              ✅ 완료 (시스템 테스트)
```

## 🎨 디자인 시스템

### 컬러 팔레트

| 색상 | 코드 | 용도 |
|------|------|------|
| Primary | `#25739B` | 주요 파란색 |
| Dark | `#07161D` | 어두운 배경 |
| Accent | `#369EE1` | 강조 파란색 |
| Secondary | `#122E4E` | 보조 어두운 파란색 |
| White | `#FFFFFF` | 흰색 |
| Success | `#10B981` | 성공 |
| Warning | `#F59E0B` | 경고 |
| Error | `#EF4444` | 에러 |
| Info | `#3B82F6` | 정보 |

### Spacing System

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-xxl: 32px
```

## 📄 완료된 페이지

### P-01: 로그인 페이지

**파일**: `pages/P01_Login.html`

**기능**:
- 이메일/비밀번호 입력
- 로그인 상태 유지 체크박스
- 로딩 스피너
- 테스트 계정: `author@kpsur.test` / `test1234`
- 회원가입/비밀번호 찾기 링크

**특징**:
- 그라데이션 배경 애니메이션
- 글래스모피즘 카드 디자인
- 의료용 AI 소프트웨어 뱃지
- 로그인 성공 시 P05_SystemCheck.html로 이동

### P-05: 시스템 점검 페이지

**파일**: `pages/P05_SystemCheck.html`

**기능**:
- 로그인 후 대시보드 진입 전 자동 실행
- LLM (AI 엔진) 연결 테스트
- 데이터베이스 연결 테스트
- 파일 저장소 연결 테스트
- 실시간 진행률 표시 (0% → 100%)
- 테스트 성공 시 자동으로 대시보드 이동 (1초 후)
- 테스트 실패 시 재시도/건너뛰기 옵션

**테스트 항목**:
1. **AI 엔진 연결** (🤖)
   - Gemini API 연결 확인
   - localStorage에서 API 키 로드
   - 간단한 응답 테스트

2. **데이터베이스 연결** (💾)
   - Supabase DB 연결 확인
   - 세션 유효성 검증
   - system_settings 테이블 쿼리

3. **파일 저장소 연결** (📁)
   - Supabase Storage 연결 확인
   - 버킷 목록 조회

**특징**:
- 전체 화면 중앙 레이아웃
- 그라데이션 배경 + 파티클 애니메이션
- 실시간 진행률 바 with shimmer 효과
- 각 테스트 항목별 상태 표시 (대기/진행중/성공/실패)
- Pulse 애니메이션 (진행 중 항목)
- 에러 발생 시 상세 메시지 표시
- 재시도/건너뛰기 옵션 제공
- 테스트 소요 시간: 약 5-10초

**화면 흐름**:
```
P01_Login.html (로그인 성공)
    ↓
P05_SystemCheck.html (시스템 점검)
    ↓ (모든 테스트 통과)
P10_Dashboard.html (대시보드)
```

**에러 처리**:
- LLM 실패: API 키 미설정/잘못된 키
- DB 실패: 세션 만료/연결 오류
- Storage 실패: 권한 부족/연결 오류
- 재시도 버튼: 전체 테스트 재실행
- 건너뛰기 버튼: 확인 후 대시보드로 이동 (경고 표시)

### P-02: 회원가입 페이지

**파일**: `pages/P02_Signup.html`

**기능**:
- 성/이름 입력 (그리드 레이아웃)
- 이메일 입력
- 비밀번호 강도 표시기 (약함/보통/강함)
- 비밀번호 확인
- 조직/기관명
- 역할 선택 (Author/Reviewer/Viewer)
- 약관 동의 (전체 동의 + 개별 체크)

**비밀번호 요구사항**:
- 최소 8자 이상
- 영문 대소문자 포함
- 숫자 포함
- 특수문자 포함 (권장)

### P-03: 비밀번호 재설정 페이지

**파일**: `pages/P03_PasswordReset.html`

**기능**:
- 이메일 입력
- 재설정 링크 전송
- 이메일 형식 검증
- 안내 정보 박스

**특징**:
- 성공 시 자동으로 로그인 페이지로 이동 (3초)
- 스팸 메일함 확인 안내

### P-04: 비밀번호 변경 페이지

**파일**: `pages/P04_PasswordChange.html`

**기능**:
- 새 비밀번호 입력
- 비밀번호 강도 표시기
- 실시간 요구사항 체크
- 비밀번호 확인
- 일치 여부 검증

**특징**:
- 요구사항 충족 여부 실시간 표시
- 모든 요구사항 충족 시에만 버튼 활성화
- 성공 시 로그인 페이지로 이동

### P-90: 시스템 테스트 페이지

**파일**: `pages/P90_SystemTest.html`

**기능**:
- LLM (Gemini API) 연결 테스트
- 데이터베이스 (Supabase) 연결 테스트
- 탭 기반 인터페이스 (LLM / DB)
- 실시간 진행 상황 표시
- 결과 시각화 및 통계
- JSON 결과 내보내기

**LLM 테스트 항목**:
- 기본 연결 테스트
- 한국어 응답 테스트
- JSON 모드 테스트
- 4개 모델 선택 가능 (Gemini 3 Pro, 3 Flash, 2.5 Pro, 2.5 Flash)

**DB 테스트 항목**:
- 기본 연결 테스트
- 인증 테스트
- 테이블 구조 테스트 (11개 테이블)
- RLS (Row Level Security) 테스트
- 성능 테스트

**특징**:
- 로그인 없이 접근 가능 (시스템 진단 목적)
- GitHub Pages 호환 (순수 HTML/CSS/JS)
- Supabase JavaScript SDK 사용
- 로그인 페이지 하단 링크
- 사이드바 메뉴에서도 접근 가능

**관련 파일**:
- `utils/test-runner.js`: 테스트 실행 로직
- `07_Test/01_LLM_Test.md`: LLM 테스트 프로시저
- `07_Test/02_DB_Test.md`: DB 테스트 프로시저

## 🛠️ 레이아웃 컴포넌트

### AppLayout.js

메인 애플리케이션 레이아웃을 관리하는 JavaScript 클래스입니다.

**사용법**:

```javascript
const layout = new AppLayout({
    currentStage: 2,              // 현재 단계 (1-9)
    reportName: '보고서명',        // 보고서 이름
    userName: '사용자',            // 사용자 이름
    userRole: 'Author',           // 역할
    deploymentMode: 'test'        // test 또는 production
});
```

**주요 메서드**:
- `render(contentHtml)` - 전체 레이아웃 HTML 생성
- `renderHeader()` - 헤더 렌더링
- `renderWorkflowSidebar()` - 우측 사이드바 렌더링
- `renderFooter()` - 푸터 렌더링
- `setCurrentStage(stageId)` - 현재 단계 변경
- `setReportName(name)` - 보고서명 변경
- `setDeploymentMode(mode)` - 배포 모드 변경

### layout-helper.js

레이아웃 관리 유틸리티 함수 모음입니다.

**주요 함수**:

```javascript
// 레이아웃 초기화
initializeLayout(options)

// LLM 로딩 표시
showLLMLoading('AI가 데이터를 처리하고 있습니다...')
hideLLMLoading()

// 토스트 메시지
showToast('메시지', 'success')  // success, error, warning, info

// 진행 상황 업데이트
updateWorkflowProgress(stageId)

// 보고서명 업데이트
updateReportName('새 보고서명')

// 배포 모드 변경
updateDeploymentMode('production')

// 세션 관리
loadSessionData()
saveSessionData(data)

// 권한 체크
checkPermission('Author')  // Master, Author, Reviewer, Viewer

// 페이지 이동
navigateTo('P10_Dashboard.html')

// 로그아웃
logout()
```

## 📝 페이지 템플릿 사용법

`pages/_template.html`을 복사하여 새 페이지를 생성하세요.

### 1. HTML 파일 복사

```bash
cp pages/_template.html pages/P10_Dashboard.html
```

### 2. 페이지 정보 수정

```html
<title>대시보드 - KPSUR AGENT | ACUZEN AI</title>
```

### 3. 현재 단계 설정

```html
<!-- Workflow Sidebar에서 해당 단계를 current로 변경 -->
<div class="workflow-stage current">
    <div class="stage-icon">📋</div>
    <div class="stage-info">
        <div class="stage-name">Stage 2</div>
        <div class="stage-label">보고서 상태</div>
    </div>
    <div class="stage-status">◉</div>
</div>
```

### 4. 진행률 업데이트

```html
<div class="progress-fill" style="width: 22%"></div>
<div class="progress-text">2 / 9 단계</div>
```

**진행률 계산**:
- Stage 1: 0%
- Stage 2: 12.5% (1/8)
- Stage 3: 25% (2/8)
- Stage 4: 37.5% (3/8)
- ...
- Stage 9: 100%

### 5. 페이지 콘텐츠 작성

```html
<main class="main-content">
    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">페이지 제목</h1>
            <p class="page-description">설명</p>
        </div>

        <div class="content-card">
            <h2 class="card-title">섹션 제목</h2>
            <!-- 콘텐츠 -->
        </div>
    </div>
</main>
```

## 🎯 워크플로우 단계 (9 Stages)

| Stage | 이름 | 아이콘 | 설명 |
|-------|------|--------|------|
| 1 | Login | 🔐 | 로그인 |
| 2 | Report Status | 📋 | 보고서 상태 |
| 3 | File Upload | 📤 | 파일 업로드 |
| 4 | Markdown | 🔄 | 마크다운 변환 |
| 5 | Data Extract | ⚙️ | 데이터 추출 |
| 6 | Template | 📄 | 템플릿 작성 |
| 7 | Review | ✏️ | 리뷰 |
| 8 | QC | ✅ | QC 검증 |
| 9 | Output | 📤 | 최종 출력 |

## 🎨 디자인 특징

### 컴팩트 디자인

의료용 소프트웨어 특성을 고려한 정보 밀집형 UI:
- 최소화된 여백 (`--spacing-xs` ~ `--spacing-xl`)
- 작은 폰트 크기 (10px ~ 16px)
- 높은 정보 밀도

### LLM 마법 효과

LLM 처리 시 시각적 피드백:

```javascript
showLLMLoading('AI가 데이터를 처리하고 있습니다...');
// ... LLM 처리 ...
hideLLMLoading();
```

**CSS 애니메이션**:
- `magicGlow` - 글로우 효과
- `magicParticles` - 파티클 효과
- `.magic-effect` 클래스 적용

### 우측 사이드바

워크플로우 진행 상황 표시:
- 진행률 바 (0% ~ 100%)
- 9개 단계 표시
- 현재/완료/대기 상태 구분
- 의료용 AI 소프트웨어 뱃지

### 배포 모드 뱃지

- **테스트 모드**: 노란색 뱃지
- **프로덕션 모드**: 빨간색 뱃지

## 🔒 권한 시스템

역할별 권한 레벨:
1. **Master** (4) - 모든 권한
2. **Author** (3) - 작성/수정 권한
3. **Reviewer** (2) - 리뷰 권한
4. **Viewer** (1) - 읽기 전용

```javascript
if (checkPermission('Author')) {
    // Author 이상 권한 필요한 작업
}
```

## 📱 반응형 디자인

### Desktop (> 1024px)
- 전체 레이아웃 표시
- 우측 사이드바 280px

### Tablet (768px ~ 1024px)
- 우측 사이드바 240px
- 콘텐츠 패딩 축소

### Mobile (< 768px)
- 사이드바 숨김
- Breadcrumb 숨김
- 최소 패딩

## 🚀 다음 작업

### 대기 중인 페이지 (16개)

1. **P-10**: Dashboard (대시보드)
2. **P-11**: Report List (보고서 목록)
3. **P-12**: Report Detail (보고서 상세)
4. **P-13**: New Report (새 보고서)
5. **P-14**: File Upload (파일 업로드)
6. **P-15**: Markdown Conversion (마크다운 변환)
7. **P-16**: Data Extraction (데이터 추출)
8. **P-17**: Template (템플릿)
9. **P-18**: Review (리뷰)
10. **P-19**: QC (QC 검증)
11. **P-20**: Output (최종 출력)
12. **P-30**: User Management (사용자 관리)
13. **P-31**: System Settings (시스템 설정)
14. **P-32**: Audit Log (감사 로그)
15. **P-33**: Profile (내 프로필)
16. **P-34**: Drug Master DB (약품명 DB)

### 추가 컴포넌트 (111개)

- shadcn/ui 공통 컴포넌트 (39개)
- Stage별 전용 컴포넌트 (72개)

### 모달 & 토스트

- 모달 50개
- 토스트 35개

## 📚 참고 문서

- **UI Component List**: `/09_relateDocs/07_UI_ComponentList.md`
- **Workflow**: `/01_Context/01_Workflow.md`
- **Theme**: `/05_UI/styles/theme.ts`
- **Global Styles**: `/05_UI/styles/globals.css`
- **Layout Styles**: `/05_UI/styles/layout.css`

## 💡 개발 팁

### 1. 세션 확인

모든 로그인 필요 페이지에서:

```javascript
const session = loadSessionData();
if (!session) {
    window.location.href = 'P01_Login.html';
    return;
}
```

### 2. LLM 사용

```javascript
async function processData() {
    showLLMLoading('AI가 데이터를 분석하고 있습니다...');

    try {
        const result = await callLLMAPI(data);
        showToast('분석이 완료되었습니다.', 'success');
        return result;
    } catch (error) {
        showToast('오류가 발생했습니다.', 'error');
    } finally {
        hideLLMLoading();
    }
}
```

### 3. 진행 상황 업데이트

```javascript
// 다음 단계로 이동
updateWorkflowProgress(currentStage + 1);
```

### 4. 토스트 메시지

```javascript
showToast('저장되었습니다.', 'success');
showToast('경고: 데이터를 확인하세요.', 'warning');
showToast('오류가 발생했습니다.', 'error');
showToast('정보를 확인하세요.', 'info');
```

---

**버전**: 1.0
**최종 업데이트**: 2025-12-29
**작성자**: Claude Code
**라이선스**: Copyright. Power Solution., Inc. 2026.

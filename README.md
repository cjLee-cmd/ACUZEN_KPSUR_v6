# KPSUR AGENT v1.0

**한국 제약 안전성 보고서 자동 작성 시스템**

KPSUR (Korean Safety Update Report) AGENT는 제약사 약물감시 결과를 자동으로 작성하는 웹 기반 애플리케이션입니다.

---

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [기능](#기능)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [사용법](#사용법)
- [워크플로우](#워크플로우)
- [프로젝트 구조](#프로젝트-구조)
- [개발 가이드](#개발-가이드)

---

## 프로젝트 개요

KPSUR AGENT는 9단계 워크플로우를 통해 제약 보고서를 자동으로 생성합니다:

1. **로그인** - 사용자 인증 (Master/Author/Reviewer/Viewer)
2. **보고서 상태** - 신규 작성 또는 계속 작성 선택
3. **파일 업로드** - 소스 문서 업로드 및 자동 분류 (RAW ID 태깅)
4. **마크다운 변환** - PDF/Excel/Word → Markdown
5. **데이터 추출** - CS/PH/Table 데이터 자동 추출
6. **템플릿 작성** - 추출 데이터를 보고서 템플릿에 삽입
7. **리뷰** - 섹션별 검토 및 수정
8. **QC 검증** - 품질 검증 및 오류 확인
9. **최종 출력** - Word 문서 생성 및 다운로드

---

## 기능

### 🔐 인증 및 권한 관리
- 역할 기반 접근 제어 (RBAC)
- 세션 관리 (Remember Me 기능)
- 테스트 계정 + Supabase Auth 통합

### 📁 파일 처리
- PDF, Excel, Word 문서 업로드
- LLM 기반 자동 문서 분류 (15가지 RAW ID)
- Markdown 변환 (원본 내용 보존)

### 🤖 AI 기반 자동화
- Google Gemini API 연동
- 문서 분류 자동화
- 데이터 추출 자동화 (60+ CS 변수, 10+ PH 변수, 7-9 테이블)
- QC 검증 자동화

### 💾 데이터 관리
- Supabase PostgreSQL 데이터베이스
- Supabase Storage (파일 저장)
- 로컬 localStorage (세션, 임시 데이터)

### 📊 보고서 생성
- 템플릿 기반 보고서 작성
- 섹션별 리뷰 및 수정
- Word 문서 출력

---

## 기술 스택

### Frontend
- **HTML5** / **CSS3** / **JavaScript (ES6+)**
- **Vanilla JS** (프레임워크 없음 - GitHub Pages 호환)
- **ES6 Modules** (모듈화)

### Backend (Serverless)
- **Supabase** - PostgreSQL 데이터베이스
- **Supabase Storage** - 파일 저장소
- **Supabase Auth** - 사용자 인증

### AI/LLM
- **Google Gemini API** (gemini-2.0-flash-exp / gemini-2.0-pro-exp)
- 문서 분류, MD 변환, 데이터 추출

### 배포
- **GitHub Pages** - 정적 사이트 호스팅
- **HTTPS** - 자동 SSL 인증서

---

## 설치 및 실행

### 1️⃣ 사전 준비

#### Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. API 키 확인:
   - Settings → API → URL 및 anon key 복사

#### Google Gemini API 키 발급
1. [Google AI Studio](https://ai.google.dev/) 접속
2. API Key 발급
3. 키 복사

### 2️⃣ 로컬 실행

```bash
# 프로젝트 클론
git clone https://github.com/cjLee-cmd/ACUZEN_KPSUR_v6.git
cd ACUZEN_KPSUR_v6/10_SW/001_v1

# 로컬 서버 실행 (Python)
python3 -m http.server 8000

# 또는 Node.js
npx serve

# 브라우저에서 http://localhost:8000 접속
```

### 3️⃣ API 키 설정

첫 로그인 후 다음 설정 필요:

1. **로그인**: `main@main.com` / `1111`
2. **개발자 도구 (F12)** 열기
3. **Console** 탭에서 실행:

```javascript
localStorage.setItem("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY");
```

---

## 사용법

### 로그인

**테스트 계정**:
- Master: `main@main.com` / `1111`
- Author: `author@kpsur.test` / `test1234`

### 새 보고서 생성

1. 대시보드 → **"➕ 새 보고서 생성"** 클릭
2. 보고서 기본 정보 입력:
   - 보고서 제출일
   - 버전 번호
   - 유효기간
   - 1일 사용량
   - 환자당 사용량
   - MedDRA 버전
3. **"생성"** 버튼 클릭

### 파일 업로드 및 분류

1. **소스 문서 업로드**
2. LLM이 자동으로 문서 분류 (RAW ID 태깅)
3. 분류 결과 확인 및 수정

### 데이터 추출 및 보고서 작성

1. **마크다운 변환** - 자동 실행
2. **데이터 추출** - CS/PH/Table 데이터 자동 추출
3. **템플릿 작성** - 추출 데이터를 템플릿에 자동 삽입
4. **리뷰** - 섹션별 검토 및 수정
5. **QC 검증** - 품질 확인
6. **최종 출력** - Word 문서 다운로드

---

## 워크플로우

```
┌─────────────┐
│  1. 로그인   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ 2. 보고서 상태   │ ← 신규 / 계속 작성
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 3. 파일 업로드   │ ← LLM 자동 분류 (RAW ID)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 4. MD 변환       │ ← PDF/Excel/Word → Markdown
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 5. 데이터 추출   │ ← CS/PH/Table 데이터
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 6. 템플릿 작성   │ ← 데이터 삽입
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 7. 리뷰          │ ← 섹션별 수정
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 8. QC 검증       │ ← 품질 확인
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 9. 최종 출력     │ → Word 문서 다운로드
└─────────────────┘
```

---

## 프로젝트 구조

```
10_SW/001_v1/
├── index.html                  # 진입점 (자동 리다이렉트)
│
├── pages/                      # UI 페이지
│   ├── P01_Login.html          # 로그인
│   ├── P05_SystemCheck.html    # 시스템 점검
│   ├── P10_Dashboard.html      # 대시보드
│   ├── P13_NewReport.html      # 새 보고서
│   ├── P14_FileUpload.html     # 파일 업로드
│   ├── P15_MarkdownConversion.html
│   ├── P16_DataExtraction.html
│   ├── P17_TemplateWriting.html
│   ├── P18_Review.html
│   ├── P19_QC.html
│   └── P20_Output.html
│
├── js/                         # JavaScript 모듈
│   ├── config.js               # 설정 관리
│   ├── supabase-client.js      # Supabase 연결
│   ├── llm-client.js           # LLM 연결
│   ├── auth.js                 # 인증/세션
│   ├── file-handler.js         # 파일 처리 (TODO)
│   ├── markdown-converter.js   # MD 변환 (TODO)
│   ├── data-extractor.js       # 데이터 추출 (TODO)
│   ├── template-writer.js      # 템플릿 작성 (TODO)
│   ├── review-manager.js       # 리뷰 관리 (TODO)
│   ├── qc-validator.js         # QC 검증 (TODO)
│   └── output-generator.js     # 출력 생성 (TODO)
│
├── css/styles/                 # 스타일시트
│   └── globals.css
│
├── assets/                     # 리소스
│
└── data/                       # 로컬 데이터 저장
```

---

## 개발 가이드

### 모듈 구조

모든 기능은 ES6 모듈로 분리되어 있습니다:

```javascript
// 모듈 import
import { CONFIG, Storage } from './config.js';
import supabaseClient from './supabase-client.js';
import llmClient from './llm-client.js';
import authManager from './auth.js';

// 사용 예시
const user = authManager.getCurrentUser();
const reports = await supabaseClient.getReports(user.id);
const result = await llmClient.generateContent(prompt);
```

### 데이터 흐름

```
사용자 입력 → UI (HTML)
     ↓
JavaScript 모듈 (auth.js, file-handler.js 등)
     ↓
Supabase Client / LLM Client
     ↓
Supabase DB / Gemini API
     ↓
응답 처리 → UI 업데이트
```

### 보안 고려사항

#### ✅ GitHub Pages 안전 사항
- API 키는 localStorage에 저장 (사용자별 관리)
- Supabase RLS로 데이터 접근 제어
- HTTPS 자동 적용

#### ⚠️ 주의사항
- `.env` 파일은 GitHub에 올리지 않음 (`.gitignore`에 추가)
- API 키는 절대 하드코딩하지 않음
- 민감한 데이터는 Supabase RLS로 보호

---

## 데이터 정의

### RAW ID (소스 문서 분류)

| RAW ID | 설명 |
|--------|------|
| RAW1 | 최신첨부문서 |
| RAW2.1 | 용법용량 |
| RAW2.2 | 효능효과 |
| RAW2.3 | 사용상의주의사항 |
| RAW3 | 시판후sales데이터 |
| RAW4 | 허가현황 |
| RAW12 | 국내신속보고LineListing |
| RAW14 | 원시자료LineListing |
| RAW15 | 정기보고LineListing |

### 데이터 타입

1. **CS Data (Context-Specific)** - 약 60개 변수
   - 단일 값 데이터 (텍스트, 날짜, 숫자)
   - 예: CS0_성분명, CS1_브랜드명, CS5_국내허가일자

2. **PH Data (Paragraph/Phrase)** - 약 10개 변수
   - 서술형 텍스트 (문장/단락)
   - 예: PH4_원시자료서술문, PH11_총괄평가문

3. **Table Data** - 7-9개 테이블
   - 구조화된 테이블 데이터
   - 예: 표2_연도별판매량, 표5_신속보고내역

---

## 📊 개발 상태

### ✅ Phase 1: 핵심 모듈 구현 (완료)
- 11개 JavaScript 모듈 완성 (~3,009줄)
- 인증, 파일 처리, MD 변환, 데이터 추출, 템플릿 작성, 리뷰, QC, 출력

### ✅ Phase 2: UI 통합 (완료)
- 7개 UI 페이지에 모듈 통합
- P14-P20: 파일 업로드 → 출력까지 전체 워크플로우 연결
- localStorage 기반 페이지 간 데이터 전달

### 🔄 Phase 3: 라이브러리 통합 (선택사항)
- PDF.js, SheetJS, mammoth.js - 파일 파싱
- docx, JSZip - 문서 생성

### ✅ Phase 4: 테스트 (완료)
- ✅ E2E 테스트 시나리오 작성
- ✅ 통합 검증 스크립트 완료
- ✅ 테스트 문서화 (TESTING.md)

### 🔄 Phase 5: 배포 준비 (진행 중)
- ✅ 배포 가이드 작성 (DEPLOYMENT.md)
- ✅ 보안 검증 자동화 (security-check.sh)
- ✅ 환경별 설정 (env.js)
- ✅ 테스트 계정 자동 제어
- ⏳ GitHub Pages 배포 대기

**최종 업데이트**: 2025-12-29
**현재 브랜치**: develop
**다음 단계**: GitHub Pages 배포 및 프로덕션 설정

---

## 라이선스

Copyright © 2026 Power Solution., Inc.

---

## 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/cjLee-cmd/ACUZEN_KPSUR_v6/issues)

# KSUR 기술 스택

## 아키텍처 개요

**배포 방식**: Serverless (GitHub Pages + Supabase)

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Pages                             │
│                  (정적 사이트 호스팅)                          │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  React SPA + TypeScript                        │         │
│  │  - Vite 번들러                                  │         │
│  │  - Tailwind CSS                                │         │
│  │  - shadcn/ui 컴포넌트                           │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                     Supabase                                 │
│                                                              │
│  - Auth: 사용자 인증 (RLS 기반)                              │
│  - PostgreSQL: 데이터베이스                                  │
│  - Storage: 파일 저장소                                      │
│  - Edge Functions: 서버리스 함수 (Deno)                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Google Gemini API                           │
│              (Edge Functions 경유로 호출)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 프론트엔드

### 1.1 프레임워크 및 빌드 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 18.x | UI 프레임워크 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Vite** | 5.x | 빌드 도구 및 개발 서버 |
| **React Router** | 6.x | 클라이언트 라우팅 |

**선택 이유:**
- React: 풍부한 생태계, Supabase 공식 지원
- TypeScript: 타입 안전성, 개발 생산성
- Vite: 빠른 개발 서버, 최적화된 빌드

### 1.2 UI 라이브러리

| 기술 | 용도 |
|------|------|
| **Tailwind CSS** | 유틸리티 CSS 프레임워크 |
| **shadcn/ui** | 재사용 가능한 컴포넌트 |
| **Radix UI** | 접근성 준수 Headless 컴포넌트 |
| **Lucide React** | 아이콘 |

**선택 이유:**
- Tailwind: 빠른 스타일링, 일관된 디자인
- shadcn/ui: 커스터마이징 가능, 복사-붙여넣기 방식
- Radix UI: 접근성(a11y) 기본 제공

### 1.3 상태 관리

| 기술 | 용도 |
|------|------|
| **Zustand** | 전역 상태 관리 |
| **React Query** | 서버 상태 관리 (캐싱, 동기화) |
| **React Hook Form** | 폼 상태 관리 |

**선택 이유:**
- Zustand: 간단한 API, 보일러플레이트 적음
- React Query: Supabase 데이터 캐싱 및 동기화
- React Hook Form: 성능, 검증 기능

### 1.4 파일 처리

| 기술 | 용도 |
|------|------|
| **xlsx** | Excel 파일 파싱 |
| **mammoth.js** | Word 파일 읽기 (백업용) |
| **pdf.js** | PDF 뷰어 (미리보기용) |
| **docxtemplater** | Word 파일 생성 |
| **pizzip** | docxtemplater 의존성 |

**선택 이유:**
- 파일 파싱은 주로 Gemini API 사용
- 클라이언트 라이브러리는 미리보기/검증용
- docxtemplater: 최종 Word 보고서 생성

### 1.5 마크다운 처리

| 기술 | 용도 |
|------|------|
| **react-markdown** | 마크다운 렌더링 |
| **remark-gfm** | GitHub Flavored Markdown 지원 |
| **rehype-sanitize** | XSS 방지 |

---

## 2. 백엔드 (Serverless)

### 2.1 Supabase

| 서비스 | 용도 | 접근 방식 |
|--------|------|-----------|
| **Supabase Auth** | 사용자 인증 | 클라이언트 SDK |
| **PostgreSQL** | 데이터베이스 | 클라이언트 SDK + RLS |
| **Storage** | 파일 저장소 | 클라이언트 SDK + RLS |
| **Edge Functions** | 서버리스 함수 | HTTP 요청 |

**Supabase 클라이언트 SDK:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### 2.2 Edge Functions (Deno)

**배포 위치:** Supabase 클라우드
**런타임:** Deno

**함수 목록:**

| 함수명 | 엔드포인트 | 용도 |
|--------|-----------|------|
| `classify-raw-id` | `/functions/v1/classify-raw-id` | RAW ID 자동 분류 |
| `convert-to-markdown` | `/functions/v1/convert-to-markdown` | 파일 → 마크다운 변환 |
| `extract-data` | `/functions/v1/extract-data` | CS/PH/Table 데이터 추출 |
| `qc-validation` | `/functions/v1/qc-validation` | QC 검증 |

**공통 기술:**
- Deno 런타임
- `@google/generative-ai` (Gemini SDK)
- Supabase Admin SDK (서버 권한)

---

## 3. LLM 서비스

### 3.1 Google Gemini API

| 모델 | 용도 | RPM | TPM |
|------|------|-----|-----|
| **Gemini 2.0 Flash** | 기본 작업 (분류, 변환, 추출) | 15 | 1M |
| **Gemini 2.0 Flash-Thinking** | 복잡한 분석 (QC) | 15 | 1M |

**호출 방식:**
```typescript
// Edge Function 내부에서만 호출
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
```

**기능별 모델 선택:**
- RAW ID 분류: Gemini 2.0 Flash
- 마크다운 변환: Gemini 2.0 Flash (Vision)
- 데이터 추출: Gemini 2.0 Flash
- QC 검증: Gemini 2.0 Flash-Thinking

---

## 4. 데이터베이스

### 4.1 Supabase PostgreSQL

**버전:** PostgreSQL 15.x

**주요 확장:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

**테이블 목록:** `01_DataBaseStructure.md` 참조

### 4.2 Storage Buckets

| 버킷명 | 용도 | Public |
|--------|------|--------|
| `reports` | 원본 소스 문서 (PDF, Excel, Word) | No |
| `markdown` | 변환된 마크다운 (백업) | No |
| `outputs` | 최종 출력 문서 (Word) | No |

**RLS 정책 적용 필수**

---

## 5. 배포 및 CI/CD

### 5.1 GitHub Actions

**워크플로우 파일:** `.github/workflows/deploy.yml`

**주요 작업:**
1. 코드 체크아웃
2. Node.js 설치 (18.x)
3. 의존성 설치 (`npm ci`)
4. TypeScript 컴파일 검사
5. Vite 빌드
6. GitHub Pages 배포

**환경변수 (GitHub Secrets):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 5.2 GitHub Pages

**설정:**
- Source: `gh-pages` 브랜치
- Custom Domain: (선택사항)
- HTTPS 강제: 활성화

**배포 URL:**
```
https://{username}.github.io/{repository-name}/
```

---

## 6. 개발 도구

### 6.1 코드 품질

| 도구 | 용도 |
|------|------|
| **ESLint** | JavaScript/TypeScript 린팅 |
| **Prettier** | 코드 포맷팅 |
| **TypeScript** | 정적 타입 검사 |
| **Husky** | Git Hooks |
| **lint-staged** | Pre-commit 린팅 |

### 6.2 테스트 (선택사항)

| 도구 | 용도 |
|------|------|
| **Vitest** | 단위 테스트 |
| **React Testing Library** | 컴포넌트 테스트 |
| **Playwright** | E2E 테스트 (선택사항) |

---

## 7. 환경 설정

### 7.1 로컬 개발 환경

**필수 도구:**
- Node.js 18.x 이상
- npm 9.x 이상
- Git

**환경변수 파일 (`.env.local`):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 7.2 Supabase 로컬 개발 (선택사항)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경 시작
supabase start

# Edge Functions 로컬 테스트
supabase functions serve
```

---

## 8. 프로젝트 구조

```
ksur-v6/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── public/                     # 정적 자산
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── auth/               # 인증 관련
│   │   ├── report/             # 보고서 관련
│   │   └── review/             # 리뷰 관련
│   ├── lib/
│   │   ├── supabase.ts         # Supabase 클라이언트
│   │   ├── api/                # API 호출 함수
│   │   └── utils/              # 유틸리티
│   ├── hooks/                  # Custom React Hooks
│   ├── stores/                 # Zustand 스토어
│   ├── types/                  # TypeScript 타입
│   ├── pages/                  # 페이지 컴포넌트
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── classify-raw-id/
│   │   ├── convert-to-markdown/
│   │   ├── extract-data/
│   │   └── qc-validation/
│   └── migrations/             # DB 마이그레이션
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 9. 의존성 목록

### 9.1 주요 의존성 (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.14.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-sanitize": "^6.0.0",
    "xlsx": "^0.18.5",
    "mammoth": "^1.6.0",
    "docxtemplater": "^3.42.0",
    "pizzip": "^3.1.6",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

---

## 10. 성능 최적화

### 10.1 빌드 최적화

- Code Splitting (React.lazy)
- Tree Shaking (Vite 자동)
- 이미지 최적화 (WebP)
- CSS Purging (Tailwind 자동)

### 10.2 런타임 최적화

- React Query 캐싱 전략
- Virtual Scrolling (대량 데이터)
- Web Workers (파일 처리)
- Debounce/Throttle (입력 핸들러)

### 10.3 로딩 전략

```typescript
// 코드 스플리팅 예시
const ReportPage = lazy(() => import('./pages/ReportPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
```

---

## 11. 보안

### 11.1 클라이언트 사이드

- XSS 방지: rehype-sanitize
- CSRF 방지: Supabase Auth 자동 처리
- Content Security Policy 설정

### 11.2 서버 사이드

- RLS (Row Level Security) 필수
- Edge Functions 환경변수에 API 키 저장
- HTTPS 강제
- Rate Limiting (Supabase 자동)

---

## 12. 모니터링 및 로깅

### 12.1 프론트엔드

- 에러 추적: Sentry (선택사항)
- 분석: Google Analytics (선택사항)

### 12.2 백엔드

- Supabase Dashboard: DB 쿼리 모니터링
- Edge Functions 로그: Supabase Logs
- API 사용량: Google Cloud Console (Gemini)

---

## 13. 비용 추정

### 월간 예상 비용 (소규모 사용)

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| GitHub Pages | 무료 | $0 |
| Supabase | 무료 | $0 |
| Gemini API | 무료 할당량 | $0 |
| **합계** | | **$0** |

### 월간 예상 비용 (중규모 사용)

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| GitHub Pages | 무료 | $0 |
| Supabase | Pro | $25 |
| Gemini API | Pay-as-you-go | ~$10-50 |
| **합계** | | **$35-75** |

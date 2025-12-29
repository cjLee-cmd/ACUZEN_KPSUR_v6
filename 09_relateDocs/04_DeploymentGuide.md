# KSUR 배포 가이드

## 배포 아키텍처

```
개발 환경 (로컬)
    ↓ git push
GitHub Repository
    ↓ GitHub Actions
GitHub Pages (프론트엔드)
    ↓ API 호출
Supabase (백엔드)
    ↓ LLM 호출
Google Gemini API
```

---

## 사전 준비

### 1. 계정 생성

- [ ] GitHub 계정
- [ ] Supabase 계정 (https://supabase.com)
- [ ] Google Cloud 계정 (Gemini API)

### 2. 로컬 환경

- [ ] Node.js 18.x 이상 설치
- [ ] Git 설치
- [ ] 코드 에디터 (VS Code 권장)

---

## Part 1: Supabase 설정

### Step 1: 프로젝트 생성

1. https://supabase.com 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `ksur-production`
   - Database Password: 강력한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)` (한국 선택)
   - Pricing Plan: `Free` (시작 시)

4. "Create new project" 클릭 (1-2분 소요)

### Step 2: 데이터베이스 스키마 생성

1. Supabase Dashboard → SQL Editor
2. `01_DataBaseStructure.md`의 SQL 스크립트 복사
3. 순서대로 실행:

**1) UUID 확장 활성화:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**2) updated_at 트리거 함수:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

**3) 테이블 생성 (순서 중요):**
```sql
-- users 테이블
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('Master', 'Author', 'Reviewer', 'Viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- reports 테이블
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_name varchar(255) UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'QC', 'Completed')),
  current_stage int DEFAULT 1,
  user_inputs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 나머지 테이블들...
```

**4) 트리거 적용:**
```sql
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Storage 버킷 생성

1. Supabase Dashboard → Storage
2. "Create bucket" 클릭
3. 버킷 생성:

**reports 버킷:**
- Name: `reports`
- Public: `false` (체크 해제)
- "Create bucket" 클릭

**markdown 버킷:**
- Name: `markdown`
- Public: `false`

**outputs 버킷:**
- Name: `outputs`
- Public: `false`

### Step 4: RLS (Row Level Security) 정책 설정

1. Supabase Dashboard → Authentication → Policies
2. 각 테이블에 정책 추가 (`05_SecurityBestPractices.md` 참조)

**예시: reports 테이블**
```sql
-- 사용자는 자신이 생성한 보고서만 조회
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (created_by = auth.uid());

-- Author는 보고서 생성 가능
CREATE POLICY "Authors can create reports"
ON reports FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Author')
  )
);
```

### Step 5: API 키 확인

1. Supabase Dashboard → Settings → API
2. 다음 값 복사 (나중에 사용):
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon public` key: `eyJ...`
   - `service_role` key: `eyJ...` (Edge Functions용)

---

## Part 2: Google Gemini API 설정

### Step 1: Google AI Studio 접속

1. https://aistudio.google.com 접속
2. Google 계정으로 로그인

### Step 2: API 키 생성

1. 좌측 메뉴 → "Get API key" 클릭
2. "Create API key" 클릭
3. 프로젝트 선택 또는 새 프로젝트 생성
4. API 키 복사 (예: `AIza...`)

### Step 3: 사용량 제한 설정 (선택사항)

1. Google Cloud Console 접속
2. API & Services → Credentials
3. API 키 선택 → "API restrictions"
4. "Restrict key" → "Generative Language API" 선택
5. 할당량 설정 (무료 플랜: 15 RPM, 1M TPM)

---

## Part 3: GitHub Repository 설정

### Step 1: Repository 생성

1. GitHub 로그인
2. "New repository" 클릭
3. Repository 정보 입력:
   - Repository name: `ksur-v6`
   - Description: `Korean Safety Update Report System`
   - Visibility: `Private` 또는 `Public`
   - Initialize: ☑️ Add a README file

4. "Create repository" 클릭

### Step 2: Secrets 설정

1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 시크릿 추가:

| Name | Value | 설명 |
|------|-------|------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Edge Functions용 |
| `GEMINI_API_KEY` | `AIza...` | Gemini API 키 |

### Step 3: GitHub Pages 활성화

1. Repository → Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `/ (root)`
4. "Save" 클릭

---

## Part 4: 로컬 개발 환경 설정

### Step 1: 프로젝트 클론

```bash
git clone https://github.com/your-username/ksur-v6.git
cd ksur-v6
```

### Step 2: 프로젝트 초기화

```bash
# Vite + React + TypeScript 템플릿 생성
npm create vite@latest . -- --template react-ts

# 의존성 설치
npm install

# 추가 패키지 설치
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install react-markdown remark-gfm rehype-sanitize
npm install xlsx mammoth docxtemplater pizzip
npm install lucide-react clsx tailwind-merge

# 개발 의존성
npm install -D tailwindcss autoprefixer postcss
npm install -D @types/node
npm install -D eslint prettier
```

### Step 3: Tailwind CSS 설정

```bash
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: 환경변수 설정

**.env.local 파일 생성:**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**.gitignore 확인:**
```
.env.local
.env*.local
```

### Step 5: Supabase 클라이언트 설정

**src/lib/supabase.ts:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 6: 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## Part 5: Supabase Edge Functions 배포

### Step 1: Supabase CLI 설치

```bash
npm install -g supabase
```

### Step 2: 로그인

```bash
supabase login
```

브라우저에서 인증 후 토큰 복사

### Step 3: 프로젝트 연결

```bash
supabase link --project-ref xxxxx
```

Project ref는 Supabase Dashboard → Settings → General에서 확인

### Step 4: Edge Functions 생성

**프로젝트 루트에 supabase 폴더 생성:**
```bash
mkdir -p supabase/functions
```

**함수 생성:**
```bash
supabase functions new classify-raw-id
supabase functions new convert-to-markdown
supabase functions new extract-data
supabase functions new qc-validation
```

### Step 5: 함수 코드 작성

`03_SupabaseEdgeFunctions.md`의 구현 예시 참조

**supabase/functions/classify-raw-id/index.ts:**
```typescript
// 03_SupabaseEdgeFunctions.md의 코드 복사
```

### Step 6: 환경변수 설정

```bash
supabase secrets set GEMINI_API_KEY=AIza...
```

### Step 7: Edge Functions 배포

```bash
# 단일 함수 배포
supabase functions deploy classify-raw-id

# 모든 함수 배포
supabase functions deploy
```

### Step 8: 배포 확인

```bash
# 함수 목록 확인
supabase functions list

# 로그 확인
supabase functions logs classify-raw-id
```

---

## Part 6: GitHub Actions 워크플로우 설정

### Step 1: 워크플로우 파일 생성

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Type check
      run: npx tsc --noEmit

    - name: Lint
      run: npm run lint

    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build

    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

### Step 2: package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### Step 3: Base URL 설정 (중요!)

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ksur-v6/', // Repository 이름과 일치해야 함
})
```

### Step 4: Router Base 설정

**src/main.tsx:**
```typescript
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/ksur-v6">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## Part 7: 첫 배포

### Step 1: 코드 커밋

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: GitHub Actions 확인

1. Repository → Actions 탭
2. 워크플로우 실행 확인 (자동 시작)
3. 빌드 및 배포 로그 확인

### Step 3: 배포 확인

1. Repository → Settings → Pages
2. "Your site is live at ..." 확인
3. URL 클릭하여 사이트 접속

**예시 URL:**
```
https://your-username.github.io/ksur-v6/
```

---

## Part 8: 업데이트 배포

### 코드 변경 후

```bash
git add .
git commit -m "Update: 기능 추가"
git push origin main
```

GitHub Actions가 자동으로 빌드 및 배포 수행

---

## 트러블슈팅

### 1. GitHub Pages가 404 에러

**원인:** `base` 설정 누락

**해결:**
```typescript
// vite.config.ts
base: '/repository-name/'
```

### 2. Supabase 연결 실패

**원인:** 환경변수 누락

**해결:**
1. GitHub Secrets 확인
2. `.env.local` 파일 확인
3. `import.meta.env` 사용 확인

### 3. Edge Functions 호출 실패

**원인:** CORS 설정 누락

**해결:**
```typescript
// Edge Function에 CORS 헤더 추가
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 4. Gemini API 호출 실패

**원인:** API 키 설정 누락

**해결:**
```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase functions deploy
```

### 5. 빌드 실패 (Type Error)

**원인:** TypeScript 에러

**해결:**
```bash
# 로컬에서 타입 체크
npm run build

# 에러 수정 후 다시 push
```

---

## 모니터링

### GitHub Actions

- Repository → Actions → 최근 워크플로우
- 빌드 시간, 성공/실패 확인

### Supabase Dashboard

- **Database**: 쿼리 성능, 연결 수
- **Storage**: 저장 용량
- **Edge Functions**: 호출 횟수, 에러율
- **Auth**: 활성 사용자 수

### Google Cloud Console

- Gemini API 사용량
- 할당량 소진율
- 에러 로그

---

## 백업 및 복구

### 데이터베이스 백업

```bash
# Supabase CLI로 백업
supabase db dump -f backup.sql

# 복구
supabase db reset
psql -h db.xxxxx.supabase.co -U postgres -f backup.sql
```

### Storage 백업

Supabase Dashboard → Storage → 각 버킷 → Download

---

## 프로덕션 체크리스트

배포 전 확인:

- [ ] 모든 환경변수 설정 완료
- [ ] RLS 정책 적용 완료
- [ ] Edge Functions 배포 완료
- [ ] GitHub Actions 워크플로우 테스트 완료
- [ ] 로컬 빌드 성공 확인
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 테스트 통과 (있는 경우)
- [ ] 보안 가이드 검토 (`05_SecurityBestPractices.md`)
- [ ] API 사용량 제한 설정
- [ ] 에러 모니터링 설정 (선택사항)

---

## 다음 단계

1. **사용자 초대**: Supabase Dashboard → Authentication → Users
2. **커스텀 도메인**: GitHub Pages → Custom domain 설정
3. **성능 최적화**: Lighthouse 점수 확인
4. **보안 강화**: `05_SecurityBestPractices.md` 참조

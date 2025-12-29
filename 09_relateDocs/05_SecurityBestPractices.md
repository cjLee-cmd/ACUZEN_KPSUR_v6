# KSUR 보안 가이드

## 보안 개요

KSUR 시스템은 제약 규제 문서를 다루므로 높은 수준의 보안이 필요합니다. 이 가이드는 시스템의 모든 계층에서 적용해야 할 보안 best practices를 다룹니다.

---

## 보안 계층

```
┌─────────────────────────────────────────────┐
│  1. 프론트엔드 (클라이언트 사이드)            │
│  - XSS 방지                                  │
│  - CSRF 방지                                 │
│  - Input Validation                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. 통신 (HTTPS)                             │
│  - TLS/SSL 암호화                            │
│  - Certificate Pinning                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. 인증 (Supabase Auth)                     │
│  - JWT 토큰                                  │
│  - MFA (선택사항)                            │
│  - 세션 관리                                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. 권한 (RLS - Row Level Security)          │
│  - 테이블별 정책                             │
│  - 역할 기반 접근 제어                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. 데이터 (암호화)                          │
│  - At Rest: Supabase 자동 암호화             │
│  - In Transit: HTTPS                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  6. API 키 (환경변수)                        │
│  - Edge Functions 환경변수                   │
│  - GitHub Secrets                           │
└─────────────────────────────────────────────┘
```

---

## 1. 프론트엔드 보안

### 1.1 XSS (Cross-Site Scripting) 방지

#### 위험

사용자가 악의적인 스크립트를 입력하여 다른 사용자의 브라우저에서 실행

#### 대책

**React의 기본 보호 활용:**
```typescript
// ✅ 안전 - React가 자동으로 이스케이프
<div>{user.name}</div>

// ❌ 위험 - dangerouslySetInnerHTML 사용 금지
<div dangerouslySetInnerHTML={{ __html: user.input }} />
```

**마크다운 렌더링 시 sanitize:**
```typescript
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {markdownContent}
</ReactMarkdown>
```

**사용자 입력 검증:**
```typescript
import { z } from 'zod'

const ReportSchema = z.object({
  reportName: z.string()
    .min(1, '보고서명을 입력하세요')
    .max(255, '최대 255자까지 입력 가능')
    .regex(/^[a-zA-Z0-9가-힣_\- ]+$/, '특수문자는 사용할 수 없습니다'),

  email: z.string().email('올바른 이메일 주소를 입력하세요'),
})
```

### 1.2 CSRF (Cross-Site Request Forgery) 방지

#### Supabase Auth 자동 보호

Supabase는 JWT 토큰 기반 인증으로 CSRF를 자동 방지합니다.

```typescript
// Supabase 클라이언트가 자동으로 Authorization 헤더 추가
const { data, error } = await supabase
  .from('reports')
  .select('*')
// Authorization: Bearer eyJ... (자동 포함)
```

### 1.3 Content Security Policy (CSP)

**index.html에 CSP 메타 태그 추가:**
```html
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;
        font-src 'self';
      ">
```

### 1.4 민감 정보 노출 방지

**❌ 절대 금지:**
```typescript
// API 키를 클라이언트 코드에 하드코딩
const GEMINI_API_KEY = 'AIza...' // ❌❌❌
```

**✅ 올바른 방법:**
```typescript
// 환경변수 사용 (빌드 시에만 포함, 서버 키는 절대 노출 금지)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL // ✅ (public)
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY // ✅ (public)

// ❌ service_role 키는 절대 클라이언트에 노출 금지
// ❌ Gemini API 키는 Edge Functions에서만 사용
```

---

## 2. 인증 (Authentication)

### 2.1 Supabase Auth 설정

#### 이메일/비밀번호 인증

**비밀번호 정책:**
```sql
-- Supabase Dashboard → Authentication → Settings
-- Password requirements:
- Minimum length: 8
- Require uppercase: Yes
- Require lowercase: Yes
- Require numbers: Yes
- Require special characters: Yes
```

**회원가입 시 검증:**
```typescript
import { supabase } from '@/lib/supabase'

async function signUp(email: string, password: string, name: string, role: string) {
  // 1. Supabase Auth에 사용자 생성
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  // 2. users 테이블에 추가 정보 저장
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      email,
      name,
      role,
    })

  if (userError) throw userError
}
```

### 2.2 MFA (Multi-Factor Authentication) - 선택사항

**프로덕션 환경에서 Master/Author 역할에 권장:**

```typescript
// MFA 활성화
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
})

// QR 코드 표시
const qrCode = data.totp.qr_code
```

### 2.3 세션 관리

**자동 로그아웃 (1시간):**
```typescript
// Supabase는 기본적으로 1시간 후 토큰 갱신 필요
// 자동 갱신 설정
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('토큰 갱신됨')
  }

  if (event === 'SIGNED_OUT') {
    // 로그아웃 처리
    window.location.href = '/login'
  }
})
```

**수동 로그아웃:**
```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    // 로컬 상태 클리어
    localStorage.clear()
    window.location.href = '/login'
  }
}
```

---

## 3. 권한 (Authorization) - RLS

### 3.1 Row Level Security 정책

**필수 원칙:**
1. 모든 테이블에 RLS 활성화
2. 기본적으로 접근 거부, 명시적 허용만
3. 역할 기반 접근 제어

#### users 테이블

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- 사용자는 자신의 정보만 수정 가능 (role 제외)
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM users WHERE id = auth.uid()) -- role 변경 불가
);

-- Master만 사용자 생성 가능
CREATE POLICY "Master can insert users"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'Master'
  )
);
```

#### reports 테이블

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 조회: Author는 자신의 보고서만, Reviewer/Master는 모두
CREATE POLICY "Users can view reports based on role"
ON reports FOR SELECT
USING (
  created_by = auth.uid() -- 작성자
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Reviewer', 'Viewer')
  )
);

-- 생성: Author와 Master만
CREATE POLICY "Authors can create reports"
ON reports FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Author')
  )
);

-- 수정: 작성자 또는 Master만
CREATE POLICY "Authors can update own reports"
ON reports FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'Master'
  )
);

-- 삭제: Master만
CREATE POLICY "Master can delete reports"
ON reports FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'Master'
  )
);
```

#### source_documents 테이블

```sql
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;

-- 보고서 접근 권한이 있으면 문서도 접근 가능
CREATE POLICY "Users can view documents of accessible reports"
ON source_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = source_documents.report_id
    AND (
      reports.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('Master', 'Reviewer', 'Viewer')
      )
    )
  )
);
```

#### review_changes 테이블

```sql
ALTER TABLE review_changes ENABLE ROW LEVEL SECURITY;

-- Reviewer와 Master만 수정 내역 기록 가능
CREATE POLICY "Reviewers can insert changes"
ON review_changes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Reviewer')
  )
);

-- 모든 인증된 사용자는 수정 내역 조회 가능
CREATE POLICY "Authenticated users can view changes"
ON review_changes FOR SELECT
USING (auth.uid() IS NOT NULL);
```

### 3.2 Storage RLS

**reports 버킷:**
```sql
-- 업로드: Author와 Master만
CREATE POLICY "Authors can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Author')
  )
);

-- 다운로드: 보고서 접근 권한이 있으면 가능
CREATE POLICY "Users can download accessible files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM source_documents
    WHERE source_documents.file_path = storage.objects.name
    AND EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = source_documents.report_id
      AND (
        reports.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('Master', 'Reviewer', 'Viewer')
        )
      )
    )
  )
);
```

---

## 4. Edge Functions 보안

### 4.1 환경변수 관리

**절대 금지:**
```typescript
// ❌ 코드에 하드코딩
const GEMINI_API_KEY = 'AIza...'
```

**올바른 방법:**
```typescript
// ✅ Deno 환경변수 사용
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set')
}
```

**설정:**
```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

### 4.2 입력 검증

```typescript
// Edge Function 내부
const { reportId, fileName } = await req.json()

// 입력 검증
if (!reportId || typeof reportId !== 'string') {
  return new Response(
    JSON.stringify({ error: 'Invalid reportId' }),
    { status: 400 }
  )
}

// UUID 형식 검증
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!uuidRegex.test(reportId)) {
  return new Response(
    JSON.stringify({ error: 'Invalid UUID format' }),
    { status: 400 }
  )
}
```

### 4.3 Rate Limiting

**Supabase 자동 제공:**
- 익명 사용자: 분당 60 요청
- 인증된 사용자: 분당 600 요청

**추가 제한 (선택사항):**
```typescript
// Edge Function 내부에서 수동 구현
const rateLimit = new Map<string, number>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimit.get(userId) || 0

  if (now - lastRequest < 1000) { // 1초에 1 요청
    return false
  }

  rateLimit.set(userId, now)
  return true
}
```

### 4.4 에러 메시지 보안

**❌ 나쁜 예 (정보 노출):**
```typescript
catch (error) {
  return new Response(
    JSON.stringify({ error: error.message, stack: error.stack }),
    { status: 500 }
  )
}
```

**✅ 좋은 예:**
```typescript
catch (error) {
  // 로그는 서버에만
  console.error('[Function Error]:', error)

  // 클라이언트에는 일반 메시지만
  return new Response(
    JSON.stringify({ error: '서버 오류가 발생했습니다' }),
    { status: 500 }
  )
}
```

---

## 5. 데이터 보안

### 5.1 암호화

**At Rest (저장 시):**
- Supabase가 AES-256으로 자동 암호화
- 추가 설정 불필요

**In Transit (전송 시):**
- HTTPS 강제 (Supabase 기본 제공)
- TLS 1.2 이상

### 5.2 민감 정보 마스킹

**로그에서 민감 정보 제거:**
```typescript
// ❌ 비밀번호 노출
console.log('User input:', { email, password })

// ✅ 마스킹
console.log('User input:', { email, password: '***' })
```

### 5.3 파일 업로드 검증

```typescript
// 파일 타입 검증
const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

if (!allowedTypes.includes(file.type)) {
  throw new Error('허용되지 않은 파일 형식입니다')
}

// 파일 크기 제한 (50MB)
if (file.size > 50 * 1024 * 1024) {
  throw new Error('파일 크기는 50MB를 초과할 수 없습니다')
}

// 파일명 sanitize
const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
```

---

## 6. API 키 보안

### 6.1 Gemini API 키

**보호 방법:**
1. Edge Functions 환경변수에만 저장
2. 클라이언트 코드에 절대 노출 금지
3. GitHub Secrets에 백업 저장

**사용량 제한:**
```
Google Cloud Console → APIs & Services → Credentials
→ API 키 선택 → Set quotas

- Daily quota: 10,000 requests
- Per-user quota: 100 requests/minute
```

**도메인 제한 (선택사항):**
```
API restrictions → Application restrictions
→ HTTP referrers
→ Add: https://your-username.github.io/*
```

### 6.2 Supabase 키

**anon key (공개 가능):**
- 클라이언트에서 사용 가능
- RLS 정책으로 보호됨
- GitHub Pages 빌드에 포함 가능

**service_role key (비밀):**
- Edge Functions에서만 사용
- 절대 클라이언트 노출 금지
- GitHub Secrets에 저장
- RLS 우회 가능 (관리자 권한)

---

## 7. 모니터링 및 감사

### 7.1 로그 모니터링

**Supabase Dashboard:**
- Database → Logs: SQL 쿼리 모니터링
- Edge Functions → Logs: 함수 실행 로그
- Auth → Users: 로그인 이력

**중요 이벤트 로깅:**
```typescript
// 보고서 생성
console.log('[AUDIT] Report created:', {
  userId: auth.uid(),
  reportId,
  timestamp: new Date().toISOString(),
})

// 파일 업로드
console.log('[AUDIT] File uploaded:', {
  userId: auth.uid(),
  fileName,
  fileSize,
  timestamp: new Date().toISOString(),
})
```

### 7.2 비정상 행위 감지

**의심스러운 패턴:**
- 짧은 시간에 대량 요청
- 권한 없는 자원 접근 시도
- 비정상적인 파일 업로드

**알림 설정 (선택사항):**
```typescript
// Edge Function에서
if (suspiciousActivity) {
  await fetch('https://your-webhook-url', {
    method: 'POST',
    body: JSON.stringify({
      alert: 'Suspicious activity detected',
      userId,
      activity,
    }),
  })
}
```

---

## 8. 보안 체크리스트

### 배포 전 필수 확인

**인증 및 권한:**
- [ ] 모든 테이블에 RLS 활성화
- [ ] Storage 버킷에 RLS 정책 적용
- [ ] 비밀번호 정책 설정 (최소 8자, 복잡도)
- [ ] 역할별 권한 테스트 완료

**API 보안:**
- [ ] Gemini API 키가 Edge Functions에만 존재
- [ ] service_role 키가 클라이언트에 노출되지 않음
- [ ] 환경변수가 GitHub Secrets에 저장됨
- [ ] CORS 헤더 올바르게 설정

**입력 검증:**
- [ ] 모든 사용자 입력에 Zod 스키마 적용
- [ ] 파일 업로드 시 타입/크기 검증
- [ ] SQL Injection 방지 (Supabase 클라이언트 사용)

**프론트엔드:**
- [ ] XSS 방지 (React 기본 + rehype-sanitize)
- [ ] CSP 메타 태그 적용
- [ ] HTTPS 강제
- [ ] dangerouslySetInnerHTML 사용 금지

**데이터:**
- [ ] 민감 정보 마스킹 (로그)
- [ ] 파일명 sanitize
- [ ] 자동 로그아웃 설정 (1시간)

**모니터링:**
- [ ] Supabase 로그 확인 방법 숙지
- [ ] 비정상 행위 감지 계획 수립
- [ ] 백업 전략 수립

---

## 9. 인시던트 대응

### 보안 사고 발생 시

**1. 즉시 조치:**
```bash
# API 키 재발급
supabase secrets set GEMINI_API_KEY=new-key

# Edge Functions 재배포
supabase functions deploy

# GitHub Secrets 업데이트
# Repository → Settings → Secrets → Update
```

**2. 영향 범위 확인:**
- Supabase Logs에서 비정상 접근 확인
- Google Cloud Console에서 API 사용량 확인
- 침해된 데이터 식별

**3. 사용자 알림:**
- 영향받은 사용자에게 이메일 발송
- 비밀번호 재설정 요청

**4. 사후 조치:**
- 보안 취약점 패치
- 로그 분석 및 보고서 작성
- 재발 방지 대책 수립

---

## 10. 정기 보안 점검

### 월간 체크리스트

- [ ] Supabase 사용자 계정 검토
- [ ] 비정상 로그인 이력 확인
- [ ] API 사용량 및 비용 확인
- [ ] 의존성 보안 업데이트 (`npm audit`)
- [ ] RLS 정책 검토

### 분기별 체크리스트

- [ ] 비밀번호 정책 재검토
- [ ] 사용자 역할 및 권한 재검토
- [ ] 백업 및 복구 테스트
- [ ] 보안 교육 (팀원)

---

## 11. 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [React Security Best Practices](https://react.dev/learn/security)
- [GDPR Compliance](https://gdpr.eu/)

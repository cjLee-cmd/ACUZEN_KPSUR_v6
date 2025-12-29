# Deployment Guide - KPSUR AGENT v1.0

**작성일**: 2025-12-29
**Phase**: Phase 5 - Deployment
**배포 환경**: GitHub Pages

---

## 📋 배포 전 체크리스트

### 1. 보안 검증

#### ✅ API 키 관리
- [ ] 소스 코드에 하드코딩된 API 키 없음 확인
- [ ] `.env` 파일이 `.gitignore`에 포함됨 확인
- [ ] localStorage 기반 API 키 관리 동작 확인

**확인 방법**:
```bash
# API 키 하드코딩 검색
grep -r "AIza" js/
grep -r "GOOGLE_API_KEY" js/
grep -r "supabase" js/ | grep -v "supabaseClient"
```

#### ✅ 테스트 계정 제거
- [ ] `auth.js`의 테스트 계정 제거 또는 비활성화
- [ ] 프로덕션 환경에서는 Supabase Auth만 사용

**수정 필요 파일**: `js/auth.js`
```javascript
// 제거 또는 주석 처리:
const TEST_ACCOUNTS = {
    'main@main.com': { password: '1111', ... },
    'author@kpsur.test': { password: 'test1234', ... }
};
```

#### ✅ Supabase RLS 정책
- [ ] Row Level Security (RLS) 활성화 확인
- [ ] 사용자별 데이터 접근 제한 확인
- [ ] Storage 버킷 권한 확인

**Supabase 대시보드 확인**:
1. Authentication → Policies → 모든 테이블에 RLS 활성화
2. Storage → Buckets → 적절한 권한 설정

---

### 2. 코드 최적화

#### ✅ 콘솔 로그 제거
- [ ] `console.log()` 제거 또는 프로덕션 모드에서 비활성화
- [ ] `console.error()`는 유지 (에러 추적용)

**검색 명령**:
```bash
grep -r "console.log" js/
```

#### ✅ 에러 처리 강화
- [ ] 모든 async 함수에 try-catch 확인
- [ ] 사용자 친화적 에러 메시지 확인
- [ ] 네트워크 에러 처리 확인

#### ✅ 파일 크기 최적화
- [ ] 불필요한 주석 제거
- [ ] 미사용 코드 제거
- [ ] (선택사항) Minification

---

### 3. 문서 검증

#### ✅ README.md
- [ ] 설치 방법 정확성 확인
- [ ] API 키 설정 가이드 명확성 확인
- [ ] 프로젝트 구조 최신 상태 확인
- [ ] 라이선스 정보 확인

#### ✅ 기타 문서
- [ ] DEVELOPMENT.md - 개발 완료 상태 반영
- [ ] TESTING.md - 테스트 결과 업데이트
- [ ] DEPLOYMENT.md - 이 문서 완성

---

### 4. 기능 테스트

#### ✅ 핵심 워크플로우 테스트
- [ ] 로그인 → 대시보드 이동
- [ ] 새 보고서 생성
- [ ] 파일 업로드 및 분류
- [ ] 마크다운 변환
- [ ] 데이터 추출
- [ ] 템플릿 작성
- [ ] 리뷰
- [ ] QC 검증
- [ ] 최종 출력

**테스트 환경**: 로컬 서버 (`python3 -m http.server 8000`)

#### ✅ 브라우저 호환성
- [ ] Chrome (최신 버전)
- [ ] Safari (최신 버전)
- [ ] Firefox (최신 버전)
- [ ] Edge (최신 버전)

#### ✅ 반응형 디자인
- [ ] 데스크톱 (1920x1080)
- [ ] 노트북 (1366x768)
- [ ] 태블릿 (768x1024)
- [ ] (선택사항) 모바일

---

## 🚀 GitHub Pages 배포

### 1단계: 저장소 설정

#### 1.1 저장소 생성 (이미 완료된 경우 스킵)
```bash
# GitHub에서 새 저장소 생성
# 예: https://github.com/cjLee-cmd/ACUZEN_KPSUR_v6
```

#### 1.2 로컬 저장소 연결 확인
```bash
cd /Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/10_SW/001_v1
git remote -v
# origin이 올바른 GitHub 저장소를 가리키는지 확인
```

---

### 2단계: 배포 브랜치 준비

#### 2.1 `gh-pages` 브랜치 생성
```bash
# develop 브랜치에서 gh-pages 생성
git checkout develop
git pull origin develop
git checkout -b gh-pages

# 배포에 필요한 파일만 유지
# (필요시 .gitignore 수정)
```

#### 2.2 배포 파일 구조 확인
```
001_v1/
├── index.html              # 진입점 (필수)
├── pages/                  # UI 페이지
├── js/                     # JavaScript 모듈
├── css/                    # 스타일
├── assets/                 # 리소스
├── README.md               # 문서
└── .gitignore              # Git 제외 파일
```

---

### 3단계: GitHub Pages 활성화

#### 3.1 GitHub 저장소 설정
1. GitHub 저장소 → **Settings** 탭
2. **Pages** 메뉴 선택
3. **Source** 설정:
   - Branch: `gh-pages`
   - Folder: `/ (root)` 또는 `/10_SW/001_v1`
4. **Save** 클릭

#### 3.2 배포 URL 확인
```
https://<username>.github.io/<repository-name>/
예: https://cjLee-cmd.github.io/ACUZEN_KPSUR_v6/10_SW/001_v1/
```

#### 3.3 HTTPS 설정
- [ ] **Enforce HTTPS** 체크박스 활성화 (자동 SSL)

---

### 4단계: 배포 실행

#### 4.1 코드 푸시
```bash
# gh-pages 브랜치에 푸시
git add .
git commit -m "deploy: Initial GitHub Pages deployment"
git push origin gh-pages
```

#### 4.2 배포 확인
- GitHub Actions 탭에서 배포 진행 상황 확인
- 배포 완료 후 URL 접속하여 동작 확인

---

## 🔧 배포 후 설정

### 1. Supabase 설정

#### 1.1 Allowed Origins 추가
Supabase 대시보드 → **Authentication** → **URL Configuration**:
```
Site URL: https://<username>.github.io/<repository-name>/
Redirect URLs: https://<username>.github.io/<repository-name>/pages/P10_Dashboard.html
```

#### 1.2 CORS 설정 확인
- Supabase API 엔드포인트가 GitHub Pages 도메인에서 호출 가능한지 확인

---

### 2. API 키 설정 가이드 (사용자용)

배포 후 사용자는 다음 단계를 따라 API 키를 설정해야 합니다:

1. **로그인**: `main@main.com` / `1111` (또는 Supabase 계정)
2. **개발자 도구 열기**: F12 (Chrome) 또는 Cmd+Option+I (Safari)
3. **Console 탭 이동**
4. **API 키 저장**:
   ```javascript
   localStorage.setItem("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY_HERE");
   ```
5. **페이지 새로고침**

---

### 3. 첫 사용자 가이드

#### 3.1 시스템 점검 (P05_SystemCheck.html)
- [ ] Supabase 연결 확인
- [ ] LLM API Key 확인
- [ ] 브라우저 호환성 확인

#### 3.2 첫 보고서 생성 테스트
- [ ] 대시보드 → 새 보고서 생성
- [ ] 테스트 파일 업로드
- [ ] 전체 워크플로우 실행
- [ ] 최종 출력 파일 다운로드

---

## 🐛 배포 후 문제 해결

### 문제 1: API 키 오류
**증상**: "API key not found" 또는 LLM 호출 실패

**해결**:
1. 브라우저 개발자 도구 → Application → Local Storage 확인
2. `GOOGLE_API_KEY` 값이 올바른지 확인
3. 필요시 다시 설정

---

### 문제 2: Supabase 연결 실패
**증상**: "Failed to fetch" 또는 인증 오류

**해결**:
1. Supabase 대시보드에서 프로젝트 상태 확인
2. URL Configuration에 GitHub Pages URL 추가
3. 네트워크 탭에서 CORS 오류 확인

---

### 문제 3: 파일 업로드 실패
**증상**: "Upload failed" 또는 Storage 오류

**해결**:
1. Supabase Storage 버킷 존재 확인
2. 버킷 권한 설정 확인 (public or authenticated)
3. RLS 정책 확인

---

### 문제 4: 페이지 404 오류
**증상**: GitHub Pages URL 접속 시 404

**해결**:
1. GitHub Pages 설정에서 브랜치 확인 (`gh-pages`)
2. 배포 완료 대기 (최대 10분)
3. URL 경로 확인 (저장소 구조에 따라 경로 다를 수 있음)

---

## 📊 배포 상태 모니터링

### 1. GitHub Actions
- 배포 워크플로우 자동 실행 확인
- 빌드 로그에서 에러 확인

### 2. 사용자 피드백
- 버그 리포트 수집
- 기능 개선 요청 수집

### 3. 성능 모니터링
- 페이지 로드 시간
- API 호출 응답 시간
- 에러 발생 빈도

---

## 🔄 업데이트 배포

### 코드 수정 후 재배포
```bash
# develop 브랜치에서 작업
git checkout develop
# ... 코드 수정 ...
git add .
git commit -m "fix: Bug fix description"
git push origin develop

# gh-pages로 병합
git checkout gh-pages
git merge develop
git push origin gh-pages

# GitHub Pages 자동 재배포 (약 1-5분 소요)
```

---

## 📝 배포 완료 체크리스트

### 최종 확인
- [ ] 모든 보안 검증 완료
- [ ] 테스트 계정 제거/비활성화
- [ ] 문서 최신 상태 확인
- [ ] 핵심 워크플로우 테스트 통과
- [ ] GitHub Pages 배포 성공
- [ ] Supabase 설정 완료
- [ ] 배포 URL 접속 및 동작 확인
- [ ] 사용자 가이드 문서 업데이트

---

## 🎉 배포 완료!

**배포 URL**: `https://<username>.github.io/<repository-name>/10_SW/001_v1/`

**다음 단계**:
1. 사용자 피드백 수집
2. 버그 수정 및 기능 개선
3. 정기적인 보안 업데이트

---

**작성일**: 2025-12-29
**작성자**: Claude Code
**버전**: v1.0

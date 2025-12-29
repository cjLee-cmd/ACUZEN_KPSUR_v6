# P05 시스템 점검 화면 - 브라우저 테스트 가이드

## ✅ 백엔드 연결 테스트 결과

**테스트 일시:** 2025-12-29

| 항목 | 상태 | 응답 시간 | 비고 |
|------|------|-----------|------|
| 🤖 AI 엔진 (Gemini) | ✅ 성공 | 0.87초 | API 키 정상 작동 |
| 💾 데이터베이스 (Supabase) | ✅ 성공 | 1.37초 | system_settings 접근 가능 |
| 📁 파일 저장소 (Storage) | ✅ 성공 | 0.22초 | 버킷 목록 조회 가능 |

---

## 🌐 브라우저 테스트 단계

### 1️⃣ 준비 단계

**파일 경로:**
```
/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/05_UI/pages/P01_Login.html
```

**브라우저에서 열기:**
```bash
open /Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/05_UI/pages/P01_Login.html
```

또는 Finder에서:
1. `/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/05_UI/pages/` 폴더 열기
2. `P01_Login.html` 더블클릭

---

### 2️⃣ API 키 설정 (최초 1회만)

브라우저에서 **F12** 또는 **Cmd+Option+I** 눌러서 개발자 도구 열기

**Console 탭**에서 다음 명령어 실행:

```javascript
localStorage.setItem("GOOGLE_API_KEY", "AIzaSyBc2e15qWw9Hw8LqUuxmQNyImsT0VyiXVw")
```

실행 후 확인:
```javascript
localStorage.getItem("GOOGLE_API_KEY")
// 출력: "AIzaSyBc2e15qWw9Hw8LqUuxmQNyImsT0VyiXVw"
```

---

### 3️⃣ 로그인 테스트

**로그인 페이지 (P01_Login.html)**

1. 이메일: `author@kpsur.test`
2. 비밀번호: `test1234`
3. "로그인" 버튼 클릭

**예상 동작:**
- ✅ "로그인 성공! 시스템 점검 중..." 메시지 표시 (녹색)
- ✅ 1초 후 자동으로 P05_SystemCheck.html로 이동

---

### 4️⃣ 시스템 점검 화면 확인 (P05_SystemCheck.html)

**자동으로 실행되는 테스트:**

#### 테스트 1: AI 엔진 연결 (🤖)
```
대기 중 → 테스트 중... (Pulse 애니메이션)
         ↓
      연결 성공 (✅ 녹색)
```

#### 테스트 2: 데이터베이스 연결 (💾)
```
대기 중 → 테스트 중... (Pulse 애니메이션)
         ↓
      연결 성공 (✅ 녹색)
```

#### 테스트 3: 파일 저장소 연결 (📁)
```
대기 중 → 테스트 중... (Pulse 애니메이션)
         ↓
      연결 성공 (✅ 녹색)
```

**진행률 표시:**
- 0% → 33% → 66% → 100%
- Shimmer 애니메이션 효과

**예상 소요 시간:** 5-10초

---

### 5️⃣ 대시보드 이동

**모든 테스트 성공 시:**
- ✅ "모든 점검 완료!" 메시지
- ✅ 진행률 100% 표시
- ✅ 1초 후 자동으로 P10_Dashboard.html 이동

---

## 🐛 에러 테스트

### 시나리오 1: API 키 없음

**준비:**
```javascript
localStorage.removeItem("GOOGLE_API_KEY")
```

**예상 결과:**
- ❌ AI 엔진 연결 실패
- 에러 메시지: "Gemini API 키가 설정되지 않았습니다. 시스템 설정에서 API 키를 등록해주세요."
- "다시 시도" / "건너뛰기" 버튼 표시

### 시나리오 2: 잘못된 API 키

**준비:**
```javascript
localStorage.setItem("GOOGLE_API_KEY", "invalid_key_12345")
```

**예상 결과:**
- ❌ AI 엔진 연결 실패
- 에러 메시지: "HTTP 400: API 응답 실패"

### 시나리오 3: 세션 없음

**준비:**
```javascript
localStorage.removeItem("session")
```

**예상 결과:**
- 페이지 로드 시 자동으로 P01_Login.html로 리다이렉트

---

## 🎨 디자인 요소 확인

### 배경 애니메이션
- ✅ 그라데이션 배경 (#07161D → #122E4E)
- ✅ 파티클 20개가 위로 떠다님
- ✅ 부드러운 float 애니메이션

### 진행률 바
- ✅ Shimmer 효과 (좌→우 반짝임)
- ✅ 그라데이션 색상 (#25739B → #369EE1)
- ✅ 부드러운 전환 (0.3s ease)

### 테스트 항목
- ✅ 대기 중: 회색 배경, 회색 테두리
- ✅ 진행 중: 파란색 테두리, Pulse 애니메이션
- ✅ 성공: 녹색 테두리, 녹색 배경, ✅ 아이콘
- ✅ 실패: 빨간색 테두리, 빨간색 배경, ❌ 아이콘

### 의료용 소프트웨어 뱃지
- ✅ 하단에 표시
- ✅ 🏥 아이콘 + "의료용 AI 소프트웨어" 텍스트

---

## 📊 개발자 도구 Console 확인

### 정상 실행 시 로그 (예상)

```
[Session] User: author@kpsur.test, Role: Author
[Test 1/3] Testing LLM connection...
[Test 1/3] ✅ LLM connection successful (0.9s)
[Test 2/3] Testing Database connection...
[Test 2/3] ✅ Database connection successful (1.4s)
[Test 3/3] Testing Storage connection...
[Test 3/3] ✅ Storage connection successful (0.2s)
[Progress] 100% - All tests completed
[Redirect] Moving to Dashboard in 1 second...
```

### 에러 발생 시 로그 (예상)

```
[Session] User: author@kpsur.test, Role: Author
[Test 1/3] Testing LLM connection...
[Test 1/3] ❌ LLM connection failed: Gemini API 키가 설정되지 않았습니다
[Error] Showing error details
```

---

## 🔧 문제 해결

### 문제 1: 페이지가 로그인으로 리다이렉트됨

**원인:** 세션이 없음

**해결:**
```javascript
// P01_Login.html에서 다시 로그인
```

### 문제 2: LLM 테스트 실패

**원인:** API 키 미설정 또는 잘못된 키

**해결:**
```javascript
// Console에서 API 키 재설정
localStorage.setItem("GOOGLE_API_KEY", "AIzaSyBc2e15qWw9Hw8LqUuxmQNyImsT0VyiXVw")
// 페이지 새로고침
location.reload()
```

### 문제 3: DB 테스트 실패

**원인:** Supabase 연결 오류

**해결:**
1. 네트워크 연결 확인
2. Console에서 에러 메시지 확인
3. Supabase 서비스 상태 확인

### 문제 4: Storage 테스트 실패

**원인:** Storage 권한 부족

**해결:**
- RLS 정책으로 인한 정상 동작일 수 있음
- "건너뛰기" 버튼으로 진행 가능

---

## ✅ 체크리스트

테스트 완료 확인:

- [ ] P01_Login.html 열림
- [ ] 개발자 도구 Console 열림
- [ ] API 키 localStorage 저장 완료
- [ ] 로그인 성공 (author@kpsur.test)
- [ ] P05_SystemCheck.html 자동 이동
- [ ] 배경 파티클 애니메이션 확인
- [ ] AI 엔진 테스트 성공 (✅)
- [ ] 데이터베이스 테스트 성공 (✅)
- [ ] 파일 저장소 테스트 성공 (✅)
- [ ] 진행률 100% 도달
- [ ] P10_Dashboard.html 자동 이동
- [ ] 에러 시나리오 테스트 (선택)

---

## 📝 테스트 결과 기록

**테스트 일시:** ___________

**브라우저:** ☐ Chrome  ☐ Safari  ☐ Firefox  ☐ Edge

**결과:**

| 항목 | 성공 여부 | 응답 시간 | 비고 |
|------|-----------|-----------|------|
| 로그인 | ☐ | ___초 | |
| AI 엔진 테스트 | ☐ | ___초 | |
| DB 테스트 | ☐ | ___초 | |
| Storage 테스트 | ☐ | ___초 | |
| 대시보드 이동 | ☐ | ___초 | |

**이슈 사항:**
```
(없음)
```

**스크린샷:**
- [ ] 로그인 화면
- [ ] 시스템 점검 화면 (진행 중)
- [ ] 시스템 점검 화면 (완료)
- [ ] 에러 화면 (해당 시)

---

**작성자:** Claude Code
**최종 수정:** 2025-12-29

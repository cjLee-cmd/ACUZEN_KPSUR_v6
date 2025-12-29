# E2E 테스트: 로그인 → 시스템 점검 → 대시보드

## 테스트 목적

사용자의 전체 로그인 플로우를 자동화 테스트:
1. P01_Login.html 로그인
2. P05_SystemCheck.html 시스템 점검 (자동 실행)
3. P10_Dashboard.html 대시보드 이동 (자동)

## 테스트 시나리오

### 시나리오 1: 성공적인 로그인 및 시스템 점검

**전제 조건:**
- GOOGLE_API_KEY가 localStorage에 설정됨
- main@main.com / 1111 계정 존재

**테스트 단계:**
1. P01_Login.html 페이지 열기
2. localStorage에 GOOGLE_API_KEY 설정
3. 이메일 입력: main@main.com
4. 비밀번호 입력: 1111
5. 로그인 버튼 클릭
6. "로그인 성공" 메시지 확인
7. P05_SystemCheck.html로 자동 이동 확인
8. 시스템 점검 진행 확인:
   - AI 엔진 연결 테스트
   - 데이터베이스 연결 테스트
   - 파일 저장소 연결 테스트
9. 진행률 100% 도달 확인
10. P10_Dashboard.html로 자동 이동 확인

**예상 결과:**
- 모든 테스트 통과
- 최종적으로 대시보드 페이지 표시

### 시나리오 2: 잘못된 비밀번호

**테스트 단계:**
1. P01_Login.html 페이지 열기
2. 이메일 입력: main@main.com
3. 비밀번호 입력: wrong_password
4. 로그인 버튼 클릭

**예상 결과:**
- "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지 표시
- 페이지 이동 없음

### 시나리오 3: API 키 없이 시스템 점검

**테스트 단계:**
1. localStorage에서 GOOGLE_API_KEY 제거
2. 로그인 성공
3. P05_SystemCheck.html로 이동
4. AI 엔진 테스트 실패 확인

**예상 결과:**
- AI 엔진 연결 실패
- 에러 메시지: "Gemini API 키가 설정되지 않았습니다"
- "다시 시도" / "건너뛰기" 버튼 표시

## 성능 기준

| 항목 | 목표 시간 |
|------|-----------|
| 로그인 처리 | < 2초 |
| 페이지 전환 | < 1초 |
| AI 엔진 테스트 | < 3초 |
| DB 테스트 | < 2초 |
| Storage 테스트 | < 1초 |
| 전체 플로우 | < 15초 |

## 체크포인트

- [ ] 로그인 페이지 렌더링
- [ ] localStorage API 키 설정
- [ ] 로그인 폼 입력
- [ ] 로그인 성공 메시지
- [ ] 시스템 점검 페이지 이동
- [ ] AI 엔진 테스트 실행
- [ ] DB 테스트 실행
- [ ] Storage 테스트 실행
- [ ] 진행률 100% 도달
- [ ] 대시보드 페이지 이동

## 테스트 실행

```bash
# Chrome DevTools MCP 사용
# 자동화된 E2E 테스트 실행
```

## 예상 로그

```
[Step 1] Opening login page...
[Step 2] Setting API key in localStorage...
[Step 3] Filling email: main@main.com
[Step 4] Filling password: ****
[Step 5] Clicking login button...
[Step 6] ✅ Login successful message detected
[Step 7] ✅ Redirected to P05_SystemCheck.html
[Step 8] Testing AI Engine...
[Step 8] ✅ AI Engine test passed (0.9s)
[Step 9] Testing Database...
[Step 9] ✅ Database test passed (1.4s)
[Step 10] Testing Storage...
[Step 10] ✅ Storage test passed (0.2s)
[Step 11] ✅ Progress: 100%
[Step 12] ✅ Redirected to P10_Dashboard.html

Total time: 12.3s
All tests passed! ✅
```

---

**작성일:** 2025-12-29
**테스트 도구:** Chrome DevTools MCP

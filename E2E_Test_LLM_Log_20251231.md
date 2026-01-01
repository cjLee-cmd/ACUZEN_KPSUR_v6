# KPSUR E2E 테스트 LLM 대화 로그

**테스트 일시**: 2025-12-31
**테스트 환경**: GitHub Pages 정적 호스팅 (file:// 프로토콜)
**LLM 모델**: Gemini 2.0 Flash (gemini-2.0-flash-exp)

---

## 1. 테스트 개요

### 1.1 테스트 목적
- KPSUR (Korean PSUR) 시스템의 전체 E2E 워크플로우 검증
- LLM API 통합 테스트 (Gemini API)
- 문서 생성 프로세스 검증

### 1.2 테스트 데이터
- **의약품**: 토지나메란 (코미나티주)
- **제조사**: 한국화이자제약
- **보고서 기간**: 2021-03-05 ~ 2026-03-04
- **테스트 파일**: RAW4_코미나티주_허가현황_2024.pdf (1.2 KB)

---

## 2. LLM API 호출 로그

### 2.1 Stage 2 - Raw Data 처리

#### Step 1: 파일 읽기 및 마크다운 변환
```
API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
Status: 200 OK
```

**요청 프롬프트 (요약)**:
```
당신은 의약품 문서 전문가입니다.
다음 파일 내용을 마크다운 형식으로 정리해주세요.

파일명: RAW4_코미나티주_허가현황_2024.pdf
파일 유형: PDF
```

**응답 (요약)**:
- 파일 내용을 마크다운 형식으로 변환
- 구조화된 헤더와 표 형식 적용

---

#### Step 2: RAW 문서 유형 판단
```
API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
Status: 200 OK
```

**요청 프롬프트 (요약)**:
```
다음 문서의 RAW 유형을 판단해주세요.

RAW 유형 목록:
- RAW1: 최신첨부문서
- RAW2.1: 용법용량
- RAW2.2: 효능효과
- RAW2.3: 사용상의주의사항
- RAW3: 시판후sales데이터
- RAW4: 허가현황
- RAW12: 국내신속보고LineListing
- RAW14: 원시자료LineListing
- RAW15: 정기보고LineListing
```

**응답**:
```json
{
  "rawId": "RAW4",
  "confidence": 0.95,
  "reasoning": "파일명에 '허가현황'이 포함되어 있으며, 내용이 허가 관련 정보를 포함함"
}
```

---

#### Step 3: LLM 데이터 추출
```
API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
Status: 200 OK
```

**요청 프롬프트 (요약)**:
```
다음 RAW4 문서에서 허가현황 데이터를 추출해주세요.

추출 필드:
- 국가별 허가일자
- 허가번호
- 허가상태
- 적응증
```

**응답 (요약)**:
- 국내외 허가현황 테이블 데이터 추출
- JSON 형식으로 구조화된 데이터 반환

---

#### Step 4: 보고서 섹션 생성
```
API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
Status: 200 OK
```

**요청 프롬프트 (요약)**:
```
추출된 데이터를 기반으로 PSUR 보고서 섹션을 생성해주세요.

보고서 구조:
- 00. 표지
- 01. 개요
- 02. 국내외허가현황
- 03. 시판후sales데이터
...
```

**응답**:
- 15개 섹션 템플릿 생성
- 각 섹션별 마크다운 콘텐츠 생성

---

## 3. 테스트 결과 요약

### 3.1 성공한 API 호출
| Step | 설명 | 상태 | 응답시간 |
|------|------|------|----------|
| 1 | 파일 마크다운 변환 | ✅ 성공 | ~2s |
| 2 | RAW 유형 판단 | ✅ 성공 | ~1s |
| 3 | 데이터 추출 | ✅ 성공 | ~3s |
| 4 | 보고서 생성 | ✅ 성공 | ~2s |

### 3.2 수정된 코드 이슈

#### JavaScript 중복 선언 에러 수정

| 파일 | 에러 | 수정 내용 |
|------|------|-----------|
| P01_Login.html | `CONFIG already declared` | `if (!window.CONFIG)` 패턴 적용 |
| P10_Dashboard.html | `navigateTo not defined` | `window.location.href` 사용 |
| P14_Stage2_Processing.html | `reportContent.split is not a function` | 타입 체킹 추가 |
| P19_QC.html | `DateHelper already declared` | `if (!window.DateHelper)` 패턴 적용 |
| P20_Output.html | `Storage already declared` | `window.Storage` 직접 참조 |
| js/config.js | `Storage.get()` null 반환 | JSON.parse fallback 추가 |
| js/qc-validator.js | `DateHelper already declared` | 전역 fallback 패턴 적용 |
| js/hybrid-generator.js | `Storage already declared` | 전역 fallback 패턴 적용 |

### 3.3 워크플로우 검증 결과

| Stage | 페이지 | 상태 | 비고 |
|-------|--------|------|------|
| Login | P01_Login.html | ✅ 통과 | Supabase 인증 정상 |
| Dashboard | P10_Dashboard.html | ✅ 통과 | 네비게이션 정상 |
| New Report | P13_NewReport.html | ✅ 통과 | 폼 입력 정상 |
| Stage 2 | P14_Stage2_Processing.html | ✅ 통과 | LLM 처리 정상 |
| Stage 3 | P18_Review.html | ✅ 통과 | 15개 섹션 표시 |
| Stage 4 | P19_QC.html | ✅ 통과 | 체크리스트 동작 |
| Stage 5 | P20_Output.html | ✅ 통과 | 문서 내보내기 UI |

---

## 4. 권장 사항

### 4.1 코드 개선
1. **전역 변수 관리**: 모든 JS 파일에서 `if (!window.X)` 패턴 일관성 있게 적용
2. **ES6 모듈**: GitHub Pages에서는 ES6 모듈 대신 전역 window 객체 사용 권장
3. **에러 핸들링**: LLM API 호출 시 타임아웃 및 재시도 로직 추가

### 4.2 테스트 자동화
1. Playwright/Puppeteer 기반 E2E 테스트 스크립트 작성
2. LLM API Mock 서버 구축으로 비용 절감
3. CI/CD 파이프라인 통합

---

**작성자**: Claude AI
**작성일**: 2025-12-31
**버전**: 1.0

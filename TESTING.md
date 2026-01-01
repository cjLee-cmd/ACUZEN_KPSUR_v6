# Testing Plan - KPSUR AGENT v1.0

**작성일**: 2025-12-29
**Phase**: Phase 4 - Testing

---

## 📋 테스트 전략

### 1. E2E (End-to-End) 테스트
전체 워크플로우를 처음부터 끝까지 실행하여 통합 동작 검증

### 2. 단위 테스트
각 JavaScript 모듈의 핵심 기능 검증

### 3. 통합 테스트
페이지 간 데이터 전달 및 localStorage 동작 검증

### 4. 에러 시나리오 테스트
예외 상황 및 에러 처리 검증

---

## 🎯 E2E 테스트 시나리오

### Scenario 1: 완전한 보고서 생성 워크플로우

**목적**: 로그인부터 최종 출력까지 전체 프로세스 검증

**전제조건**:
- 브라우저: Chrome/Safari (최신 버전)
- Gemini API Key 준비됨
- Supabase 프로젝트 설정 완료
- 테스트 파일 준비 (PDF, Excel, Word)

**테스트 단계**:

#### Stage 1: 로그인 (P01_Login.html)
- [ ] 페이지 로드 확인
- [ ] 테스트 계정으로 로그인 (main@main.com / 1111)
- [ ] 세션 생성 확인 (localStorage)
- [ ] P05_SystemCheck.html로 자동 리디렉션 확인

#### Stage 2: 시스템 점검 (P05_SystemCheck.html)
- [ ] Supabase 연결 상태 확인
- [ ] LLM API Key 설정 (localStorage에 저장)
- [ ] 시스템 준비 완료 메시지 확인
- [ ] 대시보드로 이동

#### Stage 3: 파일 업로드 (P14_FileUpload.html)
- [ ] 파일 업로드 버튼 동작 확인
- [ ] 필수 파일 업로드 (최소 RAW1, RAW2.1, RAW2.2, RAW2.3)
- [ ] 파일 목록 렌더링 확인
- [ ] LLM 자동 분류 버튼 클릭
- [ ] 분류 결과 확인 (각 파일에 RAW ID 태그)
- [ ] localStorage에 'uploadedFiles' 저장 확인
- [ ] 다음 단계 버튼 활성화 확인
- [ ] P15로 이동

#### Stage 4: 마크다운 변환 (P15_MarkdownConversion.html)
- [ ] 업로드된 파일 목록 표시 확인
- [ ] 변환 시작 버튼 클릭
- [ ] 각 파일 변환 진행 상태 확인
- [ ] 변환 완료 후 미리보기 확인
- [ ] localStorage에 'convertedMarkdowns' 저장 확인
- [ ] 다음 단계 버튼 활성화 확인
- [ ] P16으로 이동

#### Stage 5: 데이터 추출 (P16_DataExtraction.html)
- [ ] 마크다운 파일 목록 표시 확인
- [ ] LLM 모델 선택 확인
- [ ] 데이터 추출 시작 버튼 클릭
- [ ] CS/PH/Table 데이터 추출 진행 확인
- [ ] 추출 완료 후 데이터 표시 확인
- [ ] 충돌 데이터 있을 경우 해결 UI 확인
- [ ] localStorage에 'extractedData' 저장 확인
- [ ] 다음 단계 버튼 활성화 확인
- [ ] P17로 이동

#### Stage 6: 템플릿 작성 (P17_TemplateWriting.html)
- [ ] 섹션 목록 (S00-S14) 표시 확인
- [ ] 첫 번째 섹션 선택
- [ ] 템플릿 로드 확인
- [ ] 데이터 삽입 버튼 클릭
- [ ] 생성된 섹션 미리보기 확인
- [ ] 모든 섹션 작성 완료
- [ ] localStorage에 'generatedSections' 저장 확인
- [ ] 전체 보고서 병합 확인
- [ ] localStorage에 'draftReport' 저장 확인
- [ ] P18로 이동

#### Stage 7: 리뷰 (P18_Review.html)
- [ ] Draft 보고서 로드 확인
- [ ] 섹션별 리뷰 UI 표시 확인
- [ ] 섹션 선택 및 편집 기능 확인
- [ ] 변경사항 기록 확인
- [ ] 리뷰 완료 체크 확인
- [ ] localStorage에 'reviewedSections' 저장 확인
- [ ] P19로 이동

#### Stage 8: QC 검증 (P19_QC.html)
- [ ] 리뷰된 보고서 로드 확인
- [ ] QC 검증 시작 버튼 클릭
- [ ] 검증 진행 상태 확인
- [ ] 검증 완료 후 이슈 목록 확인
- [ ] 이슈 필터링 (severity별) 확인
- [ ] High severity 이슈 0개 확인 (통과 조건)
- [ ] localStorage에 'qcResults' 저장 확인
- [ ] P20으로 이동

#### Stage 9: 최종 출력 (P20_Output.html)
- [ ] Draft 보고서 미리보기 표시 확인
- [ ] 출력 형식 선택 (Word/HTML/PDF)
- [ ] 파일명 입력 확인
- [ ] Draft/Final 선택 확인
- [ ] 출력 버튼 클릭
- [ ] 파일 다운로드 확인
- [ ] 출력 이력에 추가 확인

**예상 소요 시간**: 15-20분

**성공 기준**:
- ✅ 모든 단계가 에러 없이 완료됨
- ✅ 각 단계에서 localStorage에 데이터가 정확히 저장됨
- ✅ 최종 출력 파일이 생성됨
- ✅ QC 검증을 통과함

---

## 🔍 단위 테스트 체크리스트

### auth.js
- [ ] login() - 테스트 계정 로그인 성공
- [ ] login() - Supabase Auth 로그인 성공
- [ ] logout() - 세션 삭제 확인
- [ ] checkSession() - 세션 유효성 확인
- [ ] requireAuth() - 권한 확인

### file-handler.js
- [ ] readFile() - PDF 파일 읽기
- [ ] readFile() - Excel 파일 읽기
- [ ] classifyFile() - LLM 분류 동작
- [ ] uploadToStorage() - Supabase Storage 업로드

### markdown-converter.js
- [ ] convertFile() - 파일을 마크다운으로 변환
- [ ] downloadMarkdown() - MD 파일 다운로드

### data-extractor.js
- [ ] extractFromMarkdown() - CS/PH/Table 데이터 추출
- [ ] mergeExtractedData() - 데이터 병합
- [ ] resolveConflict() - 충돌 해결

### template-writer.js
- [ ] loadTemplate() - 템플릿 파일 로드
- [ ] populateTemplate() - 데이터 삽입
- [ ] mergeAllSections() - 섹션 병합

### review-manager.js
- [ ] startReviewSession() - 리뷰 세션 시작
- [ ] recordChange() - 변경사항 기록
- [ ] endReviewSession() - 세션 종료 및 저장

### qc-validator.js
- [ ] runFullQC() - 전체 QC 검증
- [ ] validateTableNumbering() - 표 번호 순서 검증
- [ ] isPassed() - QC 통과 여부 확인

### output-generator.js
- [ ] generateWordDocument() - Word 문서 생성
- [ ] downloadHTML() - HTML 다운로드
- [ ] validateReportFormat() - 보고서 포맷 검증

---

## ⚠️ 에러 시나리오 테스트

### 1. 네트워크 오류
- [ ] Supabase 연결 실패 처리
- [ ] LLM API 호출 실패 처리
- [ ] 파일 업로드 실패 처리

### 2. 데이터 검증 오류
- [ ] 필수 파일 누락 시 경고 표시
- [ ] 잘못된 파일 형식 업로드 시 에러
- [ ] CS 데이터 누락 시 경고

### 3. 권한 오류
- [ ] 로그인 없이 페이지 접근 시 리디렉션
- [ ] 세션 만료 시 로그아웃 처리

### 4. localStorage 오류
- [ ] localStorage 사용 불가 시 대체 처리
- [ ] 데이터 손상 시 에러 처리

### 5. 파일 크기 제한
- [ ] 10MB 이상 파일 업로드 시 경고
- [ ] 과도하게 큰 파일 처리

---

## 📊 테스트 결과 기록

### Test Run #1
**일시**: 2025-12-29
**테스터**: Claude Code
**브라우저**: Chrome 131
**결과**: (진행 예정)

#### 발견된 이슈:
- (이슈 기록 예정)

#### 수정사항:
- (수정사항 기록 예정)

---

## 🚀 다음 단계

1. **E2E 테스트 실행**
   - 브라우저에서 전체 워크플로우 실행
   - 각 단계 스크린샷 촬영
   - 발견된 버그 기록

2. **버그 수정**
   - Critical 버그 우선 수정
   - 각 수정사항 커밋

3. **회귀 테스트**
   - 수정 후 전체 워크플로우 재실행
   - 새로운 버그 발생 여부 확인

4. **테스트 문서 업데이트**
   - 테스트 결과 기록
   - 알려진 이슈 문서화

---

**작성자**: Claude Code
**버전**: v1.0

# KSUR Database Structure (Supabase)

## 1. users

사용자 인증 및 권한 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 사용자 ID |
| email | varchar(255) | UNIQUE, NOT NULL | 이메일 |
| password_hash | varchar(255) | NOT NULL | 암호화된 비밀번호 |
| name | varchar(100) | NOT NULL | 사용자 이름 |
| role | varchar(20) | NOT NULL, CHECK IN ('Master', 'Author', 'Reviewer', 'Viewer') | 권한 |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

---

## 2. reports

보고서 메타데이터 및 상태 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 보고서 ID |
| report_name | varchar(255) | UNIQUE, NOT NULL | 보고서명 (약품명_PSUR제출일_버전) |
| created_by | uuid | FK → users.id, NOT NULL | 작성자 |
| status | varchar(20) | NOT NULL, DEFAULT 'Draft', CHECK IN ('Draft', 'InReview', 'QC', 'Completed') | 문서 상태 |
| current_stage | int | DEFAULT 1 | 현재 작업 단계 (1-9) |
| user_inputs | jsonb | | 사용자 입력 정보 (CS6, CS7, CS13, CS20, CS21, CS24) |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**user_inputs JSONB 구조:**
```json
{
  "CS6_보고서제출일": "2025-06-30",
  "CS7_버전넘버": "1.0",
  "CS13_유효기간": "2030-12-31",
  "CS20_1일사용량": "1",
  "CS21_환자1명당사용량": "365",
  "CS24_MedDRA버전넘버": "26.0"
}
```

---

## 3. source_documents

업로드된 원본 소스 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 문서 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| original_filename | varchar(255) | NOT NULL | 원본 파일명 |
| raw_id | varchar(20) | NOT NULL | RAW ID 태그 (RAW1, RAW2.1 등) |
| file_type | varchar(10) | NOT NULL, CHECK IN ('pdf', 'xlsx', 'docx', 'txt') | 파일 형식 |
| file_path | text | NOT NULL | 파일 저장 경로 (Supabase Storage) |
| file_size | bigint | | 파일 크기 (bytes) |
| uploaded_by | uuid | FK → users.id | 업로드 사용자 |
| created_at | timestamptz | DEFAULT now() | 업로드일시 |

---

## 4. markdown_documents

마크다운 변환된 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 문서 ID |
| source_document_id | uuid | FK → source_documents.id, NOT NULL | 원본 문서 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| raw_id | varchar(20) | NOT NULL | RAW ID 태그 |
| markdown_content | text | NOT NULL | 마크다운 내용 |
| file_path | text | | 마크다운 파일 경로 (04_TestProcess/02_RawData_MD/) |
| converted_by | varchar(50) | | 변환 모델명 (예: Gemini-2.0-Flash) |
| created_at | timestamptz | DEFAULT now() | 변환일시 |

---

## 5. extracted_data

추출된 CS/PH/Table 데이터

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 데이터 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| data_type | varchar(10) | NOT NULL, CHECK IN ('CS', 'PH', 'Table') | 데이터 유형 |
| variable_id | varchar(50) | NOT NULL | 변수 ID (CS0, PH4, 표2 등) |
| variable_name | varchar(100) | | 변수명 (성분명, 원시자료서술문 등) |
| data_value | text | | 데이터 값 |
| source_raw_id | varchar(20) | | 출처 RAW ID |
| extracted_from | uuid | FK → markdown_documents.id | 추출 원본 문서 ID |
| extracted_by | varchar(50) | | 추출 모델명 |
| validation_status | varchar(20) | DEFAULT 'Pending', CHECK IN ('Pending', 'Validated', 'Conflict') | 검증 상태 |
| created_at | timestamptz | DEFAULT now() | 추출일시 |

**인덱스:**
```sql
CREATE INDEX idx_extracted_data_report_variable ON extracted_data(report_id, variable_id);
```

---

## 6. report_sections

섹션별 생성된 보고서 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 섹션 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| section_number | varchar(10) | NOT NULL | 섹션 번호 (00-14) |
| section_name | varchar(100) | NOT NULL | 섹션명 (표지, 서론, 환자노출 등) |
| content_markdown | text | | 마크다운 내용 |
| content_final | text | | 최종 내용 (리뷰 후) |
| version | int | DEFAULT 1 | 버전 번호 |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
```sql
CREATE UNIQUE INDEX idx_report_section ON report_sections(report_id, section_number);
```

---

## 7. review_changes

리뷰 단계 수정 내역

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 변경 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| section_id | uuid | FK → report_sections.id | 섹션 ID |
| changed_by | uuid | FK → users.id, NOT NULL | 수정자 |
| content_before | text | | 수정 전 내용 |
| content_after | text | | 수정 후 내용 |
| change_type | varchar(20) | CHECK IN ('Edit', 'Add', 'Delete') | 변경 유형 |
| comment | text | | 수정 사유 |
| created_at | timestamptz | DEFAULT now() | 수정일시 |

---

## 8. llm_dialogs

LLM 대화 로그 (디버깅 및 추적용)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 대화 ID |
| report_id | uuid | FK → reports.id | 보고서 ID |
| stage | varchar(50) | | 단계 (Conversion, Extraction 등) |
| model_name | varchar(50) | | 모델명 (Gemini-2.0-Flash 등) |
| user_message | text | | 사용자 메시지 (프롬프트) |
| assistant_message | text | | 어시스턴트 응답 |
| tokens_used | int | | 사용된 토큰 수 |
| created_at | timestamptz | DEFAULT now() | 대화일시 |

---

## 9. file_matching_table

파일 매칭 테이블 (RAW ID 분류 결과)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 매칭 ID |
| report_id | uuid | FK → reports.id, NOT NULL | 보고서 ID |
| original_filename | varchar(255) | NOT NULL | 원본 파일명 |
| assigned_raw_id | varchar(20) | NOT NULL | 할당된 RAW ID |
| confidence_score | decimal(3,2) | | 분류 신뢰도 (0.00-1.00) |
| classified_by | varchar(50) | | 분류 모델명 |
| file_path | text | | 매칭 테이블 파일 경로 |
| created_at | timestamptz | DEFAULT now() | 분류일시 |

---

## Supabase Storage Buckets

### reports
- **용도**: 업로드된 원본 문서 (PDF, Excel, Word)
- **경로**: `reports/{report_id}/source/{filename}`
- **Public**: false (인증 필요)

### markdown
- **용도**: 변환된 마크다운 파일
- **경로**: `reports/{report_id}/markdown/{raw_id}_{filename}.md`
- **Public**: false

### outputs
- **용도**: 최종 출력 문서 (Word, PDF)
- **경로**: `reports/{report_id}/output/{report_name}_v{version}.docx`
- **Public**: false

---

## Row Level Security (RLS) 정책 예시

```sql
-- users 테이블: 본인 정보만 조회
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- reports 테이블: 권한별 접근 제어
CREATE POLICY "Authors can create reports"
ON reports FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Author')
  )
);

CREATE POLICY "Users can view reports they have access to"
ON reports FOR SELECT
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Reviewer', 'Viewer')
  )
);

-- review_changes: Reviewer와 Master만 수정 가능
CREATE POLICY "Reviewers can edit"
ON review_changes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Master', 'Reviewer')
  )
);
```

---

## 데이터베이스 초기화 스크립트

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_sections_updated_at BEFORE UPDATE ON report_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

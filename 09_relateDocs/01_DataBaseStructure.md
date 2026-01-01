# KSUR Database Structure (Supabase)

> **Version**: 2.0
> **Updated**: 2025-12-29
> **Based on**: `migrations/001_initial_schema.sql`

---

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

**인덱스:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 2. products

약품 마스터 테이블 (CS 데이터 기본값 관리)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 약품 ID |
| product_name | varchar(200) | UNIQUE, NOT NULL | CS1_브랜드명 |
| ingredient_name | varchar(200) | NOT NULL | CS0_성분명 |
| company_name | varchar(200) | NOT NULL | CS2_회사명 |
| domestic_approval_date | date | NOT NULL | CS5_국내허가일자 |
| shelf_life_months | int | NOT NULL | 유효기간 (개월 수) |
| daily_dosage | decimal(10, 2) | | CS20_1일사용량 |
| annual_usage_per_patient | decimal(10, 2) | | CS21_환자1명당사용량 |
| meddra_version | varchar(20) | | CS24_MedDRA버전넘버 (기본값) |
| is_active | boolean | DEFAULT true | 활성화 여부 |
| created_by | uuid | FK → users.id | 생성자 |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
```sql
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_company ON products(company_name);
CREATE INDEX idx_products_name ON products(product_name);
```

---

## 3. reports

보고서 메타데이터 및 상태 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 보고서 ID |
| report_name | varchar(255) | UNIQUE, NOT NULL | 보고서명 (약품명_PSUR제출일_버전) |
| product_id | uuid | FK → products.id | 약품 마스터 참조 |
| created_by | uuid | FK → users.id, NOT NULL | 작성자 |
| status | varchar(20) | NOT NULL, DEFAULT 'Draft', CHECK IN ('Draft', 'InReview', 'QC', 'Completed') | 문서 상태 |
| current_stage | int | DEFAULT 1 | 현재 작업 단계 (1-9) |
| user_inputs | jsonb | | 사용자 입력 정보 (CS0~CS24 모든 데이터) |
| qc_model | varchar(100) | DEFAULT 'gemini-2.0-flash-thinking' | QC 검증 모델 |
| qc_precision_mode | boolean | DEFAULT true | QC 정밀 모드 활성화 |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**user_inputs JSONB 구조:**
```json
{
  "CS0_성분명": "토지나메란",
  "CS1_브랜드명": "코미나티주",
  "CS2_회사명": "한국화이자제약",
  "CS5_국내허가일자": "2021-03-05",
  "CS6_보고서제출일": "2025-06-30",
  "CS7_버전넘버": "1.0",
  "CS13_유효기간": "2030-12-31",
  "CS20_1일사용량": "1",
  "CS21_환자1명당사용량": "365",
  "CS24_MedDRA버전넘버": "26.0"
}
```

**인덱스:**
```sql
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_product ON reports(product_id);
CREATE INDEX idx_reports_status ON reports(status);
```

---

## 4. source_documents

업로드된 원본 소스 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 문서 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
| original_filename | varchar(255) | NOT NULL | 원본 파일명 |
| raw_id | varchar(20) | NOT NULL | RAW ID 태그 (RAW1, RAW2.1 등) |
| file_type | varchar(10) | NOT NULL, CHECK IN ('pdf', 'xlsx', 'docx', 'txt') | 파일 형식 |
| file_path | text | NOT NULL | 파일 저장 경로 (Supabase Storage) |
| file_size | bigint | | 파일 크기 (bytes) |
| uploaded_by | uuid | FK → users.id | 업로드 사용자 |
| created_at | timestamptz | DEFAULT now() | 업로드일시 |

**인덱스:**
```sql
CREATE INDEX idx_source_docs_report ON source_documents(report_id);
CREATE INDEX idx_source_docs_raw_id ON source_documents(raw_id);
```

---

## 5. markdown_documents

마크다운 변환된 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 문서 ID |
| source_document_id | uuid | FK → source_documents.id ON DELETE CASCADE, NOT NULL | 원본 문서 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
| raw_id | varchar(20) | NOT NULL | RAW ID 태그 |
| markdown_content | text | NOT NULL | 마크다운 내용 |
| file_path | text | | 마크다운 파일 경로 (Supabase Storage 백업) |
| converted_by | varchar(50) | | 변환 모델명 (예: gemini-2.0-flash) |
| created_at | timestamptz | DEFAULT now() | 변환일시 |

**인덱스:**
```sql
CREATE INDEX idx_markdown_docs_report ON markdown_documents(report_id);
CREATE INDEX idx_markdown_docs_source ON markdown_documents(source_document_id);
```

---

## 6. extracted_data

추출된 CS/PH/Table 데이터

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 데이터 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
| data_type | varchar(10) | NOT NULL, CHECK IN ('CS', 'PH', 'Table') | 데이터 유형 |
| variable_id | varchar(50) | NOT NULL | 변수 ID (CS0, PH4, 표2 등) |
| variable_name | varchar(100) | | 변수명 (성분명, 원시자료서술문 등) |
| data_value | text | | 데이터 값 |
| source_raw_id | varchar(20) | | 출처 RAW ID |
| extracted_from | uuid | FK → markdown_documents.id ON DELETE SET NULL | 추출 원본 문서 ID |
| extracted_by | varchar(50) | | 추출 모델명 |
| validation_status | varchar(20) | DEFAULT 'Pending', CHECK IN ('Pending', 'Validated', 'Conflict') | 검증 상태 |
| created_at | timestamptz | DEFAULT now() | 추출일시 |

**인덱스:**
```sql
CREATE INDEX idx_extracted_data_report_variable ON extracted_data(report_id, variable_id);
CREATE INDEX idx_extracted_data_type ON extracted_data(data_type);
```

---

## 7. report_sections

섹션별 생성된 보고서 문서

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 섹션 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
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

## 8. review_changes

리뷰 단계 수정 내역

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 변경 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
| section_id | uuid | FK → report_sections.id ON DELETE CASCADE | 섹션 ID |
| changed_by | uuid | FK → users.id, NOT NULL | 수정자 |
| content_before | text | | 수정 전 내용 |
| content_after | text | | 수정 후 내용 |
| change_type | varchar(20) | CHECK IN ('Edit', 'Add', 'Delete') | 변경 유형 |
| comment | text | | 수정 사유 |
| created_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
```sql
CREATE INDEX idx_review_changes_report ON review_changes(report_id);
CREATE INDEX idx_review_changes_section ON review_changes(section_id);
```

---

## 9. llm_dialogs

LLM 대화 로그 및 비용 추적

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 대화 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE | 보고서 ID |
| stage | varchar(50) | | 단계 (Conversion, Extraction 등) |
| model_name | varchar(50) | | 모델명 (gemini-2.0-flash 등) |
| user_message | text | | 사용자 메시지 (프롬프트) |
| assistant_message | text | | 어시스턴트 응답 |
| tokens_used | int | | 사용된 토큰 수 (deprecated) |
| input_tokens | int | | 입력 토큰 수 |
| output_tokens | int | | 출력 토큰 수 |
| total_tokens | int | | 총 토큰 수 |
| estimated_cost_usd | decimal(10, 6) | | 예상 비용 (USD) |
| actual_duration_ms | int | | 실제 소요 시간 (밀리초) |
| created_at | timestamptz | DEFAULT now() | 대화일시 |

**인덱스:**
```sql
CREATE INDEX idx_llm_dialogs_report ON llm_dialogs(report_id);
CREATE INDEX idx_llm_dialogs_stage ON llm_dialogs(stage);
CREATE INDEX idx_llm_dialogs_cost ON llm_dialogs(estimated_cost_usd);
CREATE INDEX idx_llm_dialogs_tokens ON llm_dialogs(total_tokens);
```

---

## 10. file_matching_table

파일 매칭 테이블 (RAW ID 분류 결과)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 매칭 ID |
| report_id | uuid | FK → reports.id ON DELETE CASCADE, NOT NULL | 보고서 ID |
| original_filename | varchar(255) | NOT NULL | 원본 파일명 |
| assigned_raw_id | varchar(20) | NOT NULL | 할당된 RAW ID |
| confidence_score | decimal(3,2) | | 분류 신뢰도 (0.00-1.00) |
| classified_by | varchar(50) | | 분류 모델명 |
| file_path | text | | 매칭 테이블 파일 경로 |
| created_at | timestamptz | DEFAULT now() | 분류일시 |

**인덱스:**
```sql
CREATE INDEX idx_file_matching_report ON file_matching_table(report_id);
```

---

## 11. system_settings

시스템 설정

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 설정 ID |
| setting_key | varchar(100) | UNIQUE, NOT NULL | 설정 키 |
| setting_value | jsonb | NOT NULL | 설정 값 |
| updated_by | uuid | FK → users.id | 수정자 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**기본 설정값:**
```sql
INSERT INTO system_settings (setting_key, setting_value) VALUES
('default_llm_models', '{
  "classify": "gemini-2.0-flash",
  "convert": "gemini-2.0-flash",
  "extract": "gemini-2.0-flash",
  "qc": "gemini-2.0-flash-thinking"
}'::jsonb),
('qc_precision_mode', 'true'::jsonb),
('file_size_limits', '{
  "max_file_size_mb": 50,
  "max_total_size_mb": 500
}'::jsonb),
('conversion_timeout_seconds', '150'::jsonb);
```

**인덱스:**
```sql
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
```

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

## Helper Functions

### get_user_role()

RLS 재귀 방지를 위한 SECURITY DEFINER 함수

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();

  RETURN user_role;
END;
$$;
```

### update_updated_at_column()

updated_at 자동 갱신 트리거 함수

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS) 정책

### users 테이블

```sql
-- 본인 정보만 조회
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Master는 모든 사용자 조회 가능
CREATE POLICY "Master can view all users"
ON users FOR SELECT
USING (public.get_user_role() = 'Master');

-- Master만 사용자 관리 가능
CREATE POLICY "Master can manage users"
ON users FOR ALL
USING (public.get_user_role() = 'Master');
```

### products 테이블

```sql
-- 모든 사용자가 활성화된 약품 조회 가능
CREATE POLICY "All users can view active products"
ON products FOR SELECT
USING (is_active = true);

-- Master만 약품 관리 가능
CREATE POLICY "Master can manage products"
ON products FOR ALL
USING (public.get_user_role() = 'Master');
```

### reports 테이블

```sql
-- 본인 보고서 조회
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (created_by = auth.uid());

-- Reviewer/Master는 모든 보고서 조회 가능
CREATE POLICY "Reviewers can view all reports"
ON reports FOR SELECT
USING (public.get_user_role() IN ('Master', 'Reviewer'));

-- 작성자는 본인 보고서 관리 가능
CREATE POLICY "Authors can manage own reports"
ON reports FOR ALL
USING (created_by = auth.uid());

-- Master는 모든 보고서 관리 가능
CREATE POLICY "Master can manage all reports"
ON reports FOR ALL
USING (public.get_user_role() = 'Master');
```

### 문서 관련 테이블 (source_documents, markdown_documents, extracted_data, report_sections)

```sql
-- 본인 보고서의 문서 조회
CREATE POLICY "Users can view own report documents"
ON {table_name} FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = {table_name}.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

-- 작성자는 본인 보고서 문서 관리 가능
CREATE POLICY "Authors can manage own report documents"
ON {table_name} FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = {table_name}.report_id
    AND created_by = auth.uid()
  )
);
```

### review_changes 테이블

```sql
-- 보고서 관련자는 변경 이력 조회 가능
CREATE POLICY "Users can view review changes"
ON review_changes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = review_changes.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

-- 본인만 변경 이력 생성 가능
CREATE POLICY "Users can create review changes"
ON review_changes FOR INSERT
WITH CHECK (changed_by = auth.uid());
```

### llm_dialogs 테이블

```sql
-- 본인 보고서의 LLM 로그 조회 (Master는 전체)
CREATE POLICY "Users can view own report llm logs"
ON llm_dialogs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = llm_dialogs.report_id
    AND (created_by = auth.uid() OR public.get_user_role() = 'Master')
  )
);

-- 시스템에서 LLM 로그 생성 가능
CREATE POLICY "System can create llm logs"
ON llm_dialogs FOR INSERT
WITH CHECK (true);
```

### system_settings 테이블

```sql
-- 모든 사용자가 설정 조회 가능
CREATE POLICY "All users can view settings"
ON system_settings FOR SELECT
USING (true);

-- Master만 설정 관리 가능
CREATE POLICY "Master can manage settings"
ON system_settings FOR ALL
USING (public.get_user_role() = 'Master');
```

---

## 데이터베이스 초기화 스크립트

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Apply updated_at triggers to tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_sections_updated_at
BEFORE UPDATE ON report_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 기본 테스트 데이터

```sql
-- 테스트 사용자 (비밀번호: test1234)
INSERT INTO users (email, password_hash, name, role) VALUES
('master@kpsur.test', crypt('test1234', gen_salt('bf')), 'Master User', 'Master'),
('author@kpsur.test', crypt('test1234', gen_salt('bf')), 'Author User', 'Author'),
('reviewer@kpsur.test', crypt('test1234', gen_salt('bf')), 'Reviewer User', 'Reviewer'),
('viewer@kpsur.test', crypt('test1234', gen_salt('bf')), 'Viewer User', 'Viewer')
ON CONFLICT (email) DO NOTHING;

-- 샘플 약품 데이터
INSERT INTO products (product_name, ingredient_name, company_name, domestic_approval_date, shelf_life_months, daily_dosage, annual_usage_per_patient, meddra_version, created_by)
SELECT
  '코미나티주',
  '토지나메란',
  '한국화이자제약',
  '2021-03-05'::date,
  24,
  0.3,
  2,
  '26.0',
  id
FROM users WHERE email = 'master@kpsur.test'
ON CONFLICT (product_name) DO NOTHING;
```

---

## ERD (Entity Relationship Diagram)

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   users     │────<│  reports    │────<│ source_documents │
└─────────────┘     └─────────────┘     └──────────────────┘
       │                   │                      │
       │                   │                      ▼
       │                   │            ┌──────────────────┐
       │                   │            │markdown_documents│
       │                   │            └──────────────────┘
       │                   │                      │
       │                   ▼                      ▼
       │           ┌─────────────┐     ┌──────────────────┐
       │           │  products   │     │  extracted_data  │
       │           └─────────────┘     └──────────────────┘
       │
       │           ┌─────────────────┐
       └──────────<│ report_sections │
                   └─────────────────┘
                           │
                           ▼
                   ┌─────────────────┐
                   │ review_changes  │
                   └─────────────────┘

┌─────────────────┐     ┌─────────────────────┐
│   llm_dialogs   │     │ file_matching_table │
└─────────────────┘     └─────────────────────┘

┌─────────────────┐
│ system_settings │
└─────────────────┘
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 2.0 | 2025-12-29 | products, system_settings 테이블 추가 |
| 2.0 | 2025-12-29 | reports에 product_id, qc_model, qc_precision_mode 추가 |
| 2.0 | 2025-12-29 | llm_dialogs에 비용 추적 컬럼 추가 (input/output/total_tokens, estimated_cost_usd, actual_duration_ms) |
| 2.0 | 2025-12-29 | ON DELETE CASCADE 정책 명시 |
| 2.0 | 2025-12-29 | get_user_role() 헬퍼 함수 추가 |
| 1.0 | 2025-12-01 | 초기 스키마 설계 |

-- KSUR Database Schema v2.0
-- Created: 2025-12-29
-- Description: Initial schema with all tables and RLS policies

-- ============================================================================
-- 1. Enable Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1.5. Helper Functions (Security Definer to avoid RLS recursion)
-- ============================================================================

-- Function to get current user role without triggering RLS
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

-- ============================================================================
-- 2. Create Tables
-- ============================================================================

-- 2.1 users (사용자 인증 및 권한 관리)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('Master', 'Author', 'Reviewer', 'Viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.2 products (약품 마스터 테이블) - 신규
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기본 정보
  product_name varchar(200) UNIQUE NOT NULL,  -- CS1_브랜드명
  ingredient_name varchar(200) NOT NULL,      -- CS0_성분명
  company_name varchar(200) NOT NULL,         -- CS2_회사명

  -- 허가 관련 날짜
  domestic_approval_date date NOT NULL,       -- CS5_국내허가일자

  -- 기타 정보
  shelf_life_months int NOT NULL,             -- 유효기간 (개월 수)
  daily_dosage decimal(10, 2),                -- CS20_1일사용량
  annual_usage_per_patient decimal(10, 2),    -- CS21_환자1명당사용량
  meddra_version varchar(20),                 -- CS24_MedDRA버전넘버 (기본값)

  -- 메타데이터
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.3 reports (보고서 메타데이터 및 상태 관리)
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_name varchar(255) UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id),    -- 신규: 약품 마스터 참조
  created_by uuid REFERENCES users(id) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'QC', 'Completed')),
  current_stage int DEFAULT 1,
  user_inputs jsonb,  -- CS0~CS24 모든 데이터 저장
  qc_model varchar(100) DEFAULT 'gemini-2.0-flash-thinking',  -- 신규
  qc_precision_mode boolean DEFAULT true,  -- 신규
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.4 source_documents (업로드된 원본 소스 문서)
CREATE TABLE IF NOT EXISTS source_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  original_filename varchar(255) NOT NULL,
  raw_id varchar(20) NOT NULL,
  file_type varchar(10) NOT NULL CHECK (file_type IN ('pdf', 'xlsx', 'docx', 'txt')),
  file_path text NOT NULL,  -- Supabase Storage 경로
  file_size bigint,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- 2.5 markdown_documents (마크다운 변환된 문서)
CREATE TABLE IF NOT EXISTS markdown_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_document_id uuid REFERENCES source_documents(id) ON DELETE CASCADE NOT NULL,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  raw_id varchar(20) NOT NULL,
  markdown_content text NOT NULL,
  file_path text,  -- Supabase Storage 백업 경로
  converted_by varchar(50),  -- 변환 모델명
  created_at timestamptz DEFAULT now()
);

-- 2.6 extracted_data (추출된 CS/PH/Table 데이터)
CREATE TABLE IF NOT EXISTS extracted_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  data_type varchar(10) NOT NULL CHECK (data_type IN ('CS', 'PH', 'Table')),
  variable_id varchar(50) NOT NULL,
  variable_name varchar(100),
  data_value text,
  source_raw_id varchar(20),
  extracted_from uuid REFERENCES markdown_documents(id) ON DELETE SET NULL,
  extracted_by varchar(50),
  validation_status varchar(20) DEFAULT 'Pending' CHECK (validation_status IN ('Pending', 'Validated', 'Conflict')),
  created_at timestamptz DEFAULT now()
);

-- 2.7 report_sections (섹션별 생성된 보고서 문서)
CREATE TABLE IF NOT EXISTS report_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  section_number varchar(10) NOT NULL,
  section_name varchar(100) NOT NULL,
  content_markdown text,
  content_final text,
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.8 review_changes (리뷰 단계 수정 내역)
CREATE TABLE IF NOT EXISTS review_changes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  section_id uuid REFERENCES report_sections(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES users(id) NOT NULL,
  content_before text,
  content_after text,
  change_type varchar(20) CHECK (change_type IN ('Edit', 'Add', 'Delete')),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 2.9 llm_dialogs (LLM 대화 로그 - 업데이트)
CREATE TABLE IF NOT EXISTS llm_dialogs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  stage varchar(50),
  model_name varchar(50),
  user_message text,
  assistant_message text,
  tokens_used int,  -- 기존 (deprecated)
  input_tokens int,  -- 신규
  output_tokens int,  -- 신규
  total_tokens int,  -- 신규
  estimated_cost_usd decimal(10, 6),  -- 신규
  actual_duration_ms int,  -- 신규
  created_at timestamptz DEFAULT now()
);

-- 2.10 file_matching_table (파일 매칭 테이블)
CREATE TABLE IF NOT EXISTS file_matching_table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  original_filename varchar(255) NOT NULL,
  assigned_raw_id varchar(20) NOT NULL,
  confidence_score decimal(3,2),
  classified_by varchar(50),
  file_path text,
  created_at timestamptz DEFAULT now()
);

-- 2.11 system_settings (시스템 설정) - 신규
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key varchar(100) UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. Create Indexes
-- ============================================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_name);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_product ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- source_documents
CREATE INDEX IF NOT EXISTS idx_source_docs_report ON source_documents(report_id);
CREATE INDEX IF NOT EXISTS idx_source_docs_raw_id ON source_documents(raw_id);

-- markdown_documents
CREATE INDEX IF NOT EXISTS idx_markdown_docs_report ON markdown_documents(report_id);
CREATE INDEX IF NOT EXISTS idx_markdown_docs_source ON markdown_documents(source_document_id);

-- extracted_data
CREATE INDEX IF NOT EXISTS idx_extracted_data_report_variable ON extracted_data(report_id, variable_id);
CREATE INDEX IF NOT EXISTS idx_extracted_data_type ON extracted_data(data_type);

-- report_sections
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_section ON report_sections(report_id, section_number);

-- review_changes
CREATE INDEX IF NOT EXISTS idx_review_changes_report ON review_changes(report_id);
CREATE INDEX IF NOT EXISTS idx_review_changes_section ON review_changes(section_id);

-- llm_dialogs
CREATE INDEX IF NOT EXISTS idx_llm_dialogs_report ON llm_dialogs(report_id);
CREATE INDEX IF NOT EXISTS idx_llm_dialogs_stage ON llm_dialogs(stage);
CREATE INDEX IF NOT EXISTS idx_llm_dialogs_cost ON llm_dialogs(estimated_cost_usd);
CREATE INDEX IF NOT EXISTS idx_llm_dialogs_tokens ON llm_dialogs(total_tokens);

-- file_matching_table
CREATE INDEX IF NOT EXISTS idx_file_matching_report ON file_matching_table(report_id);

-- system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- ============================================================================
-- 4. Create Functions
-- ============================================================================

-- 4.1 updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Create Triggers
-- ============================================================================

-- users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- report_sections
DROP TRIGGER IF EXISTS update_report_sections_updated_at ON report_sections;
CREATE TRIGGER update_report_sections_updated_at
BEFORE UPDATE ON report_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE markdown_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_matching_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. Create RLS Policies
-- ============================================================================

-- 7.1 users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "Master can view all users" ON users;
CREATE POLICY "Master can view all users"
ON users FOR SELECT
USING (public.get_user_role() = 'Master');

DROP POLICY IF EXISTS "Master can manage users" ON users;
CREATE POLICY "Master can manage users"
ON users FOR ALL
USING (public.get_user_role() = 'Master');

-- 7.2 products
DROP POLICY IF EXISTS "All users can view active products" ON products;
CREATE POLICY "All users can view active products"
ON products FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Master can manage products" ON products;
CREATE POLICY "Master can manage products"
ON products FOR ALL
USING (public.get_user_role() = 'Master');

-- 7.3 reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Reviewers can view all reports" ON reports;
CREATE POLICY "Reviewers can view all reports"
ON reports FOR SELECT
USING (public.get_user_role() IN ('Master', 'Reviewer'));

DROP POLICY IF EXISTS "Authors can manage own reports" ON reports;
CREATE POLICY "Authors can manage own reports"
ON reports FOR ALL
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Master can manage all reports" ON reports;
CREATE POLICY "Master can manage all reports"
ON reports FOR ALL
USING (public.get_user_role() = 'Master');

-- 7.4 source_documents
DROP POLICY IF EXISTS "Users can view own report documents" ON source_documents;
CREATE POLICY "Users can view own report documents"
ON source_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = source_documents.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Authors can manage own report documents" ON source_documents;
CREATE POLICY "Authors can manage own report documents"
ON source_documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = source_documents.report_id
    AND created_by = auth.uid()
  )
);

-- 7.5 markdown_documents (source_documents와 동일한 정책)
DROP POLICY IF EXISTS "Users can view own report markdown" ON markdown_documents;
CREATE POLICY "Users can view own report markdown"
ON markdown_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = markdown_documents.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Authors can manage own report markdown" ON markdown_documents;
CREATE POLICY "Authors can manage own report markdown"
ON markdown_documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = markdown_documents.report_id
    AND created_by = auth.uid()
  )
);

-- 7.6 extracted_data (동일 정책)
DROP POLICY IF EXISTS "Users can view own report data" ON extracted_data;
CREATE POLICY "Users can view own report data"
ON extracted_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = extracted_data.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Authors can manage own report data" ON extracted_data;
CREATE POLICY "Authors can manage own report data"
ON extracted_data FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = extracted_data.report_id
    AND created_by = auth.uid()
  )
);

-- 7.7 report_sections (동일 정책)
DROP POLICY IF EXISTS "Users can view own report sections" ON report_sections;
CREATE POLICY "Users can view own report sections"
ON report_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = report_sections.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Authors can manage own report sections" ON report_sections;
CREATE POLICY "Authors can manage own report sections"
ON report_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = report_sections.report_id
    AND created_by = auth.uid()
  )
);

-- 7.8 review_changes (모든 사용자 조회 가능, 수정자만 작성)
DROP POLICY IF EXISTS "Users can view review changes" ON review_changes;
CREATE POLICY "Users can view review changes"
ON review_changes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = review_changes.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Users can create review changes" ON review_changes;
CREATE POLICY "Users can create review changes"
ON review_changes FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- 7.9 llm_dialogs (동일 정책)
DROP POLICY IF EXISTS "Users can view own report llm logs" ON llm_dialogs;
CREATE POLICY "Users can view own report llm logs"
ON llm_dialogs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = llm_dialogs.report_id
    AND (created_by = auth.uid() OR public.get_user_role() = 'Master')
  )
);

DROP POLICY IF EXISTS "System can create llm logs" ON llm_dialogs;
CREATE POLICY "System can create llm logs"
ON llm_dialogs FOR INSERT
WITH CHECK (true);  -- Edge Functions에서 생성 가능

-- 7.10 file_matching_table (동일 정책)
DROP POLICY IF EXISTS "Users can view own report file matching" ON file_matching_table;
CREATE POLICY "Users can view own report file matching"
ON file_matching_table FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = file_matching_table.report_id
    AND (created_by = auth.uid() OR public.get_user_role() IN ('Master', 'Reviewer'))
  )
);

DROP POLICY IF EXISTS "Authors can manage own report file matching" ON file_matching_table;
CREATE POLICY "Authors can manage own report file matching"
ON file_matching_table FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE id = file_matching_table.report_id
    AND created_by = auth.uid()
  )
);

-- 7.11 system_settings
DROP POLICY IF EXISTS "All users can view settings" ON system_settings;
CREATE POLICY "All users can view settings"
ON system_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Master can manage settings" ON system_settings;
CREATE POLICY "Master can manage settings"
ON system_settings FOR ALL
USING (public.get_user_role() = 'Master');

-- ============================================================================
-- 8. Insert Default Data
-- ============================================================================

-- 8.1 Default System Settings
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
('conversion_timeout_seconds', '150'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 8.2 Default Master User (비밀번호: test1234)
INSERT INTO users (email, password_hash, name, role) VALUES
('master@kpsur.test', crypt('test1234', gen_salt('bf')), 'Master User', 'Master'),
('author@kpsur.test', crypt('test1234', gen_salt('bf')), 'Author User', 'Author'),
('reviewer@kpsur.test', crypt('test1234', gen_salt('bf')), 'Reviewer User', 'Reviewer'),
('viewer@kpsur.test', crypt('test1234', gen_salt('bf')), 'Viewer User', 'Viewer')
ON CONFLICT (email) DO NOTHING;

-- 8.3 Sample Product Data
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

-- ============================================================================
-- End of Migration
-- ============================================================================

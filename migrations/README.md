# Database Migration Guide

## 준비 사항

### 1. Supabase Database 비밀번호 확인

1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `toelnxgizxwbdikskmxa`
3. Settings → Database → Connection string 확인
4. `[password]` 부분의 비밀번호 복사

### 2. .env 파일에 비밀번호 추가

`.env` 파일에 다음 줄 추가:

```bash
SUPABASE_DB_PASSWORD=your_actual_password_here
```

**주의**: 실제 비밀번호로 교체하세요!

---

## 마이그레이션 실행

### Option 1: Python 스크립트 사용 (권장)

```bash
# 1. 필요한 패키지 설치
pip install python-dotenv psycopg2-binary

# 2. 기존 데이터베이스 초기화 (선택)
python migrations/run_migration.py --reset

# 3. 마이그레이션 실행
python migrations/run_migration.py
```

### Option 2: SQL 파일 직접 실행

1. Supabase Dashboard → SQL Editor 열기
2. `migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭

---

## 마이그레이션 내용

### 생성되는 테이블 (11개)

1. **users** - 사용자 관리
2. **products** - 약품 마스터 (신규)
3. **reports** - 보고서
4. **source_documents** - 원본 문서
5. **markdown_documents** - 마크다운 변환
6. **extracted_data** - 추출 데이터
7. **report_sections** - 보고서 섹션
8. **review_changes** - 리뷰 변경사항
9. **llm_dialogs** - LLM 대화 로그
10. **file_matching_table** - 파일 매칭
11. **system_settings** - 시스템 설정 (신규)

### 기본 사용자 (4명)

| Email | Password | Role |
|-------|----------|------|
| master@kpsur.test | test1234 | Master |
| author@kpsur.test | test1234 | Author |
| reviewer@kpsur.test | test1234 | Reviewer |
| viewer@kpsur.test | test1234 | Viewer |

### 샘플 약품 데이터

- **코미나티주** (토지나메란) - 한국화이자제약

---

## 확인 사항

### 1. 테이블 생성 확인

Supabase Dashboard → Database → Tables에서 11개 테이블 확인

### 2. RLS 활성화 확인

모든 테이블의 RLS (Row Level Security)가 활성화되어 있어야 함

### 3. 기본 데이터 확인

```sql
-- 사용자 확인
SELECT email, role FROM users;

-- 약품 확인
SELECT product_name, ingredient_name FROM products;

-- 시스템 설정 확인
SELECT setting_key, setting_value FROM system_settings;
```

---

## 문제 해결

### Error: "password authentication failed"

- `.env` 파일의 `SUPABASE_DB_PASSWORD`가 올바른지 확인
- Supabase Dashboard에서 비밀번호 재확인

### Error: "relation already exists"

- 테이블이 이미 존재하는 경우
- `--reset` 옵션으로 초기화 후 재실행

### Error: "connection refused"

- 인터넷 연결 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

---

## 다음 단계

1. ✅ DB 마이그레이션 완료
2. Storage Buckets 생성 (reports, markdown, outputs)
3. Edge Functions 배포
4. 프론트엔드 개발 시작

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-29 | 초기 스키마 생성 |

# 추가 요구사항 정리

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 사용자 피드백 기반 추가 요구사항 |
| 작성일 | 2025-12-29 |
| 기반 문서 | 08_SpecificationReview_Issues.md |
| 목적 | 사양서 업데이트를 위한 변경사항 정리 |

---

## 변경 요약

| # | 항목 | 우선순위 | 영향 범위 |
|---|------|---------|-----------|
| 1 | 약품명 마스터 DB 추가 | 🔴 Critical | DB, UI, Stage 2 |
| 2 | RAW ID 전체 포함 | 🔴 High | Stage 3, 데이터 추출 |
| 3 | LLM 사용량/비용 트래킹 | 🟡 Medium | DB, 전체 LLM 호출 |
| 4 | QC 모델 선택 UI | 🟡 Medium | Stage 8, 관리 페이지 |
| 5 | 저장 정책 명확화 | 🟡 Medium | 전체 파일 저장 |

---

# 1. 약품명 마스터 DB 및 관리 UI 추가

## 1.1 요구사항

### 배경
- 사용자가 새 보고서 생성 시 **약품명을 선택**하면, 관련된 11개 CS 데이터가 자동으로 입력됨
- 약품명에 종속된 데이터: CS0~CS7, CS13, CS20, CS21, CS24

### 기존 설계 문제
- 사용자가 매번 11개 필드를 수동 입력
- 약품별 기본 정보가 관리되지 않음

### 해결 방안
- **약품명 마스터 테이블** 추가
- **약품 관리 UI** 추가 (Master 권한)
- 보고서 생성 시 약품 선택 → 자동 입력

---

## 1.2 데이터베이스 설계

### 새 테이블: `products` (약품 마스터)

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기본 정보
  product_name varchar(200) UNIQUE NOT NULL,  -- 약품명 (브랜드명)
  ingredient_name varchar(200) NOT NULL,      -- 성분명
  company_name varchar(200) NOT NULL,         -- 회사명

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
  updated_at timestamptz DEFAULT now(),

  -- 인덱스
  CONSTRAINT products_product_name_key UNIQUE (product_name)
);

-- 인덱스
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_company ON products(company_name);

-- RLS 정책
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Master만 생성/수정/삭제
CREATE POLICY "Master can manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Master'
  )
);

-- 모든 사용자 조회 가능
CREATE POLICY "All users can view products"
ON products FOR SELECT
USING (is_active = true);

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 1.3 보고서 생성 워크플로우 변경

### 기존 워크플로우 (변경 전)

```
1. "새 보고서" 버튼 클릭
2. 11개 필드 수동 입력
   - CS0_성분명
   - CS1_브랜드명
   - CS2_회사명
   - CS4_보고종료날짜
   - CS5_국내허가일자
   - CS6_보고서제출일
   - CS7_버전넘버
   - CS13_유효기간
   - CS20_1일사용량
   - CS21_환자1명당사용량
   - CS24_MedDRA버전넘버
3. "생성" 버튼 클릭
```

### 새 워크플로우 (변경 후)

```
1. "새 보고서" 버튼 클릭
2. 약품명 선택 (드롭다운)
   → 선택 시 자동 입력:
     - CS0_성분명
     - CS1_브랜드명
     - CS2_회사명
     - CS5_국내허가일자
     - CS20_1일사용량
     - CS21_환자1명당사용량
     - CS24_MedDRA버전넘버
3. 보고서별 고유 정보 입력 (사용자 입력 필수)
   - CS4_보고종료날짜
   - CS6_보고서제출일
   - CS7_버전넘버
   - CS13_유효기간
4. 자동 계산 (백그라운드)
   - CS3 = CS4 - 5년
   - CS8 = CS4
   - CS14 = CS13 - 6개월
5. "생성" 버튼 클릭
```

---

## 1.4 UI 설계

### 1.4.1 보고서 생성 폼 (수정)

**경로**: `/reports/new`

```
┌─────────────────────────────────────────────────┐
│ 새 보고서 생성                          [X 닫기]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 약품 선택 *                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ [약품명 선택 ▼]                              │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 자동 입력 정보 (읽기 전용)                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ 성분명:      토지나메란                       │ │
│ │ 브랜드명:    코미나티주                       │ │
│ │ 회사명:      한국화이자제약                    │ │
│ │ 국내허가일:  2021-03-05                       │ │
│ │ 1일사용량:   0.3 mL                          │ │
│ │ 환자사용량:  2회/년                           │ │
│ │ MedDRA버전:  26.0                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 보고서 정보 (사용자 입력) *                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ 보고종료날짜 *                               │ │
│ │ [2025-06-30]                                │ │
│ │                                             │ │
│ │ 보고서제출일 *                               │ │
│ │ [2025-07-15]                                │ │
│ │                                             │ │
│ │ 버전넘버 *                                   │ │
│ │ [1.0]                                       │ │
│ │                                             │ │
│ │ 유효기간 *                                   │ │
│ │ [2026-01-15]                                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 자동 계산 값 (참고)                              │
│ ┌─────────────────────────────────────────────┐ │
│ │ 보고시작날짜: 2020-06-30 (보고종료-5년)       │ │
│ │ PSUR기준일:   2025-06-30 (보고종료일과 동일)  │ │
│ │ PSUR제출기한: 2025-12-30 (유효기간-6개월)     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│            [취소]              [생성]            │
└─────────────────────────────────────────────────┘
```

**약품 선택 드롭다운**:
```
┌─────────────────────────────────┐
│ 약품명 검색...                   │
├─────────────────────────────────┤
│ ✓ 코미나티주 (토지나메란)         │
│   스파이크박스주 (재조합항원)     │
│   누바락소비드주 (타다락소비맙)   │
│   ...                           │
└─────────────────────────────────┘
```

### 1.4.2 약품 관리 페이지 (신규)

**경로**: `/admin/products`
**권한**: Master만 접근

```
┌─────────────────────────────────────────────────┐
│ 약품 관리                          [+ 새 약품 등록]│
├─────────────────────────────────────────────────┤
│                                                 │
│ 검색: [_________________]  [🔍]                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 약품명 | 성분명 | 회사 | 허가일 | 상태 | 액션│ │
│ ├─────────────────────────────────────────────┤ │
│ │ 코미나티주 | 토지나메란 | 한국화이자 |      │ │
│ │            |           | 제약      |       │ │
│ │ 2021-03-05 | 활성 | [수정] [삭제]          │ │
│ ├─────────────────────────────────────────────┤ │
│ │ 스파이크박스주 | 재조합항원 | SK바이오  |  │ │
│ │                |           | 사이언스  |   │ │
│ │ 2021-04-07 | 활성 | [수정] [삭제]          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│           페이지: 1 2 3 ... 10                   │
└─────────────────────────────────────────────────┘
```

### 1.4.3 약품 등록/수정 모달

```
┌─────────────────────────────────────────────────┐
│ 약품 등록                              [X 닫기]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 기본 정보                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ 약품명 (브랜드명) *                          │ │
│ │ [_______________________________________]   │ │
│ │                                             │ │
│ │ 성분명 *                                     │ │
│ │ [_______________________________________]   │ │
│ │                                             │ │
│ │ 회사명 *                                     │ │
│ │ [_______________________________________]   │ │
│ │                                             │ │
│ │ 국내허가일자 *                               │ │
│ │ [2021-03-05]                                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 사용량 정보                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ 유효기간 (개월) *                            │ │
│ │ [24] 개월                                    │ │
│ │                                             │ │
│ │ 1일 사용량 (바이알)                          │ │
│ │ [0.3] mL                                    │ │
│ │                                             │ │
│ │ 연간 환자당 사용량                            │ │
│ │ [2] 회/년                                    │ │
│ │                                             │ │
│ │ MedDRA 버전 (기본값)                         │ │
│ │ [26.0]                                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│            [취소]              [저장]            │
└─────────────────────────────────────────────────┘
```

---

## 1.5 API 설계

### 1.5.1 약품 목록 조회

**엔드포인트**: `GET /api/products`

**응답**:
```json
{
  "data": [
    {
      "id": "uuid",
      "productName": "코미나티주",
      "ingredientName": "토지나메란",
      "companyName": "한국화이자제약",
      "domesticApprovalDate": "2021-03-05",
      "shelfLifeMonths": 24,
      "dailyDosage": 0.3,
      "annualUsagePerPatient": 2,
      "meddraVersion": "26.0",
      "isActive": true
    }
  ]
}
```

### 1.5.2 약품 등록

**엔드포인트**: `POST /api/products`

**요청**:
```json
{
  "productName": "코미나티주",
  "ingredientName": "토지나메란",
  "companyName": "한국화이자제약",
  "domesticApprovalDate": "2021-03-05",
  "shelfLifeMonths": 24,
  "dailyDosage": 0.3,
  "annualUsagePerPatient": 2,
  "meddraVersion": "26.0"
}
```

---

## 1.6 영향 범위

### 변경 필요 문서
- ✅ `01_DataBaseStructure.md` - products 테이블 추가
- ✅ `06_ProductSpecification.md` - Stage 2 워크플로우 수정
- ✅ `07_UI_ComponentList.md` - 약품 관리 페이지/모달 추가

### 영향받는 컴포넌트
- `NewReportForm` - 약품 선택 드롭다운 추가
- `ProductManagementPage` - 신규 생성
- `ProductFormModal` - 신규 생성

---

# 2. RAW ID 전체 포함

## 2.1 요구사항

**결정 사항**: 워크플로우에 있는 모든 RAW ID를 포함해야 함

### 추가할 RAW ID

| RAW ID | 설명 | 필수 여부 |
|--------|------|-----------|
| RAW2.6 | 보고서작성지침사용상의주의사항 | 선택 |
| RAW5.1 | 안전성조치허가메일 | 선택 |
| RAW6.1 | 안전성조치허가메일_취합본 | 선택 |
| RAW7.1 | 안전성정보변경_복수항목 | 선택 |
| RAW7.2 | 안전성정보변경 | 선택 |
| RAW7.3 | 안전성정보변경_용법용량 | 선택 |
| RAW7.4 | 안전성정보변경_표현식복수항목 | 선택 |
| RAW8 | 임상노출데이터 | 선택 |
| RAW9 | 문헌자료 | 선택 |

### 필수 RAW ID (기존 유지)

| RAW ID | 설명 |
|--------|------|
| RAW1 | 최신첨부문서 |
| RAW2.1 | 용법용량 |
| RAW2.2 | 효능효과 |
| RAW2.3 | 사용상의주의사항 |
| RAW3 | 시판후sales데이터 |
| RAW4 | 허가현황 |
| RAW12 | 국외신속보고LineListing |
| RAW13 | 국내신속보고LineListing |
| RAW14 | 원시자료LineListing |
| RAW15 | 정기보고LineListing |

**총 RAW ID**: 20개 (필수 10개 + 선택 10개)

---

## 2.2 영향 범위

### Stage 3 - 파일 업로드
- RAW ID 드롭다운에 모든 20개 항목 표시
- 필수 검증 로직 유지: RAW1~4, RAW2.1~2.3, RAW12~15

### Stage 4 - 마크다운 변환
- 모든 RAW ID 파일 변환 지원

### Stage 5 - 데이터 추출
- `0114_CS_from_Source.md` 업데이트 필요 (신규 RAW ID 매핑 추가)

---

# 3. LLM 사용량/비용 트래킹

## 3.1 요구사항

**결정 사항**:
- LLM 호출 시마다 사용량(토큰 수)과 예상 비용 기록
- QC 진행 후 비용 검토하여 모델 변경 여부 결정

## 3.2 데이터베이스 설계

### 기존 테이블 수정: `llm_dialogs`

```sql
ALTER TABLE llm_dialogs
ADD COLUMN input_tokens int,
ADD COLUMN output_tokens int,
ADD COLUMN total_tokens int,
ADD COLUMN estimated_cost_usd decimal(10, 6),
ADD COLUMN actual_duration_ms int;

-- 인덱스 추가
CREATE INDEX idx_llm_dialogs_cost ON llm_dialogs(estimated_cost_usd);
CREATE INDEX idx_llm_dialogs_tokens ON llm_dialogs(total_tokens);
```

### 비용 계산 로직

**Gemini 2.0 Flash 가격** (2025년 기준):
```
Input:  $0.075 / 1M tokens
Output: $0.30  / 1M tokens
```

**Gemini 2.0 Flash-Thinking 가격** (예상):
```
Input:  $0.15  / 1M tokens
Output: $0.60  / 1M tokens
```

**계산 예시**:
```typescript
const calculateCost = (model: string, inputTokens: number, outputTokens: number) => {
  const pricing = {
    'gemini-2.0-flash': {
      input: 0.075 / 1_000_000,
      output: 0.30 / 1_000_000,
    },
    'gemini-2.0-flash-thinking': {
      input: 0.15 / 1_000_000,
      output: 0.60 / 1_000_000,
    },
  };

  const price = pricing[model];
  return (inputTokens * price.input) + (outputTokens * price.output);
};
```

---

## 3.3 UI 설계

### 3.3.1 보고서별 LLM 사용량 대시보드

**경로**: `/reports/:id/llm-usage`

```
┌─────────────────────────────────────────────────┐
│ LLM 사용량 통계 - 코미나티주_PSUR_2025-06-30     │
├─────────────────────────────────────────────────┤
│                                                 │
│ 전체 요약                                        │
│ ┌───────────┬───────────┬───────────┬────────┐  │
│ │ 총 호출 수 │ 총 토큰   │ 예상 비용  │ 소요시간│  │
│ │    24회   │ 850,000  │  $0.35    │ 18분   │  │
│ └───────────┴───────────┴───────────┴────────┘  │
│                                                 │
│ 단계별 사용량                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ 단계 | 호출 | 입력토큰 | 출력토큰 | 비용    │ │
│ ├─────────────────────────────────────────────┤ │
│ │ RAW ID 분류 | 5 | 12K | 500 | $0.002    │ │
│ │ 마크다운변환 | 5 | 450K| 10K | $0.037    │ │
│ │ 데이터추출  | 10| 200K| 15K | $0.020    │ │
│ │ QC 검증     | 4 | 180K| 8K  | $0.016    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 모델별 사용량                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Gemini 2.0 Flash:          20회, $0.30     │ │
│ │ Gemini 2.0 Flash-Thinking:  4회, $0.05     │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 3.3.2 전체 시스템 LLM 통계 (Master용)

**경로**: `/admin/llm-statistics`

```
┌─────────────────────────────────────────────────┐
│ 전체 LLM 사용 통계                               │
├─────────────────────────────────────────────────┤
│                                                 │
│ 월별 사용량 (2025년 12월)                         │
│ ┌───────────┬───────────┬───────────┐           │
│ │ 총 호출   │ 총 토큰    │ 총 비용    │           │
│ │  340회   │ 12.5M     │  $15.20   │           │
│ └───────────┴───────────┴───────────┘           │
│                                                 │
│ 📊 일별 추이 차트                                 │
│                                                 │
│ 보고서별 TOP 5 (비용 순)                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Brand_A: $2.50                           │ │
│ │ 2. Brand_B: $1.80                           │ │
│ │ 3. Brand_C: $1.20                           │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 3.4 영향 범위

### Edge Functions
모든 Edge Functions에서 토큰 수 및 비용 계산 로직 추가:
- `classify-raw-id`
- `convert-to-markdown`
- `extract-data`
- `qc-validation`

### 응답 형식 (예시)
```json
{
  "success": true,
  "data": { ... },
  "usage": {
    "model": "gemini-2.0-flash",
    "inputTokens": 1250,
    "outputTokens": 85,
    "totalTokens": 1335,
    "estimatedCostUSD": 0.000119,
    "durationMs": 1850
  }
}
```

---

# 4. QC 모델 선택 UI

## 4.1 요구사항

**결정 사항**:
- 초기값: Gemini 2.0 Flash-Thinking
- 사용자가 모델 변경 가능
- "Ultrathink..." 지침 포함 여부도 선택 가능

## 4.2 UI 설계

### 4.2.1 QC 설정 패널

**위치**: Stage 8 (QC 검증 페이지) 상단

```
┌─────────────────────────────────────────────────┐
│ QC 검증 설정                         [⚙️ 고급설정]│
├─────────────────────────────────────────────────┤
│                                                 │
│ LLM 모델 선택                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ ○ Gemini 2.0 Flash (빠름, 저렴)             │ │
│ │ ● Gemini 2.0 Flash-Thinking (정밀, 권장)    │ │
│ │   └ 예상 소요 시간: 3-5분                    │ │
│ │   └ 예상 비용: $0.05-0.10                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 검증 옵션                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☑ 정밀 검증 모드 활성화                      │ │
│ │   (Ultrathink, Think Hard 지침 포함)        │ │
│ │                                             │ │
│ │ ☑ 데이터 일치성 검증                         │ │
│ │ ☑ 표 번호 순서 검증                          │ │
│ │ ☑ 계산 정확성 검증                           │ │
│ │ ☐ 서술문 스타일 검증 (선택)                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│               [QC 검증 시작]                     │
└─────────────────────────────────────────────────┘
```

### 4.2.2 관리자 기본값 설정

**경로**: `/admin/settings`

```
┌─────────────────────────────────────────────────┐
│ 시스템 설정 > LLM 모델                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ 기본 LLM 모델 설정                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ RAW ID 분류 기본 모델                        │ │
│ │ [Gemini 2.0 Flash ▼]                        │ │
│ │                                             │ │
│ │ 마크다운 변환 기본 모델                       │ │
│ │ [Gemini 2.0 Flash ▼]                        │ │
│ │                                             │ │
│ │ 데이터 추출 기본 모델                         │ │
│ │ [Gemini 2.0 Flash ▼]                        │ │
│ │                                             │ │
│ │ QC 검증 기본 모델                            │ │
│ │ [Gemini 2.0 Flash-Thinking ▼]              │ │
│ │                                             │ │
│ │ ☑ QC 정밀 검증 모드 기본 활성화               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│               [저장]                             │
└─────────────────────────────────────────────────┘
```

---

## 4.3 데이터베이스

### 테이블 수정: `reports`

```sql
ALTER TABLE reports
ADD COLUMN qc_model varchar(100) DEFAULT 'gemini-2.0-flash-thinking',
ADD COLUMN qc_precision_mode boolean DEFAULT true;
```

### 새 테이블: `system_settings`

```sql
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key varchar(100) UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO system_settings (setting_key, setting_value) VALUES
('default_llm_models', '{
  "classify": "gemini-2.0-flash",
  "convert": "gemini-2.0-flash",
  "extract": "gemini-2.0-flash",
  "qc": "gemini-2.0-flash-thinking"
}'::jsonb),
('qc_precision_mode', 'true'::jsonb);
```

---

# 5. 저장 정책 명확화

## 5.1 요구사항

**결정 사항**:
- 테스트 모드: 로컬 경로 사용
- 실제 배포: Supabase만 사용
- 저장 정책: **DB (필수) + Storage (백업)**

## 5.2 저장 정책 상세

### 파일 타입별 저장 방식

| 파일 타입 | DB 저장 | Storage 저장 | 비고 |
|-----------|---------|--------------|------|
| 소스 문서 (PDF, Excel, Word) | 메타데이터만 | ✅ 원본 파일 | `reports` 버킷 |
| 마크다운 변환 결과 | ✅ 전체 내용 | ✅ 백업 | `markdown_documents` 테이블 + `markdown` 버킷 |
| 추출 데이터 (CS/PH/Table) | ✅ 구조화 데이터 | ❌ | `extracted_data` 테이블 |
| 보고서 섹션 | ✅ 전체 내용 | ❌ | `report_sections` 테이블 |
| 최종 출력 Word 파일 | 메타데이터만 | ✅ 파일 | `outputs` 버킷 |
| LLM 대화 로그 | ✅ 전체 로그 | ✅ 백업 (선택) | `llm_dialogs` 테이블 |

### 테스트 모드 vs 운영 모드

```typescript
const STORAGE_MODE = process.env.VITE_STORAGE_MODE || 'production';

const saveMarkdown = async (content: string) => {
  if (STORAGE_MODE === 'test') {
    // 로컬 파일 저장 (개발/테스트 전용)
    await fs.writeFile(`04_MainProcess/02_RawData_MD/${filename}`, content);
  }

  // 운영 모드: 항상 DB + Storage
  // 1. DB 저장 (필수)
  await supabase.from('markdown_documents').insert({
    content,
    // ...
  });

  // 2. Storage 백업 (권장)
  await supabase.storage
    .from('markdown')
    .upload(`${reportId}/${filename}`, content);
};
```

---

## 5.3 영향 범위

### 환경 변수 추가

`.env.local`:
```bash
VITE_STORAGE_MODE=test  # 개발 환경
```

`.env.production`:
```bash
VITE_STORAGE_MODE=production  # 배포 환경
```

### 모든 파일 저장 로직 수정
- Stage 3: 소스 문서 업로드
- Stage 4: 마크다운 저장
- Stage 5: 데이터 저장
- Stage 7: LLM 로그 저장
- Stage 9: 최종 출력

---

# 6. 문서 업데이트 계획

## 6.1 업데이트 필요 문서

| 문서 | 변경 내용 | 우선순위 |
|------|-----------|---------|
| `01_DataBaseStructure.md` | products 테이블 추가, llm_dialogs 수정 | 🔴 High |
| `06_ProductSpecification.md` | Stage 2 워크플로우 전면 수정 | 🔴 High |
| `07_UI_ComponentList.md` | 약품 관리 UI, LLM 통계 UI 추가 | 🟡 Medium |
| `08_SpecificationReview_Issues.md` | 해결 완료 표시 | 🟢 Low |

## 6.2 신규 문서

| 문서명 | 내용 | 우선순위 |
|--------|------|---------|
| `10_TestModeGuide.md` | 테스트 모드 사용 가이드 | 🟡 Medium |

---

# 다음 단계

## 즉시 수행 (오늘)

1. ✅ `01_DataBaseStructure.md` 업데이트
   - products 테이블 추가
   - llm_dialogs 컬럼 추가
   - system_settings 테이블 추가

2. ✅ `06_ProductSpecification.md` 업데이트
   - Stage 2 전면 수정 (약품 선택 워크플로우)
   - RAW ID 전체 목록 반영
   - LLM 사용량 트래킹 추가
   - QC 모델 선택 UI 추가

3. ✅ `07_UI_ComponentList.md` 업데이트
   - 약품 관리 페이지/모달 추가
   - LLM 통계 페이지 추가
   - QC 설정 패널 추가

## 후속 작업 (내일)

4. 워크플로우 문서 업데이트
5. 데이터 정의 파일 검증
6. 개발 우선순위 재조정

---

**문서 끝**

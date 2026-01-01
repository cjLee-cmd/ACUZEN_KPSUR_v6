# DB 마이그레이션 계획

> **목적**: 다중 사용자/다중 PC 협업 지원
> **현재 상태**: localStorage 100% → Supabase DB 연동
> **생성일**: 2025-12-29

---

## 마이그레이션 개요

### 현재 문제점
- 모든 데이터가 localStorage에 저장됨 (PC별 격리)
- 다른 PC에서 작업 이어받기 불가능
- Author → Reviewer → QC 핸드오프 불가

### 목표 구조
```
localStorage (로컬)     →    Supabase DB (원격)
├─ API 키                    ├─ reports
├─ 세션 토큰                  ├─ report_sections
└─ 임시 캐시                  ├─ source_documents
                            ├─ markdown_documents
                            ├─ extracted_data
                            ├─ review_changes ✅
                            └─ llm_dialogs
```

---

## Phase 1: reports 테이블 연동 (기반)

### 상태: ✅ 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 1.1 | getReportById() 메서드 추가 | supabase-client.js | ✅ |
| 1.2 | saveReportInfo()에 DB 저장 추가 | workflow-manager.js | ✅ |
| 1.3 | getReportInfo()에 DB 조회 추가 | workflow-manager.js | ✅ |
| 1.4 | 보고서 목록 DB 조회 연동 | P11_ReportList.html | ✅ |

### 상세 구현 계획

#### 1.1 supabase-client.js - getReportById()
```javascript
async getReportById(reportId) {
    await this.init();
    const { data, error } = await this.client
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

    if (error) throw error;
    return { success: true, report: data };
}
```

#### 1.2 workflow-manager.js - saveReportInfo()
```javascript
// 기존: localStorage만 저장
// 변경: localStorage + DB 동시 저장

async saveReportInfo(data) {
    // 1. DB에 저장 (UUID 받기)
    const dbResult = await supabaseClient.createReport({
        report_name: data.reportName,
        created_by: currentUserId,
        status: 'Draft',
        user_inputs: { /* CS 데이터 */ }
    });

    // 2. DB에서 받은 UUID 사용
    const reportInfo = {
        id: dbResult.report.id,  // DB UUID
        // ... 나머지 필드
    };

    // 3. localStorage에도 캐시
    localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(reportInfo));
    return reportInfo;
}
```

#### 1.3 workflow-manager.js - getReportInfo()
```javascript
async getReportInfo(reportId = null) {
    // 1. URL에서 reportId 확인
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = reportId || urlParams.get('reportId');

    // 2. localStorage 캐시 확인
    const cached = localStorage.getItem(STORAGE_KEYS.REPORT);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (!targetId || parsed.id === targetId) {
            return parsed;
        }
    }

    // 3. DB에서 조회 (다른 PC 접근 시)
    if (targetId) {
        const result = await supabaseClient.getReportById(targetId);
        if (result.success) {
            localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(result.report));
            return result.report;
        }
    }

    return null;
}
```

### 핵심 변경점
- 보고서 ID: `REPORT_${Date.now()}` → DB UUID
- URL 구조: `P14.html` → `P14.html?reportId=uuid`
- 데이터 흐름: localStorage 단독 → DB 우선 + localStorage 캐시

---

## Phase 2: report_sections 테이블 연동 (핵심)

### 상태: ✅ 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 2.1 | sections CRUD 메서드 추가 | supabase-client.js | ✅ |
| 2.2 | 섹션 저장/조회 DB 연동 | section-editor.js | ✅ |
| 2.3 | 섹션 생성 시 DB 저장 | psur-generator.js | ✅ |
| 2.4 | 출력 시 DB 조회 | output-generator.js | ✅ |
| 2.5 | 리뷰/출력 페이지 DB 연동 | P18, P20 | ✅ |

### 상세 구현 계획

#### 2.1 supabase-client.js - sections CRUD
```javascript
// 섹션 생성/업데이트 (upsert)
async upsertSection(reportId, sectionNumber, data) {
    await this.init();
    const { data: result, error } = await this.client
        .from('report_sections')
        .upsert({
            report_id: reportId,
            section_number: sectionNumber,
            section_name: data.name,
            content_markdown: data.content,
            version: data.version || 1
        }, { onConflict: 'report_id,section_number' })
        .select()
        .single();

    if (error) throw error;
    return { success: true, section: result };
}

// 보고서의 모든 섹션 조회
async getSections(reportId) {
    await this.init();
    const { data, error } = await this.client
        .from('report_sections')
        .select('*')
        .eq('report_id', reportId)
        .order('section_number');

    if (error) throw error;
    return { success: true, sections: data };
}
```

---

## Phase 3: source_documents + Storage

### 상태: ✅ CRUD 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 3.1 | source_documents CRUD 추가 | supabase-client.js | ✅ |
| 3.2 | 파일 업로드 시 DB 연동 | file-handler.js | 🔄 (선택사항) |
| 3.3 | 파일 업로드 테스트 | P14 | 🔄 (선택사항) |

### 구현된 메서드
- `createSourceDocument(reportId, data)` - 소스 문서 생성
- `getSourceDocuments(reportId)` - 소스 문서 목록 조회
- `updateSourceDocument(documentId, updates)` - 소스 문서 업데이트
- `deleteSourceDocument(documentId)` - 소스 문서 삭제
- `bulkCreateSourceDocuments(reportId, documents)` - 일괄 생성

---

## Phase 4: markdown_documents

### 상태: ✅ CRUD 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 4.1 | markdown_documents CRUD 추가 | supabase-client.js | ✅ |
| 4.2 | 변환 결과 DB 저장 | unified-processor.js | 🔄 (선택사항) |
| 4.3 | 마크다운 변환 테스트 | P15 | 🔄 (선택사항) |

### 구현된 메서드
- `upsertMarkdownDocument(sourceDocId, data)` - 마크다운 문서 생성/업데이트
- `getMarkdownDocument(sourceDocId)` - 마크다운 문서 조회
- `getMarkdownDocumentsByReport(reportId)` - 보고서의 모든 마크다운 조회

---

## Phase 5: extracted_data

### 상태: ✅ CRUD 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 5.1 | extracted_data CRUD 추가 | supabase-client.js | ✅ |
| 5.2 | 추출 결과 DB 저장 | data-extractor.js | 🔄 (선택사항) |
| 5.3 | 데이터 추출 테스트 | P16 | 🔄 (선택사항) |

### 구현된 메서드
- `upsertExtractedData(reportId, dataType, data)` - 추출 데이터 생성/업데이트
- `getExtractedData(reportId, dataType)` - 추출 데이터 조회
- `bulkUpsertExtractedData(reportId, items)` - 일괄 저장

---

## Phase 6: llm_dialogs

### 상태: ✅ CRUD 완료 (2026-01-01)

### 태스크 목록

| # | 태스크 | 파일 | 상태 |
|---|--------|------|------|
| 6.1 | llm_dialogs CRUD 추가 | supabase-client.js | ✅ |
| 6.2 | LLM 호출 시 DB 로깅 | cost-tracker.js | 🔄 (선택사항) |

### 구현된 메서드
- `createLLMDialog(reportId, data)` - LLM 대화 로그 생성
- `getLLMDialogs(reportId)` - LLM 대화 로그 조회
- `getLLMCostStats(reportId)` - LLM 비용 통계 조회

---

## 의존성 다이어그램

```
Phase 1 (reports) ─────────────────────────────────┐
    │                                              │
    ├──→ Phase 2 (report_sections) ────────────────┤
    │        │                                     │
    │        └──→ review_changes (완료 ✅)         │
    │                                              │
    ├──→ Phase 3 (source_documents)                │
    │        │                                     │
    │        └──→ Phase 4 (markdown_documents)     │
    │                 │                            │
    │                 └──→ Phase 5 (extracted_data)│
    │                                              │
    └──→ Phase 6 (llm_dialogs) ────────────────────┘
```

---

## MVP (최소 동작 요건)

**Phase 1 + Phase 2 완료 시:**
- ✅ 보고서 생성 → DB 저장
- ✅ 다른 PC에서 보고서 접근 가능
- ✅ 리뷰어가 섹션 편집 가능
- ✅ QC 담당자가 검토 가능
- ✅ 출력 담당자가 다운로드 가능

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-12-29 | 마이그레이션 계획 수립 |
| 2026-01-01 | Phase 1 완료 - reports 테이블 연동 (supabase-client, workflow-manager, P11_ReportList) |
| 2026-01-01 | Phase 2 완료 - report_sections 테이블 연동 (supabase-client, section-editor, psur-generator, output-generator, P18, P20) |
| 2026-01-01 | Phase 3-6 CRUD 완료 - 모든 테이블 CRUD 메서드 구현 (supabase-client.js) |

---

## 완료 요약

### MVP 달성 ✅
- **Phase 1 + Phase 2** 완료로 다중 PC 협업 가능
- 보고서 생성/조회, 섹션 편집/저장이 DB를 통해 공유됨

### 전체 CRUD 구현 ✅
- `reports` - 보고서 메타데이터
- `report_sections` - 15개 섹션 콘텐츠
- `source_documents` - 업로드된 원본 파일
- `markdown_documents` - 변환된 마크다운
- `extracted_data` - CS/PH/Table 추출 데이터
- `llm_dialogs` - LLM 호출 로그 및 비용

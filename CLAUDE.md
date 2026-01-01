# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KPSUR AGENT** - Korean pharmaceutical PSUR (Periodic Safety Update Report) automation system. Generates regulatory compliance reports for drug safety surveillance following Korean FDA (MFDS) guidelines.

**Tech Stack**: Vanilla JS (ES6) + Supabase (Auth/DB/Storage) + Multi-LLM (Claude/OpenAI/Gemini)

## Development Commands

```bash
# Local server (required for ES6 modules)
python3 -m http.server 8000
# or
npx serve

# Access at http://localhost:8000

# Security check before deployment
./security-check.sh

# Integration verification
./verify-integration.sh
```

## Architecture

### 9-Stage Workflow Pipeline
```
Login → Report Setup → File Upload → MD Conversion → Data Extraction
                                                            ↓
Output ← QC Validation ← Review ← Template Writing ←────────┘
```

### Page Structure (pages/)
| Stage | Page | Purpose |
|-------|------|---------|
| 1 | P01_Login | Authentication (test: main@main.com / 1111) |
| 2 | P13_NewReport | Report setup + LLM mode selection |
| 3 | P14_FileUpload | Upload & auto-classify (RAW ID tagging) |
| 4 | P15_MarkdownConversion | PDF/Excel/Word → Markdown |
| 5 | P16_DataExtraction | Extract CS/PH/Table data |
| 6 | P17_TemplateWriting | Populate templates |
| 7 | P18_Review | Section-by-section editing |
| 8 | P19_QC | Quality validation (12-item checklist) |
| 9 | P20_Output | Word document generation |

### Core JS Modules (js/)
| Module | Purpose |
|--------|---------|
| `multi-llm-client.js` | Claude/OpenAI/Gemini API integration |
| `hybrid-generator.js` | 2-phase generation (Sonnet draft → Opus refinement) |
| `file-handler.js` | Upload, RAW ID classification |
| `markdown-converter.js` | Document → Markdown conversion |
| `data-extractor.js` | CS/PH/Table data extraction |
| `qc-validator.js` | Validation rules + manual checklist |
| `output-generator.js` | docx.js Word export |
| `cost-tracker.js` | LLM usage cost tracking |
| `diff-viewer.js` | Original vs generated comparison |

### Data Flow
```
localStorage keys:
├── uploadedFiles      → File metadata + RAW IDs
├── convertedMarkdowns → Markdown content per file
├── extractedData      → CS/PH/Table JSON
├── generatedSections  → 15 report sections
└── GOOGLE_API_KEY     → User's API key (per-user storage)
```

## Critical Data Rules

**ABSOLUTE RULES** - These override all other considerations:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🚫 NEVER GENERATE MISSING DATA                                      │
│     ✅ If data not found → Ask user                                  │
│     ❌ NEVER make up, estimate, or infer missing values              │
│                                                                       │
│  ⚠️ NEVER ARBITRARILY SELECT CONFLICTING DATA                        │
│     ✅ Present all versions with source/date → Ask user to choose    │
│     ❌ NEVER select "latest" or "best" without user approval         │
└─────────────────────────────────────────────────────────────────────┘
```

## Source Document Classification (RAW IDs)

| RAW ID | Document Type |
|--------|--------------|
| RAW1 | 최신첨부문서 (Latest attached document) |
| RAW2.1-2.3 | 용법용량/효능효과/사용상의주의사항 |
| RAW3 | 시판후sales데이터 |
| RAW4 | 허가현황 |
| RAW5-7 | 안전성조치 관련 메일/변경 |
| RAW12-15 | LineListing (신속보고/정기보고/원시자료) |

## Data Types

1. **CS Data** (~60 variables) - Single values: CS0_성분명, CS1_브랜드명, CS5_국내허가일자
2. **PH Data** (~10 variables) - Narrative text: PH4_원시자료서술문, PH11_총괄평가문
3. **Table Data** (7-9 tables) - Structured: 표2_연도별판매량, 표5_신속보고내역

Variable pattern: `[CS{n}_{한글}]`, `[PH{n}_{한글}]`, `[표{n}_{한글}]`

## LLM Configuration

**Supported Models**:
- Claude: Opus 4.5, Sonnet 3.5, Haiku 3.5
- OpenAI: GPT-4o
- Google: Gemini 2.0 Flash/Pro

**Hybrid Mode** (recommended): Sonnet draft → Opus refinement for sections 9, 10 (61% cost reduction)

**API Keys**: Stored in localStorage (user-managed via P91_Settings)

## Key Reference Documents

| Document | Path |
|----------|------|
| Workflow Spec | `Ref/RawData_Definition.md` |
| CS Data Definitions | `Ref/01_CSData_Definition.md` |
| UI Design Spec | `09_relateDocs/PSUR_UI_Design_Spec.md` |
| Templates | `90_Test/02_Templates/` (sections 00-14) |
| Example Outputs | `90_Test/03_Examples/` |
| Test RAW Data | `data/markdown/RAW*.md` |

## Testing

**Test Accounts**:
- Master: `main@main.com` / `1111`
- Author: `author@kpsur.test` / `test1234`

**Test Data Location**: `test_files/01_RawData/` and `data/markdown/`

**E2E Test Flow**: See `TESTING.md` for complete test scenarios

## Important Constraints

1. **Regulatory Compliance**: Official MFDS submissions - accuracy is paramount
2. **Korean Language**: All reports follow MFDS (식품의약품안전처) guidelines
3. **GitHub Pages Deployment**: No server-side code, ES6 modules with global exports
4. **Content Preservation**: Markdown conversion must preserve all original content exactly

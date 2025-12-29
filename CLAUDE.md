# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Korean pharmaceutical documentation system (KSUR - Korean Safety Update Report)** for automating the creation of regulatory compliance reports for drug safety surveillance. The system processes raw pharmaceutical data (PDFs, Excel, Word documents) and generates structured regulatory reports following Korean FDA (MFDS) guidelines.

**Key Purpose**: Automate the creation of PSUR (Periodic Safety Update Report) documents for pharmaceutical companies to submit to Korean regulators.

## Project Structure

```
02_KSUR_v6/
├── 01_Context/              # Documentation and workflow definitions
│   ├── 01_Workfolw.md       # Complete workflow specification
│   ├── 011_CSExtract.md     # Data extraction strategy (CRITICAL)
│   ├── 0111_CSData_Definition.md    # CS data definitions
│   ├── 0112_PHData_Definition.md    # PH data definitions
│   ├── 0113_TableData_Definition.md # Table data definitions
│   ├── 0114_CS_from_Source.md       # Source document mapping
│   ├── 0115_CS_to_Sections.md       # Section data mapping
│   └── 0116_Source_CS_Sections.md   # Complete data flow mapping
│
├── 02_Context/              # LLM dialog logs (auto-generated)
│   └── 05_DialogWithLLM/    # Stores all LLM interactions
│
├── 03_Template/             # Report templates
│   ├── 01_Report_Total.md   # Master report template with all sections
│   ├── 02_Sections/         # Individual section templates (00-14)
│   └── 03_CS_Data_List.md   # CS data extraction list
│
└── 04_TestProcess/          # Test data and outputs
    ├── 01_RawData/          # Original source documents (PDF, Excel, Word)
    ├── 02_RawData_MD/       # Markdown-converted source documents
    └── 03_CSData_MD/        # Extracted CS data outputs
```

## Data Architecture

### Three Core Data Types

1. **CS Data (Context-Specific)** - ~60 variables
   - Single-value data (text, dates, numbers)
   - Examples: CS0_성분명, CS1_브랜드명, CS5_국내허가일자
   - Used for specific insertions throughout the report

2. **PH Data (Paragraph/Phrase)** - ~10 variables
   - Narrative text (sentences/paragraphs)
   - Examples: PH4_원시자료서술문, PH11_총괄평가문, PH12_결론
   - Used for descriptive sections in the report

3. **Table Data** - ~7-9 tables
   - Structured tabular data
   - Examples: 표2_연도별판매량, 표5_신속보고내역, 표9_SOC별건수
   - Used for data presentation in report body

### Source Document Classification (RAW IDs)

Documents must be classified with RAW ID tags (see `01_Context/01_Workfolw.md:31-55`):

| RAW ID | Description | Korean Name |
|--------|-------------|-------------|
| RAW1 | latest attached document | 최신첨부문서 |
| RAW2.1 | dosage and administration | 용법용량 |
| RAW2.2 | efficacy and effect | 효능효과 |
| RAW2.3 | precautions for use | 사용상의주의사항 |
| RAW3 | post-marketing sales data | 시판후sales데이터 |
| RAW4 | approval status | 허가현황 |
| RAW5.1 | safety measure approval email | 안전성조치허가메일 |
| RAW12-15 | line listing data | 신속보고/정기보고/원시자료 LineListing |

See `01_Context/01_Workfolw.md:35-55` for the complete RAW ID list.

## Workflow Pipeline

The system follows a 9-stage pipeline (see `01_Context/01_Workfolw.md:1-152`):

1. **Login** - User authentication with role-based access (Master/Author/Reviewer/Viewer)

2. **Report Status** - Choose "New Report" or "Continue Existing"
   - New: Input basic user information (CS6, CS7, CS13, CS20, CS21, CS24)
   - Creates DB entry with status='Draft'

3. **Source Document Input** - Upload and classify documents
   - LLM classifies documents by RAW ID tags
   - Saves file matching table: `04_TestProcess/02_RawData_MD/보고서명_화일명매칭테이블_YYMMDD_hhmmss.md`

4. **Markdown Conversion** - Convert all source documents to markdown
   - **CRITICAL**: Never add, remove, or modify content - only format conversion
   - Output: `04_TestProcess/02_RawData_MD/RAW{ID}_파일명.md`

5. **Data Extraction** - Extract CS/PH/Table data from markdown files
   - **CRITICAL RULES** (see `01_Context/011_CSExtract.md:10-76`):
     - 🚫 **NEVER generate missing data** - Ask user if data not found
     - ⚠️ **NEVER arbitrarily choose between conflicting data** - Present all options to user
   - Save LLM dialog logs to `02_Context/05_DialogWithLLM/보고서명_YYMMDD_hhmmss.md`
   - Output: `04_TestProcess/03_CSData_MD/CS_Data_List_YYMMDD_hhmmss.md`

6. **Template Population** - Insert extracted data into report templates
   - Use templates from `03_Template/02_Sections/`
   - Follow mapping in `01_Context/0116_Source_CS_Sections.md`
   - For narrative sections: Match template structure and length exactly

7. **Review** - Section-by-section review and editing UI
   - Display markdown on left, editable document on right
   - Save button for each section
   - "Merge" button combines all sections
   - "Export" button creates Word file with '_Draft' suffix

8. **QC** - Quality control validation
   - **CRITICAL VALIDATION**:
     - Cross-check extracted data against source documents
     - Verify no data conflicts between sections
     - Check table numbering sequence
     - Validate narrative content against source documents
   - Use intensive validation prompts: "Think step by step", "Take your time"
   - If issues found: Present list and require user correction before proceeding
   - If no issues: Remove 'Draft' status

9. **Output** - Final formatting and export

## Critical Development Rules

### Data Extraction (MANDATORY)

These rules from `01_Context/011_CSExtract.md` are **ABSOLUTE** and override all other considerations:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🚫 NEVER GENERATE MISSING DATA                                      │
│     ✅ If data not found → Ask user for the data                     │
│     ❌ NEVER make up, estimate, or infer missing values               │
│                                                                      │
│  ⚠️ NEVER ARBITRARILY SELECT CONFLICTING DATA                        │
│     ✅ Present all versions with source/date → Ask user to choose     │
│     ❌ NEVER select "latest" or "best" version without user approval  │
└─────────────────────────────────────────────────────────────────────┘
```

**Example - Missing Data (CORRECT)**:
```
"CS28_원시총환자수 데이터를 Raw14_원시자료LineListing에서 찾을 수 없습니다.
해당 데이터를 제공해 주시거나, 다른 소스 문서가 있다면 알려주세요."
```

**Example - Conflicting Data (CORRECT)**:
```
"효능효과 데이터 불일치가 발견되었습니다:

| 문서명 | 날짜 | 효능효과 내용 |
|--------|------|---------------|
| 효능효과20210305.md | 2021-03-05 | 16세 이상에서 코로나19 예방 |
| 효능효과20210716.md | 2021-07-16 | 12세 이상에서 코로나19 예방 |

어떤 값을 사용해야 할까요?"
```

### Document Conversion Rules

- **CRITICAL**: Markdown conversion must preserve all original content exactly
- Never summarize, paraphrase, or restructure during conversion
- Only change format from (PDF/Excel/Word) → Markdown
- Preserve all tables, dates, numbers, and text verbatim

### Template Population Rules

- For **non-narrative sections**: Use exact template text with data substitutions
- For **narrative sections (PH data)**: Match template structure and length
- Never add explanations or additional content not in the template

## LLM Configuration

- Default models: Google Gemini 2.0 Flash / Gemini 2.0 Pro (selectable)
- API keys stored in `.env` file
- All LLM interactions must be logged to `02_Context/05_DialogWithLLM/`
  - Format: `[User Msg.]` and `[Resp. Msg]` sections
  - Include model name and timestamp
  - Save as: `보고서명_YYMMDD_hhmmss.md`

## Database Configuration

- **Platform**: Supabase
- **Credentials**: `.env` file with Supabase API keys

### Database Tables

1. **Login Table**: User authentication (roles: Master/Author/Reviewer/Viewer)
2. **Review Changes Table**: Tracks all edits in Review stage
   - Fields: Date, Document Name, Before, After, Editor

## Testing Strategy

### Test Mode Workflow

Each pipeline stage can be tested independently using pre-staged data:

| Stage | Test Data Location | Expected Output |
|-------|-------------------|-----------------|
| Source Document Input | `04_TestProcess/01_RawData/` | File matching table |
| Markdown Conversion | `04_TestProcess/02_RawData_MD/testPill_1_파일매칭테이블_251227_192325.md` | RAW{ID}_*.md files |
| Data Extraction | Markdown files from 02_RawData_MD/ | `03_CSData_MD/CS_Data_List_YYMMDD_hhmmss.md` |
| Template Population | `03_Template/03_CS_Data_List.md` with extracted data | Section markdown files |

### LLM Dialog Logging (During Testing)

During data extraction testing:
- Log all LLM request/response pairs
- Save to: `02_Context/05_DialogWithLLM/보고서명_YYMMDD_hhmmss.md`
- Include model name, user message, and response message
- Format as singleton conversations for each extraction step

## Key Reference Documents

| Document | Path | Purpose |
|----------|------|---------|
| Complete Workflow | `01_Context/01_Workfolw.md` | Full pipeline specification |
| Extraction Strategy | `01_Context/011_CSExtract.md` | **CRITICAL DATA RULES** |
| CS Data Definitions | `01_Context/0111_CSData_Definition.md` | All CS variable definitions |
| Source Mapping | `01_Context/0114_CS_from_Source.md` | RAW ID → CS Data mapping |
| Section Mapping | `01_Context/0116_Source_CS_Sections.md` | CS Data → Report section mapping |
| Master Template | `03_Template/01_Report_Total.md` | Complete report structure |

## Important Constraints

1. **Regulatory Compliance**: This generates official regulatory submissions - accuracy is paramount
2. **Korean Language**: All reports are in Korean following MFDS (식품의약품안전처) guidelines
3. **No Code Yet**: This is a documentation/design project - implementation phase not started
4. **Document-Driven**: All logic and rules are defined in markdown documentation files

## Variable Naming Convention

All variables follow this pattern:
- **CS{number}_{한글설명}**: Context-Specific data (e.g., CS0_성분명, CS15_효능효과)
- **PH{number}_{한글설명}**: Paragraph/Phrase data (e.g., PH4_원시자료서술문)
- **표{number}_{한글설명}**: Table data (e.g., 표2_연도별판매량)

Variables use both IDs in templates (e.g., `[CS1_브랜드명]`) for clear data binding.

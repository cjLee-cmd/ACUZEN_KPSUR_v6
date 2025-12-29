# KSUR (Korean Safety Update Report) Automation Project

## Project Overview

**KSUR** is a documentation and design project aimed at automating the creation of **Periodic Safety Update Reports (PSUR)** for pharmaceutical submissions to the Korean Ministry of Food and Drug Safety (MFDS/식약처).

The system utilizes Large Language Models (LLMs) to extract data from raw pharmaceutical documents (PDF, Excel, Word), convert them to Markdown, and populate structured regulatory report templates.

**Current Status:** Documentation & Design Phase (Implementation has not started).

## Key Components

### 1. Data Architecture
*   **CS Data (Context-Specific):** ~60 single-value variables (e.g., `CS0_성분명`).
*   **PH Data (Paragraph/Phrase):** Narrative text blocks (e.g., `PH11_총괄평가문`).
*   **Table Data:** Structured tables (e.g., `표2_연도별판매량`).
*   **RAW IDs:** Tags for classifying source documents (e.g., `RAW1` for latest attached document).

### 2. Workflow Pipeline (9 Stages)
1.  **Login:** Role-based access (Master/Author/Reviewer/Viewer).
2.  **Report Status:** Create new or continue existing drafts.
3.  **Source Input:** Upload and classify documents (File Matching).
4.  **Markdown Conversion:** Convert raw files to MD **without alteration**.
5.  **Data Extraction:** LLM-based extraction of CS/PH/Table data.
6.  **Template Population:** Insert data into `03_Template` files.
7.  **Review:** Side-by-side comparison and editing.
8.  **QC:** Validation of data integrity and consistency.
9.  **Output:** Final report generation.

### 3. Technology Stack
*   **Database:** Supabase (PostgreSQL) - Schema defined in `09_relateDocs/01_DataBaseStructure.md`.
*   **LLM:** Google Gemini 2.0 Flash / Pro (via API).
*   **Storage:** Supabase Storage (Buckets: `reports`, `markdown`, `outputs`).
*   **Intermediate Format:** Markdown.

## Directory Structure Guide

```
/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/
├── 01_Context/              # CORE LOGIC & DEFINITIONS
│   ├── 01_Workfolw.md       # Master workflow document
│   ├── 011_CSExtract.md     # Data extraction rules (CRITICAL)
│   └── 0111_...md           # Variable definitions (CS, PH, Table)
│
├── 02_Context/              # LOGS
│   └── 05_DialogWithLLM/    # LLM interaction logs
│
├── 03_Template/             # OUTPUT FORMATS
│   ├── 01_Report_Total.md   # Full report structure
│   └── 02_Sections/         # Individual section templates
│
├── 04_TestProcess/          # TEST DATA
│   ├── 01_RawData/          # Sample PDFs, Excel, Word files
│   ├── 02_RawData_MD/       # Converted MD files (Pre-staged)
│   └── 03_CSData_MD/        # Extracted data results
│
├── 09_relateDocs/           # TECHNICAL SPECS
│   └── 01_DataBaseStructure.md # DB Schema
│
└── CLAUDE.md                # AI Assistant Context
```

## Critical Development Rules

### 1. Data Extraction (Absolute Mandate)
*   **🚫 NEVER GENERATE MISSING DATA:** If data is not found, ask the user. Never infer or estimate.
*   **⚠️ NEVER RESOLVE CONFLICTS ARBITRARILY:** If sources differ, present all options to the user.

### 2. Document Conversion
*   **Strict Fidelity:** Markdown conversion must preserve all original content, tables, and formatting exactly. No summarizing or paraphrasing.

### 3. Naming Conventions
*   **Variables:** `CS{id}_{name}`, `PH{id}_{name}`, `표{id}_{name}`.
*   **Files:** Follow the specific patterns defined in `01_Workfolw.md` (e.g., `RAW{ID}_filename.md`).

## Usable Commands / Test Workflow

Since there is no executable code yet, "running" the project means following the **Test Mode Workflow** manually or simulating it:

1.  **Source Input:** Refer to `04_TestProcess/01_RawData/`.
2.  **Conversion:** Compare raw files with `04_TestProcess/02_RawData_MD/`.
3.  **Extraction:** Check `03_Template/03_CS_Data_List.md` against `04_TestProcess/03_CSData_MD/`.

**Environment Setup:**
*   Check `.env` for API keys (Gemini, Supabase) - *Do not commit this file.*

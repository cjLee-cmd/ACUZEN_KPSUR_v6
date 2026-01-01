/**
 * Workflow Manager
 * KPSUR AGENT 중앙 워크플로우 및 상태 관리
 * 모든 Stage 간 데이터 흐름 제어
 */

// 워크플로우 상태 정의
const WORKFLOW_STAGES = {
    1: { name: 'login', page: 'P01_Login.html', title: '로그인' },
    2: { name: 'reportSetup', page: 'P13_NewReport.html', title: '보고서 설정' },
    3: { name: 'fileUpload', page: 'P14_FileUpload.html', title: '파일 업로드' },
    4: { name: 'markdownConversion', page: 'P15_MarkdownConversion.html', title: '마크다운 변환' },
    5: { name: 'dataExtraction', page: 'P16_DataExtraction.html', title: '데이터 추출' },
    6: { name: 'templateWriting', page: 'P17_TemplateWriting.html', title: '보고서 생성' },
    7: { name: 'review', page: 'P18_Review.html', title: '리뷰' },
    8: { name: 'qc', page: 'P19_QC.html', title: 'QC 검증' },
    9: { name: 'output', page: 'P20_Output.html', title: '최종 출력' }
};

// 스토리지 키
const STORAGE_KEYS = {
    WORKFLOW: 'kpsur_workflow',
    REPORT: 'kpsur_current_report',
    FILES: 'kpsur_uploaded_files',
    MARKDOWN: 'kpsur_markdown_data',
    EXTRACTED: 'kpsur_extracted_data',
    DRAFT: 'kpsur_draft_report',
    QC_RESULTS: 'kpsur_qc_results',
    LLM_SETTINGS: 'kpsur_llm_settings',
    COST_TRACKER: 'kpsur_cost_tracker'
};

class WorkflowManager {
    constructor() {
        this.currentStage = 1;
        this.reportData = {};
        this.loadState();
    }

    /**
     * 상태 로드
     */
    loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.WORKFLOW);
            if (saved) {
                const state = JSON.parse(saved);
                this.currentStage = state.currentStage || 1;
                this.reportData = state.reportData || {};
            }
        } catch (e) {
            console.error('Failed to load workflow state:', e);
        }
    }

    /**
     * 상태 저장
     */
    saveState() {
        try {
            localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify({
                currentStage: this.currentStage,
                reportData: this.reportData,
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Failed to save workflow state:', e);
        }
    }

    // ==========================================
    // Stage 2: 보고서 설정 (P13)
    // ==========================================

    /**
     * 보고서 기본 정보 저장
     */
    saveReportInfo(data) {
        const reportInfo = {
            id: data.id || `REPORT_${Date.now()}`,
            name: data.reportName || '',
            ingredient: data.ingredient || '',      // CS0 성분명
            brandName: data.brandName || '',        // CS1 브랜드명
            company: data.company || '',            // CS2 회사명
            reportStartDate: data.reportStartDate || '',  // CS3 보고시작날짜
            reportEndDate: data.reportEndDate || '',      // CS4 보고종료날짜
            approvalDate: data.approvalDate || '',        // CS5 국내허가일자
            submissionDate: data.submissionDate || '',    // CS6 보고서제출일
            version: data.version || '1.0',               // CS7 버전넘버
            expiryDate: data.expiryDate || '',            // CS13 유효기간
            medDRAVersion: data.medDRAVersion || '27.0',  // CS24 MedDRA버전
            rawDataRequestDate: data.rawDataRequestDate || '', // CS31 원시자료신청일
            literatureDB: data.literatureDB || [],        // CS53 문헌DB
            createdAt: new Date().toISOString(),
            status: 'draft'
        };

        this.reportData = { ...this.reportData, reportInfo };
        localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(reportInfo));
        this.saveState();
        return reportInfo;
    }

    /**
     * 보고서 정보 로드
     */
    getReportInfo() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.REPORT);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * LLM 설정 저장
     */
    saveLLMSettings(settings) {
        const llmSettings = {
            mode: settings.mode || 'hybrid',  // 'single' or 'hybrid'
            singleModel: settings.singleModel || 'claude-sonnet-3-5',
            hybridPhase1: settings.hybridPhase1 || 'claude-sonnet-3-5',
            hybridPhase2: settings.hybridPhase2 || 'claude-opus-4-5',
            refineSections: settings.refineSections || [9, 10],
            temperature: settings.temperature || 0.3,
            maxTokens: settings.maxTokens || 12000
        };

        this.reportData = { ...this.reportData, llmSettings };
        localStorage.setItem(STORAGE_KEYS.LLM_SETTINGS, JSON.stringify(llmSettings));
        this.saveState();
        return llmSettings;
    }

    /**
     * LLM 설정 로드
     */
    getLLMSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.LLM_SETTINGS);
            return saved ? JSON.parse(saved) : {
                mode: 'hybrid',
                singleModel: 'claude-sonnet-3-5',
                hybridPhase1: 'claude-sonnet-3-5',
                hybridPhase2: 'claude-opus-4-5',
                refineSections: [9, 10]
            };
        } catch (e) {
            return null;
        }
    }

    // ==========================================
    // Stage 3: 파일 업로드 (P14)
    // ==========================================

    /**
     * 업로드된 파일 정보 저장
     */
    saveUploadedFiles(files) {
        const fileInfo = files.map(f => ({
            id: f.id || `FILE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: f.name,
            type: f.type,
            size: f.size,
            category: f.category || this.detectFileCategory(f.name),
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
            // Base64 데이터는 별도 저장 (큰 파일은 IndexedDB 권장)
            dataUrl: f.dataUrl || null
        }));

        this.reportData = { ...this.reportData, files: fileInfo };
        localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(fileInfo));
        this.saveState();
        return fileInfo;
    }

    /**
     * 파일 카테고리 자동 감지
     */
    detectFileCategory(filename) {
        const lower = filename.toLowerCase();
        if (lower.includes('raw1') || lower.includes('첨부문서')) return 'RAW1';
        if (lower.includes('raw3') || lower.includes('판매')) return 'RAW3';
        if (lower.includes('raw4') || lower.includes('허가')) return 'RAW4';
        if (lower.includes('raw12') || lower.includes('국외')) return 'RAW12';
        if (lower.includes('raw14') || lower.includes('원시')) return 'RAW14';
        if (lower.includes('raw15') || lower.includes('문헌')) return 'RAW15';
        return 'OTHER';
    }

    /**
     * 업로드된 파일 로드
     */
    getUploadedFiles() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.FILES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    // ==========================================
    // Stage 4: 마크다운 변환 (P15)
    // ==========================================

    /**
     * 마크다운 변환 결과 저장
     */
    saveMarkdownData(fileId, markdownContent) {
        const markdownData = this.getMarkdownData();
        markdownData[fileId] = {
            content: markdownContent,
            convertedAt: new Date().toISOString(),
            status: 'converted'
        };

        this.reportData = { ...this.reportData, markdown: markdownData };
        localStorage.setItem(STORAGE_KEYS.MARKDOWN, JSON.stringify(markdownData));
        this.saveState();
        return markdownData[fileId];
    }

    /**
     * 마크다운 데이터 로드
     */
    getMarkdownData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.MARKDOWN);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    // ==========================================
    // Stage 5: 데이터 추출 (P16)
    // ==========================================

    /**
     * 추출된 데이터 저장
     */
    saveExtractedData(data) {
        const extractedData = {
            commonStrings: data.commonStrings || {},  // CS0~CS53
            placeholders: data.placeholders || {},     // PH1~PH100
            tables: data.tables || {},                 // TBL1~TBL20
            extractedAt: new Date().toISOString(),
            llmModel: data.llmModel || 'unknown',
            status: 'extracted'
        };

        this.reportData = { ...this.reportData, extracted: extractedData };
        localStorage.setItem(STORAGE_KEYS.EXTRACTED, JSON.stringify(extractedData));
        this.saveState();
        return extractedData;
    }

    /**
     * 추출된 데이터 로드
     */
    getExtractedData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.EXTRACTED);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    // ==========================================
    // Stage 6: 보고서 생성 (P17)
    // ==========================================

    /**
     * 초안 보고서 저장
     */
    saveDraftReport(content, metadata = {}) {
        const draftReport = {
            content: content,
            sections: this.parseSections(content),
            generatedAt: new Date().toISOString(),
            llmSettings: metadata.llmSettings || this.getLLMSettings(),
            phase1Complete: metadata.phase1Complete || false,
            phase2Complete: metadata.phase2Complete || false,
            totalCost: metadata.totalCost || 0,
            status: 'draft'
        };

        this.reportData = { ...this.reportData, draft: draftReport };
        localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draftReport));
        this.saveState();
        return draftReport;
    }

    /**
     * 보고서 섹션 파싱
     */
    parseSections(content) {
        const sections = {};
        const sectionRegex = /^## (\d+)\. (.+)$/gm;
        let match;
        let lastIndex = 0;
        let lastSection = null;

        while ((match = sectionRegex.exec(content)) !== null) {
            if (lastSection) {
                sections[lastSection.num] = {
                    title: lastSection.title,
                    content: content.substring(lastIndex, match.index).trim()
                };
            }
            lastSection = { num: match[1], title: match[2] };
            lastIndex = match.index;
        }

        // 마지막 섹션
        if (lastSection) {
            sections[lastSection.num] = {
                title: lastSection.title,
                content: content.substring(lastIndex).trim()
            };
        }

        return sections;
    }

    /**
     * 초안 보고서 로드
     */
    getDraftReport() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.DRAFT);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    // ==========================================
    // Stage 7: 리뷰 (P18)
    // ==========================================

    /**
     * 리뷰 수정사항 저장
     */
    saveReviewEdits(sectionNum, newContent) {
        const draft = this.getDraftReport();
        if (draft && draft.sections) {
            draft.sections[sectionNum].content = newContent;
            draft.sections[sectionNum].editedAt = new Date().toISOString();
            draft.sections[sectionNum].edited = true;

            // 전체 content 재구성
            draft.content = this.reconstructContent(draft.sections);
            draft.lastEditedAt = new Date().toISOString();

            localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
            this.saveState();
        }
        return draft;
    }

    /**
     * 섹션들을 다시 조합하여 전체 content 생성
     */
    reconstructContent(sections) {
        return Object.entries(sections)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([num, sec]) => sec.content)
            .join('\n\n');
    }

    // ==========================================
    // Stage 8: QC 검증 (P19)
    // ==========================================

    /**
     * QC 결과 저장
     */
    saveQCResults(results) {
        const qcResults = {
            autoValidation: results.autoValidation || {},
            manualChecklist: results.manualChecklist || {},
            overallScore: results.overallScore || 0,
            issues: results.issues || [],
            validatedAt: new Date().toISOString(),
            approvedBy: results.approvedBy || null,
            status: results.status || 'pending'
        };

        this.reportData = { ...this.reportData, qc: qcResults };
        localStorage.setItem(STORAGE_KEYS.QC_RESULTS, JSON.stringify(qcResults));
        this.saveState();
        return qcResults;
    }

    /**
     * QC 결과 로드
     */
    getQCResults() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.QC_RESULTS);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    // ==========================================
    // 네비게이션
    // ==========================================

    /**
     * 다음 Stage로 이동
     */
    goToNextStage() {
        if (this.currentStage < 9) {
            this.currentStage++;
            this.saveState();
            this.navigateToStage(this.currentStage);
        }
    }

    /**
     * 이전 Stage로 이동
     */
    goToPreviousStage() {
        if (this.currentStage > 1) {
            this.currentStage--;
            this.saveState();
            this.navigateToStage(this.currentStage);
        }
    }

    /**
     * 특정 Stage로 이동
     */
    goToStage(stageNum) {
        if (WORKFLOW_STAGES[stageNum]) {
            this.currentStage = stageNum;
            this.saveState();
            this.navigateToStage(stageNum);
        }
    }

    /**
     * 페이지 이동
     */
    navigateToStage(stageNum) {
        const stage = WORKFLOW_STAGES[stageNum];
        if (stage) {
            // 현재 위치 확인
            const currentPath = window.location.pathname;
            const isInPages = currentPath.includes('/pages/');
            const prefix = isInPages ? '' : 'pages/';

            window.location.href = prefix + stage.page;
        }
    }

    /**
     * 현재 Stage 정보 가져오기
     */
    getCurrentStage() {
        return {
            number: this.currentStage,
            ...WORKFLOW_STAGES[this.currentStage]
        };
    }

    /**
     * Stage 완료 여부 확인
     */
    isStageComplete(stageNum) {
        switch (stageNum) {
            case 2: return !!this.getReportInfo();
            case 3: return this.getUploadedFiles().length > 0;
            case 4: return Object.keys(this.getMarkdownData()).length > 0;
            case 5: return !!this.getExtractedData();
            case 6: return !!this.getDraftReport();
            case 7: return this.getDraftReport()?.lastEditedAt != null;
            case 8: return this.getQCResults()?.status === 'approved';
            default: return true;
        }
    }

    // ==========================================
    // 전체 리셋
    // ==========================================

    /**
     * 새 보고서 시작 (기존 데이터 초기화)
     */
    startNewReport() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.currentStage = 2;
        this.reportData = {};
        this.saveState();
    }

    /**
     * 전체 워크플로우 데이터 내보내기
     */
    exportWorkflowData() {
        return {
            reportInfo: this.getReportInfo(),
            llmSettings: this.getLLMSettings(),
            files: this.getUploadedFiles(),
            markdown: this.getMarkdownData(),
            extracted: this.getExtractedData(),
            draft: this.getDraftReport(),
            qcResults: this.getQCResults(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * 워크플로우 데이터 가져오기
     */
    importWorkflowData(data) {
        if (data.reportInfo) localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(data.reportInfo));
        if (data.llmSettings) localStorage.setItem(STORAGE_KEYS.LLM_SETTINGS, JSON.stringify(data.llmSettings));
        if (data.files) localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(data.files));
        if (data.markdown) localStorage.setItem(STORAGE_KEYS.MARKDOWN, JSON.stringify(data.markdown));
        if (data.extracted) localStorage.setItem(STORAGE_KEYS.EXTRACTED, JSON.stringify(data.extracted));
        if (data.draft) localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(data.draft));
        if (data.qcResults) localStorage.setItem(STORAGE_KEYS.QC_RESULTS, JSON.stringify(data.qcResults));
        this.loadState();
    }
}

// Singleton instance
const workflowManager = new WorkflowManager();

// 전역 내보내기
if (typeof window !== 'undefined') {
    window.workflowManager = workflowManager;
    window.WorkflowManager = WorkflowManager;
    window.WORKFLOW_STAGES = WORKFLOW_STAGES;
    window.STORAGE_KEYS = STORAGE_KEYS;
}

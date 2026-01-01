/**
 * Hybrid PSUR Generator
 * 2-Phase Hybrid LLM Generation (Sonnet draft → Opus refine)
 * GitHub Pages 정적 호스팅 호환 - 전역 window 객체 사용
 */

// 전역 의존성 fallback (config.js에서 이미 선언된 경우 재선언하지 않음)
if (!window.multiLLMClient) {
    window.multiLLMClient = {
        generateWithHybrid: async (prompt, mode) => ({ content: '', cost: 0 }),
        getStats: () => ({ totalCalls: 0, totalTokens: 0, totalCost: 0 })
    };
}

if (!window.HYBRID_MODES) {
    window.HYBRID_MODES = {
        SPEED: 'speed',
        BALANCED: 'balanced',
        QUALITY: 'quality'
    };
}

if (!window.Storage) {
    window.Storage = {
        get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
        set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
    };
}

if (!window.DateHelper) {
    window.DateHelper = {
        formatISO: (date = new Date()) => date.toISOString()
    };
}

// PSUR 섹션 정의
const PSUR_SECTIONS = [
    { id: 0, name: '표지', type: 'CS', critical: false },
    { id: 1, name: '개요', type: 'CS', critical: false },
    { id: 2, name: '국내외허가현황', type: 'Table', critical: false },
    { id: 3, name: '시판후sales데이터', type: 'CS+PH+Table', critical: false },
    { id: 4, name: '국내신속보고내역', type: 'PH+Table', critical: false },
    { id: 5, name: '국내정기보고내역', type: 'PH+Table', critical: false },
    { id: 6, name: '국내원시자료', type: 'PH+Table', critical: false },
    { id: 7, name: '국내외안전성조치현황', type: 'PH+Table', critical: false },
    { id: 8, name: '국내외판매중지현황', type: 'PH+Table', critical: false },
    { id: 9, name: '종합적인안전성평가', type: 'PH', critical: true },
    { id: 10, name: '결론', type: 'PH', critical: true },
    { id: 11, name: '해외정기보고내역', type: 'PH', critical: false },
    { id: 12, name: '해외원시자료', type: 'PH', critical: false },
    { id: 13, name: '참고문헌', type: 'Manual', critical: false },
    { id: 14, name: '부록', type: 'Manual', critical: false }
];

class HybridGenerator {
    constructor() {
        this.currentPhase = 0;
        this.progress = 0;
        this.results = {
            phase1: null,
            phase2: null,
            merged: null,
            comparison: null
        };
        this.callbacks = {};
    }

    /**
     * 이벤트 콜백 등록
     */
    on(event, callback) {
        this.callbacks[event] = callback;
    }

    /**
     * 이벤트 발생
     */
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    /**
     * PSUR 보고서 생성 프롬프트 구성
     */
    buildPSURPrompt(extractedData, sourceDocuments) {
        const { csData, phData, tableData } = extractedData;

        return `당신은 PSUR(정기 안전성 갱신 보고서) 작성 전문가입니다.

다음 원시 데이터를 기반으로 완전한 PSUR 보고서를 마크다운 형식으로 작성하세요.

## 추출된 데이터

### CS (치환 데이터)
${Object.entries(csData || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### PH (서술문 데이터)
${Object.entries(phData || {}).map(([k, v]) => `- ${k}: ${v?.substring(0, 200)}...`).join('\n')}

### 표 데이터
${Object.entries(tableData || {}).map(([k, v]) => `- ${k}: [표 데이터 ${v?.rows?.length || 0}행]`).join('\n')}

## 소스 문서 참조
${sourceDocuments?.substring(0, 10000) || '소스 문서 없음'}

## PSUR 작성 지침

1. **구조**: 15개 섹션으로 구성 (00-14)
2. **핵심 섹션**:
   - 섹션 9 (종합적인안전성평가): Signal Detection, SOC별 분석, 정량적 평가
   - 섹션 10 (결론): 유익성-위해성 균형 평가
3. **데이터 정확성**: 원시 데이터를 정확하게 반영
4. **규제 준수**: MFDS 가이드라인 준수

## 출력 형식

각 섹션은 다음 형식으로 작성:

\`\`\`markdown
## {섹션번호}. {섹션명}

{내용}
\`\`\`

전체 PSUR 보고서를 마크다운으로 작성하세요.`;
    }

    /**
     * 단일 모드 생성
     */
    async generateSingle(extractedData, sourceDocuments, options = {}) {
        this.emit('start', { mode: 'single', phase: 1 });
        this.currentPhase = 1;
        this.progress = 0;

        const prompt = this.buildPSURPrompt(extractedData, sourceDocuments);

        try {
            this.emit('progress', { phase: 1, progress: 10, message: '프롬프트 구성 완료' });

            const result = await multiLLMClient.generate(prompt, {
                provider: options.provider || 'claude',
                model: options.model || 'claude-sonnet-3-5',
                temperature: 0.5
            });

            this.emit('progress', { phase: 1, progress: 100, message: '생성 완료' });

            this.results.phase1 = {
                content: result.text,
                model: result.model,
                provider: result.provider,
                cost: result.cost,
                duration: result.duration,
                usage: result.usage
            };

            this.emit('complete', {
                mode: 'single',
                result: this.results.phase1,
                totalCost: result.cost
            });

            return this.results.phase1;

        } catch (error) {
            this.emit('error', { phase: 1, error: error.message });
            throw error;
        }
    }

    /**
     * Hybrid 모드 생성 (Phase 1 + Phase 2)
     */
    async generateHybrid(extractedData, sourceDocuments, hybridMode = 'sonnet-opus', options = {}) {
        const config = HYBRID_MODES[hybridMode];
        if (!config) throw new Error(`Unknown hybrid mode: ${hybridMode}`);

        this.emit('start', { mode: 'hybrid', hybridMode, config });
        this.currentPhase = 1;
        this.progress = 0;

        const prompt = this.buildPSURPrompt(extractedData, sourceDocuments);

        try {
            // Phase 1: 초안 생성
            this.emit('phase', { phase: 1, status: 'start', model: config.phase1.model });
            this.emit('progress', { phase: 1, progress: 5, message: 'Phase 1 시작...' });

            const phase1Result = await multiLLMClient.generate(prompt, {
                provider: config.phase1.provider,
                model: config.phase1.model,
                temperature: 0.5
            });

            this.results.phase1 = {
                content: phase1Result.text,
                model: phase1Result.model,
                provider: phase1Result.provider,
                cost: phase1Result.cost,
                duration: phase1Result.duration,
                usage: phase1Result.usage
            };

            this.emit('phase', { phase: 1, status: 'complete', result: this.results.phase1 });
            this.emit('progress', { phase: 1, progress: 50, message: 'Phase 1 완료!' });

            // Phase 2: 핵심 섹션 개선
            this.currentPhase = 2;
            this.emit('phase', { phase: 2, status: 'start', model: config.phase2.model });
            this.emit('progress', { phase: 2, progress: 55, message: 'Phase 2 시작...' });

            const refinementPrompt = this.buildRefinementPrompt(
                phase1Result.text,
                config.refineSections,
                sourceDocuments
            );

            const phase2Result = await multiLLMClient.generate(refinementPrompt, {
                provider: config.phase2.provider,
                model: config.phase2.model,
                temperature: 0.3
            });

            this.results.phase2 = {
                content: phase2Result.text,
                model: phase2Result.model,
                provider: phase2Result.provider,
                cost: phase2Result.cost,
                duration: phase2Result.duration,
                usage: phase2Result.usage,
                refinedSections: config.refineSections
            };

            this.emit('phase', { phase: 2, status: 'complete', result: this.results.phase2 });
            this.emit('progress', { phase: 2, progress: 90, message: 'Phase 2 완료!' });

            // 결과 병합
            this.results.merged = this.mergePhases(
                phase1Result.text,
                phase2Result.text,
                config.refineSections
            );

            // 비교 데이터 생성
            this.results.comparison = this.buildComparison(
                phase1Result.text,
                this.results.merged,
                config.refineSections
            );

            const totalCost = this.results.phase1.cost + this.results.phase2.cost;
            const totalDuration = parseFloat(this.results.phase1.duration) + parseFloat(this.results.phase2.duration);

            this.emit('progress', { phase: 2, progress: 100, message: '병합 완료!' });
            this.emit('complete', {
                mode: 'hybrid',
                hybridMode,
                result: this.results.merged,
                phase1: this.results.phase1,
                phase2: this.results.phase2,
                comparison: this.results.comparison,
                totalCost,
                totalDuration: totalDuration.toFixed(2),
                estimatedSavings: config.estimatedSavings
            });

            return {
                content: this.results.merged,
                phase1: this.results.phase1,
                phase2: this.results.phase2,
                comparison: this.results.comparison,
                totalCost,
                totalDuration: totalDuration.toFixed(2)
            };

        } catch (error) {
            this.emit('error', { phase: this.currentPhase, error: error.message });
            throw error;
        }
    }

    /**
     * Phase 2 개선 프롬프트
     */
    buildRefinementPrompt(draft, sections, sourceDocuments) {
        const sectionNames = {
            9: '종합적인 안전성 평가',
            10: '결론'
        };

        const sectionList = sections.map(s => `${s}. ${sectionNames[s] || `섹션 ${s}`}`).join(', ');

        return `당신은 PSUR(정기 안전성 갱신 보고서) 전문 검토자입니다.

## 작업 목표
아래 초안 보고서의 핵심 섹션들을 전문가 수준으로 개선하세요.

## 개선 대상 섹션
${sectionList}

## 개선 요구사항

### 섹션 9 (종합적인 안전성 평가)
1. **정량적 분석 필수**:
   - Patient-years 노출량 계산
   - 이상반응 발생률 (건/1,000 patient-years)
   - PRR (Proportional Reporting Ratio) 분석

2. **Signal Detection**:
   - 새로운 안전성 신호 식별
   - 기존 알려진 위험의 변화

3. **SOC별 분류**:
   - MedDRA SOC 기준 체계적 분류
   - 각 SOC별 주요 이상반응 분석

4. **임상적 중요성 평가**:
   - 중대한 이상반응(SAE) 상세 분석
   - 예상 vs 비예상 비율

### 섹션 10 (결론)
1. **유익성-위해성 균형**:
   - 현재 적응증에서의 유익성 유지
   - 알려진 위험 대비 유익성 평가

2. **권고사항**:
   - 추가 조치 필요 여부
   - 허가사항 변경 권고

3. **결론문**:
   - 명확하고 간결한 안전성 결론
   - 규제 보고 요건 충족

## 소스 문서 참조
${sourceDocuments?.substring(0, 5000) || ''}

## 초안 보고서
${draft}

## 출력 형식
개선된 섹션들만 다음 형식으로 출력:

\`\`\`markdown
## 9. 종합적인 안전성 평가
[개선된 내용]

## 10. 결론
[개선된 내용]
\`\`\``;
    }

    /**
     * Phase 1과 Phase 2 결과 병합
     */
    mergePhases(draft, refined, refineSections) {
        let merged = draft;

        for (const sectionNum of refineSections) {
            // Phase 2에서 개선된 섹션 추출
            const sectionPattern = new RegExp(
                `## ${sectionNum}\\.\\s*[^#]*?(?=## \\d+\\.|$)`,
                's'
            );

            const refinedMatch = refined.match(sectionPattern);
            if (refinedMatch) {
                // 원본 섹션을 개선된 섹션으로 교체
                merged = merged.replace(sectionPattern, refinedMatch[0].trim() + '\n\n');
            }
        }

        return merged;
    }

    /**
     * Phase 비교 데이터 생성
     */
    buildComparison(original, merged, refineSections) {
        const comparison = [];

        for (const sectionNum of refineSections) {
            const sectionPattern = new RegExp(
                `## ${sectionNum}\\.\\s*([^#]*?)(?=## \\d+\\.|$)`,
                's'
            );

            const originalMatch = original.match(sectionPattern);
            const mergedMatch = merged.match(sectionPattern);

            comparison.push({
                sectionNum,
                sectionName: sectionNum === 9 ? '종합적인 안전성 평가' : '결론',
                original: originalMatch ? originalMatch[1].trim() : '',
                improved: mergedMatch ? mergedMatch[1].trim() : '',
                hasChanges: originalMatch && mergedMatch ?
                    originalMatch[1].trim() !== mergedMatch[1].trim() : false
            });
        }

        return comparison;
    }

    /**
     * 섹션별 생성 (개별 섹션 생성용)
     */
    async generateSection(sectionId, extractedData, options = {}) {
        const section = PSUR_SECTIONS.find(s => s.id === sectionId);
        if (!section) throw new Error(`Unknown section: ${sectionId}`);

        const prompt = this.buildSectionPrompt(section, extractedData);

        const result = await multiLLMClient.generate(prompt, {
            provider: options.provider || 'claude',
            model: section.critical ? 'claude-opus-4-5' : 'claude-sonnet-3-5',
            temperature: 0.3
        });

        return {
            sectionId,
            sectionName: section.name,
            content: result.text,
            model: result.model,
            cost: result.cost
        };
    }

    /**
     * 개별 섹션 프롬프트
     */
    buildSectionPrompt(section, extractedData) {
        const { csData, phData, tableData } = extractedData;

        return `PSUR 보고서의 섹션 ${section.id}. ${section.name}을 작성하세요.

## 섹션 유형: ${section.type}

## 사용할 데이터
${section.type.includes('CS') ? `### CS 데이터\n${JSON.stringify(csData, null, 2)}` : ''}
${section.type.includes('PH') ? `### PH 데이터\n${JSON.stringify(phData, null, 2)}` : ''}
${section.type.includes('Table') ? `### 표 데이터\n${JSON.stringify(tableData, null, 2)}` : ''}

## 작성 지침
- MFDS 가이드라인 준수
- 명확하고 간결한 문체
- 마크다운 형식 사용

마크다운 형식으로 섹션 내용만 출력하세요.`;
    }

    /**
     * 결과 저장
     */
    saveResults(reportName) {
        const data = {
            reportName,
            generatedAt: DateHelper.formatISO(),
            results: this.results,
            stats: multiLLMClient.getStats()
        };

        Storage.set(`psur_hybrid_${reportName}`, data);
        return data;
    }

    /**
     * 결과 불러오기
     */
    loadResults(reportName) {
        return Storage.get(`psur_hybrid_${reportName}`);
    }

    /**
     * 초기화
     */
    reset() {
        this.currentPhase = 0;
        this.progress = 0;
        this.results = {
            phase1: null,
            phase2: null,
            merged: null,
            comparison: null
        };
    }
}

// Singleton export
const hybridGenerator = new HybridGenerator();

// 전역으로 내보내기 (ES6 모듈 대신 window 객체 사용)
if (typeof window !== 'undefined') {
    window.hybridGenerator = hybridGenerator;
    window.HybridGenerator = HybridGenerator;
    window.PSUR_SECTIONS = PSUR_SECTIONS;
    // outputGenerator는 output-generator.js에서 별도로 설정됨
    // window.outputGenerator alias 제거 - output-generator.js 우선
}

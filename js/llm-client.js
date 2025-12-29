/**
 * LLM Client (Google Gemini API)
 * LLM 연결 및 프롬프트 실행
 */

import { CONFIG, Storage, DateHelper } from './config.js';

class LLMClient {
    constructor() {
        this.apiKey = null;
        this.currentModel = CONFIG.LLM.DEFAULT_MODEL;
        this.dialogHistory = [];
    }

    /**
     * API 키 설정
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        Storage.set(CONFIG.STORAGE_KEYS.GOOGLE_API_KEY, apiKey);
        console.log('✅ Gemini API key set');
    }

    /**
     * API 키 가져오기
     */
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = Storage.get(CONFIG.STORAGE_KEYS.GOOGLE_API_KEY);
        }
        return this.apiKey;
    }

    /**
     * 모델 변경
     */
    setModel(model) {
        if (Object.values(CONFIG.LLM.MODELS).includes(model)) {
            this.currentModel = model;
            console.log('✅ Model changed to:', model);
            return true;
        }
        console.error('❌ Invalid model:', model);
        return false;
    }

    /**
     * Gemini API 호출
     */
    async generateContent(prompt, options = {}) {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const model = options.model || this.currentModel;
        const url = `${CONFIG.LLM.API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 8192,
            }
        };

        try {
            const startTime = Date.now();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || '알 수 없는 오류'}`);
            }

            const data = await response.json();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            // 응답 추출
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('응답에서 텍스트를 추출할 수 없습니다.');
            }

            // 대화 로그 저장
            this.logDialog(prompt, text, model, duration);

            console.log(`✅ LLM response received (${duration}s)`);

            return {
                success: true,
                text: text,
                model: model,
                duration: duration
            };

        } catch (error) {
            console.error('❌ LLM request failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 파일 분류 (RAW ID 태깅)
     */
    async classifyDocument(filename, content) {
        const prompt = `당신은 제약 문서 분류 전문가입니다.

아래 파일을 분석하여 어떤 문서 유형에 해당하는지 RAW ID를 선택하세요.

**파일명**: ${filename}

**내용 미리보기**:
${content.substring(0, 2000)}

**RAW ID 목록**:
${Object.entries(CONFIG.RAW_IDS).map(([id, name]) => `- ${id}: ${name}`).join('\n')}

**지침**:
1. 파일명과 내용을 면밀히 분석하세요.
2. 가장 적합한 RAW ID를 선택하세요.
3. 응답 형식: RAW ID만 출력 (예: RAW2.1)
4. 확실하지 않으면 "UNKNOWN"을 출력하세요.

**RAW ID**:`;

        const result = await this.generateContent(prompt, {
            temperature: 0.3,
            maxOutputTokens: 50
        });

        if (result.success) {
            const rawId = result.text.trim().toUpperCase();

            // 유효성 검증
            if (rawId === 'UNKNOWN') {
                return { success: true, rawId: null, needsUserInput: true };
            }

            if (CONFIG.RAW_IDS[rawId]) {
                return { success: true, rawId: rawId };
            }

            // 유효하지 않은 RAW ID
            return { success: false, error: `유효하지 않은 RAW ID: ${rawId}` };
        }

        return result;
    }

    /**
     * 마크다운 변환
     */
    async convertToMarkdown(content, filename, rawId) {
        const prompt = `당신은 문서 변환 전문가입니다.

아래 문서를 마크다운 형식으로 변환하세요.

**파일명**: ${filename}
**문서 유형**: ${rawId} - ${CONFIG.RAW_IDS[rawId]}

**원본 내용**:
${content}

**⚠️ 중요 규칙**:
1. **절대로 내용을 추가하거나 변형하지 마세요**
2. **원본 문서 그대로 변환**하세요
3. 테이블, 날짜, 숫자, 텍스트를 정확하게 보존하세요
4. 요약하거나 재구성하지 마세요
5. 마크다운 포맷만 적용하세요

**마크다운 변환 결과**:`;

        return await this.generateContent(prompt, {
            temperature: 0.1,
            maxOutputTokens: 8192
        });
    }

    /**
     * 데이터 추출 (CS/PH/Table)
     */
    async extractData(markdownContent, dataDefinitions, rawId) {
        const prompt = `당신은 제약 데이터 추출 전문가입니다.

아래 마크다운 문서에서 요청된 데이터를 추출하세요.

**문서 유형**: ${rawId} - ${CONFIG.RAW_IDS[rawId]}

**마크다운 문서**:
${markdownContent}

**추출할 데이터 목록**:
${dataDefinitions}

**🚫 절대 규칙**:
1. **데이터가 없으면 생성하지 마세요** → "DATA_NOT_FOUND" 반환
2. **충돌하는 데이터는 임의로 선택하지 마세요** → 모든 버전을 나열
3. **추측하거나 추정하지 마세요** → 문서에 있는 그대로만 추출

**응답 형식**:
\`\`\`json
{
  "CS0_성분명": "추출된 값" 또는 "DATA_NOT_FOUND",
  "CS1_브랜드명": "추출된 값" 또는 "DATA_NOT_FOUND"
}
\`\`\`

**추출 결과**:`;

        return await this.generateContent(prompt, {
            temperature: 0.1,
            maxOutputTokens: 4096
        });
    }

    /**
     * 대화 로그 저장
     */
    logDialog(userMsg, responseMsg, model, duration) {
        const dialog = {
            timestamp: DateHelper.formatISO(),
            model: model,
            duration: duration,
            user: userMsg,
            response: responseMsg
        };

        this.dialogHistory.push(dialog);
    }

    /**
     * 대화 로그 내보내기 (마크다운 형식)
     */
    exportDialogHistory(reportName) {
        const timestamp = DateHelper.formatYYMMDD_hhmmss();
        const filename = `${reportName}_${timestamp}.md`;

        let markdown = `# LLM Dialog History: ${reportName}\n\n`;
        markdown += `**생성 시간**: ${DateHelper.formatISO()}\n\n`;
        markdown += `---\n\n`;

        this.dialogHistory.forEach((dialog, index) => {
            markdown += `## Dialog ${index + 1}\n\n`;
            markdown += `**시간**: ${dialog.timestamp}\n`;
            markdown += `**모델**: ${dialog.model}\n`;
            markdown += `**소요 시간**: ${dialog.duration}s\n\n`;
            markdown += `### [User Msg.]\n\n`;
            markdown += `\`\`\`\n${dialog.user}\n\`\`\`\n\n`;
            markdown += `### [Resp. Msg]\n\n`;
            markdown += `\`\`\`\n${dialog.response}\n\`\`\`\n\n`;
            markdown += `---\n\n`;
        });

        return { filename, content: markdown };
    }

    /**
     * 대화 로그 초기화
     */
    clearDialogHistory() {
        this.dialogHistory = [];
        console.log('✅ Dialog history cleared');
    }
}

// Singleton instance
const llmClient = new LLMClient();

export default llmClient;

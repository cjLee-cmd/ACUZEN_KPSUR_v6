/**
 * System Test Runner for KPSUR
 * Handles LLM and Database connectivity tests
 */

class TestRunner {
    constructor() {
        this.llmResults = [];
        this.dbResults = [];
        this.supabaseClient = null;

        // Configuration (can be overridden)
        this.config = {
            supabaseUrl: 'https://toelnxgizxwbdikskmxa.supabase.co',
            supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZWxueGdpenh3YmRpa3NrbXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDAyMzUsImV4cCI6MjA3NzU3NjIzNX0.mpBAWTufodmfPUp6nmg7Qez6uygrplK9S91xl8c4mR8',
            geminiApiKey: localStorage.getItem('GOOGLE_API_KEY') || ''
        };

        this.initSupabase();
    }

    initSupabase() {
        if (typeof supabase !== 'undefined') {
            this.supabaseClient = supabase.createClient(
                this.config.supabaseUrl,
                this.config.supabaseKey
            );
        }
    }

    // Show/hide loading overlay
    showLoading(text = '테스트 실행 중...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (overlay) {
            overlay.classList.add('active');
            if (loadingText) loadingText.textContent = text;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    // Update progress
    updateProgress(type, current, total, text) {
        const progressBar = document.getElementById(`${type}ProgressBar`);
        const progressText = document.getElementById(`${type}ProgressText`);
        const progressContainer = document.getElementById(`${type}Progress`);

        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) {
            const percentage = (current / total) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) progressText.textContent = text;
    }

    // Update summary
    updateSummary(type, stats) {
        const summaryContainer = document.getElementById(`${type}Summary`);
        if (summaryContainer) summaryContainer.style.display = 'grid';

        document.getElementById(`${type}TotalTests`).textContent = stats.total;
        document.getElementById(`${type}PassedTests`).textContent = stats.passed;
        document.getElementById(`${type}FailedTests`).textContent = stats.failed;
        document.getElementById(`${type}AvgTime`).textContent = stats.avgTime;
    }

    // Add result to UI
    addResult(type, result) {
        const resultsContainer = document.getElementById(`${type}Results`);
        if (!resultsContainer) return;

        const resultDiv = document.createElement('div');
        resultDiv.className = `result-item ${result.success ? 'success' : 'error'}`;

        resultDiv.innerHTML = `
            <div class="result-header">
                <div class="result-title">${result.title}</div>
                <div class="result-status">${result.success ? '✅' : '❌'}</div>
            </div>
            <div class="result-details">${result.details}</div>
            ${result.duration ? `<div class="result-time">응답 시간: ${result.duration}</div>` : ''}
        `;

        resultsContainer.appendChild(resultDiv);
    }

    // Clear results
    clearResults(type) {
        const resultsContainer = document.getElementById(`${type}Results`);
        if (resultsContainer) resultsContainer.innerHTML = '';
    }

    // === LLM Tests ===
    async runLLMTests(models) {
        if (!this.config.geminiApiKey) {
            const apiKey = prompt('Google Gemini API 키를 입력하세요:');
            if (!apiKey) {
                alert('API 키가 필요합니다.');
                return;
            }
            this.config.geminiApiKey = apiKey;
            localStorage.setItem('GOOGLE_API_KEY', apiKey);
        }

        this.clearResults('llm');
        this.llmResults = [];
        this.showLoading('LLM 테스트 실행 중...');

        const tests = [
            { name: 'basic_connection', title: '기본 연결 테스트', prompt: 'Hello! Respond with "Connection successful" in Korean.' },
            { name: 'korean_response', title: '한국어 응답 테스트', prompt: '약물감시(Pharmacovigilance)란 무엇인가요? 한국어로 2-3문장으로 설명해주세요.' },
            { name: 'json_mode', title: 'JSON 모드 테스트', prompt: '{"product_name": "코미나티주", "ingredient": "토지나메란"}을 JSON으로 반환해주세요.', config: { responseMimeType: 'application/json' } }
        ];

        let totalTests = models.length * tests.length;
        let currentTest = 0;

        for (const model of models) {
            for (const test of tests) {
                currentTest++;
                this.updateProgress('llm', currentTest, totalTests, `${model} - ${test.title}`);

                const result = await this.runSingleLLMTest(model, test);
                this.llmResults.push(result);
                this.addResult('llm', result);

                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        this.hideLoading();
        this.updateLLMSummary();
    }

    async runSingleLLMTest(modelName, test) {
        const startTime = Date.now();

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.config.geminiApiKey}`;

            const requestBody = {
                contents: [{
                    parts: [{
                        text: test.prompt
                    }]
                }]
            };

            if (test.config) {
                requestBody.generationConfig = test.config;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const error = await response.text();
                return {
                    title: `${modelName} - ${test.title}`,
                    success: false,
                    details: `HTTP ${response.status}: ${error.substring(0, 100)}`,
                    duration: `${duration}ms`,
                    modelName,
                    testName: test.name
                };
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                title: `${modelName} - ${test.title}`,
                success: true,
                details: `응답: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
                duration: `${duration}ms`,
                modelName,
                testName: test.name,
                responseText: text,
                durationMs: duration
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                title: `${modelName} - ${test.title}`,
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`,
                modelName,
                testName: test.name
            };
        }
    }

    updateLLMSummary() {
        const total = this.llmResults.length;
        const passed = this.llmResults.filter(r => r.success).length;
        const failed = total - passed;
        const avgTime = total > 0
            ? Math.round(this.llmResults.reduce((sum, r) => sum + (r.durationMs || 0), 0) / total)
            : 0;

        this.updateSummary('llm', {
            total,
            passed,
            failed,
            avgTime: `${avgTime}ms`
        });
    }

    // === Database Tests ===
    async runDBTests() {
        if (!this.supabaseClient) {
            alert('Supabase 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        this.clearResults('db');
        this.dbResults = [];
        this.showLoading('데이터베이스 테스트 실행 중...');

        const tests = [
            { name: 'connection', title: '기본 연결 테스트', fn: () => this.testDBConnection() },
            { name: 'auth', title: '인증 테스트', fn: () => this.testDBAuth() },
            { name: 'tables', title: '테이블 구조 테스트', fn: () => this.testDBTables() },
            { name: 'rls', title: 'RLS 테스트', fn: () => this.testDBRLS() },
            { name: 'performance', title: '성능 테스트', fn: () => this.testDBPerformance() }
        ];

        let currentTest = 0;
        for (const test of tests) {
            currentTest++;
            this.updateProgress('db', currentTest, tests.length, test.title);

            const result = await test.fn();
            this.dbResults.push(result);
            this.addResult('db', result);

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.hideLoading();
        this.updateDBSummary();
    }

    async testDBConnection() {
        const startTime = Date.now();
        try {
            const { data, error } = await this.supabaseClient
                .from('system_settings')
                .select('count');

            const duration = Date.now() - startTime;

            if (error) throw error;

            return {
                title: '기본 연결 테스트',
                success: true,
                details: `Supabase 서버에 성공적으로 연결되었습니다.`,
                duration: `${duration}ms`,
                durationMs: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                title: '기본 연결 테스트',
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`
            };
        }
    }

    async testDBAuth() {
        const startTime = Date.now();
        try {
            // Test with test credentials
            const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                email: 'author@kpsur.test',
                password: 'test1234'
            });

            const duration = Date.now() - startTime;

            if (error) throw error;

            // Sign out after test
            await this.supabaseClient.auth.signOut();

            return {
                title: '인증 테스트',
                success: true,
                details: `테스트 계정(author@kpsur.test)으로 로그인 성공`,
                duration: `${duration}ms`,
                durationMs: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                title: '인증 테스트',
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`
            };
        }
    }

    async testDBTables() {
        const startTime = Date.now();
        try {
            const expectedTables = [
                'users',
                'products',
                'reports',
                'source_documents',
                'markdown_documents',
                'extracted_data',
                'report_sections',
                'review_changes',
                'llm_dialogs',
                'file_matching_table',
                'system_settings'
            ];

            let foundTables = 0;
            for (const table of expectedTables) {
                try {
                    await this.supabaseClient.from(table).select('count', { count: 'exact', head: true });
                    foundTables++;
                } catch (error) {
                    // Table not found
                }
            }

            const duration = Date.now() - startTime;

            return {
                title: '테이블 구조 테스트',
                success: foundTables === expectedTables.length,
                details: `${foundTables}/${expectedTables.length}개 테이블 존재 확인`,
                duration: `${duration}ms`,
                durationMs: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                title: '테이블 구조 테스트',
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`
            };
        }
    }

    async testDBRLS() {
        const startTime = Date.now();
        try {
            // Test without auth - should fail or return empty
            const { data: unauthData, error: unauthError } = await this.supabaseClient
                .from('users')
                .select('*');

            const duration = Date.now() - startTime;

            // RLS should block or return empty
            const rlsWorking = (!unauthData || unauthData.length === 0 || unauthError);

            return {
                title: 'RLS (Row Level Security) 테스트',
                success: rlsWorking,
                details: rlsWorking
                    ? 'RLS가 정상적으로 작동하여 비인증 접근 차단'
                    : '경고: RLS가 비인증 접근을 차단하지 못함',
                duration: `${duration}ms`,
                durationMs: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            // If error is due to RLS, that's actually success
            if (error.message.includes('policy') || error.message.includes('permission')) {
                return {
                    title: 'RLS 테스트',
                    success: true,
                    details: 'RLS가 정상적으로 작동하여 비인증 접근 차단',
                    duration: `${duration}ms`,
                    durationMs: duration
                };
            }

            return {
                title: 'RLS 테스트',
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`
            };
        }
    }

    async testDBPerformance() {
        const startTime = Date.now();
        try {
            // Simple query performance test
            const { data, error } = await this.supabaseClient
                .from('system_settings')
                .select('*')
                .limit(10);

            const duration = Date.now() - startTime;

            if (error) throw error;

            const isGood = duration < 500;
            const isAcceptable = duration < 1000;

            return {
                title: '성능 테스트',
                success: isAcceptable,
                details: isGood
                    ? `우수: 응답 시간 ${duration}ms (목표 < 500ms)`
                    : isAcceptable
                    ? `양호: 응답 시간 ${duration}ms (허용 < 1000ms)`
                    : `느림: 응답 시간 ${duration}ms (개선 필요)`,
                duration: `${duration}ms`,
                durationMs: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                title: '성능 테스트',
                success: false,
                details: `오류: ${error.message}`,
                duration: `${duration}ms`
            };
        }
    }

    updateDBSummary() {
        const total = this.dbResults.length;
        const passed = this.dbResults.filter(r => r.success).length;
        const failed = total - passed;
        const avgTime = total > 0
            ? Math.round(this.dbResults.reduce((sum, r) => sum + (r.durationMs || 0), 0) / total)
            : 0;

        this.updateSummary('db', {
            total,
            passed,
            failed,
            avgTime: `${avgTime}ms`
        });
    }

    // === Export Results ===
    exportResults(type) {
        const results = type === 'llm' ? this.llmResults : this.dbResults;

        if (results.length === 0) {
            alert('내보낼 결과가 없습니다. 먼저 테스트를 실행하세요.');
            return;
        }

        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-test-results-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }
}

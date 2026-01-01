/**
 * Settings Manager
 * Centralized API key management and validation
 */

import { CONFIG, Storage } from './config.js';

class SettingsManager {
    constructor() {
        this.apiKey = null;
    }

    /**
     * Get current API key status
     * @returns {Object} { configured: boolean, masked: string|null, key: string|null }
     */
    getApiKeyStatus() {
        const key = Storage.get(CONFIG.STORAGE_KEYS.GOOGLE_API_KEY);

        if (!key) {
            return {
                configured: false,
                masked: null,
                key: null
            };
        }

        // Mask key: Show first 4 + last 3 characters (e.g., "AIza...XVw")
        const masked = key.length >= 7
            ? `${key.substring(0, 4)}...${key.substring(key.length - 3)}`
            : '***';

        return {
            configured: true,
            masked,
            key
        };
    }

    /**
     * Validate API key format
     * @param {string} apiKey - API key to validate
     * @returns {Object} { valid: boolean, error: string|null }
     */
    validateApiKeyFormat(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                valid: false,
                error: 'API 키를 입력해주세요'
            };
        }

        const trimmedKey = apiKey.trim();

        if (trimmedKey.length < 30) {
            return {
                valid: false,
                error: 'API 키가 너무 짧습니다 (최소 30자)'
            };
        }

        if (!trimmedKey.startsWith('AIza')) {
            return {
                valid: false,
                error: 'Gemini API 키는 "AIza"로 시작해야 합니다'
            };
        }

        return {
            valid: true,
            error: null
        };
    }

    /**
     * Test API key with live connection to Gemini API
     * @param {string} apiKey - API key to test
     * @returns {Promise<Object>} { success: boolean, message: string, details: object|null }
     */
    async testApiKey(apiKey) {
        // Format validation first
        const formatCheck = this.validateApiKeyFormat(apiKey);
        if (!formatCheck.valid) {
            return {
                success: false,
                message: formatCheck.error,
                details: null
            };
        }

        try {
            const url = `${CONFIG.LLM.API_ENDPOINT}/${CONFIG.LLM.DEFAULT_MODEL}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Test connection'
                        }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Verify response structure
                if (data.candidates && data.candidates.length > 0) {
                    return {
                        success: true,
                        message: '✅ 연결 성공! API 키가 정상적으로 작동합니다.',
                        details: {
                            model: CONFIG.LLM.DEFAULT_MODEL,
                            responseTime: data.usageMetadata?.totalTokenCount || null
                        }
                    };
                } else {
                    return {
                        success: false,
                        message: '응답 구조가 올바르지 않습니다',
                        details: data
                    };
                }
            } else if (response.status === 400) {
                const errorData = await response.json().catch(() => null);
                return {
                    success: false,
                    message: '유효하지 않은 API 키입니다',
                    details: errorData
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    message: 'API 키에 권한이 없습니다. Google Cloud Console에서 확인해주세요.',
                    details: null
                };
            } else if (response.status === 429) {
                return {
                    success: false,
                    message: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                    details: null
                };
            } else {
                return {
                    success: false,
                    message: `연결 실패: HTTP ${response.status}`,
                    details: null
                };
            }
        } catch (error) {
            console.error('API key test error:', error);

            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                return {
                    success: false,
                    message: '네트워크 연결을 확인해주세요',
                    details: { error: error.message }
                };
            }

            return {
                success: false,
                message: `오류: ${error.message}`,
                details: { error: error.message }
            };
        }
    }

    /**
     * Save API key to localStorage
     * @param {string} apiKey - API key to save
     * @returns {boolean} Success status
     */
    saveApiKey(apiKey) {
        const trimmedKey = apiKey.trim();

        // Validate before saving
        const validation = this.validateApiKeyFormat(trimmedKey);
        if (!validation.valid) {
            console.error('Cannot save invalid API key:', validation.error);
            return false;
        }

        try {
            Storage.set(CONFIG.STORAGE_KEYS.GOOGLE_API_KEY, trimmedKey);
            this.apiKey = trimmedKey;
            console.log('✅ API key saved to localStorage');
            return true;
        } catch (error) {
            console.error('Failed to save API key:', error);
            return false;
        }
    }

    /**
     * Clear/remove API key from localStorage
     * @returns {boolean} Success status
     */
    clearApiKey() {
        try {
            Storage.remove(CONFIG.STORAGE_KEYS.GOOGLE_API_KEY);
            this.apiKey = null;
            console.log('✅ API key removed from localStorage');
            return true;
        } catch (error) {
            console.error('Failed to clear API key:', error);
            return false;
        }
    }

    /**
     * Get environment information
     * @returns {Object} { mode: string, isProduction: boolean, hostname: string }
     */
    getEnvironmentInfo() {
        const hostname = window.location.hostname;
        const isProduction = hostname.includes('github.io') || hostname.includes('pages.dev');
        const mode = isProduction ? 'Production' : 'Development';

        return {
            mode,
            isProduction,
            hostname: hostname || 'localhost'
        };
    }

    /**
     * Get complete settings state for debugging
     * @returns {Object} Complete settings state
     */
    getDebugInfo() {
        const status = this.getApiKeyStatus();
        const env = this.getEnvironmentInfo();

        return {
            apiKeyConfigured: status.configured,
            apiKeyMasked: status.masked,
            environment: env.mode,
            hostname: env.hostname,
            storageAvailable: typeof localStorage !== 'undefined',
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton instance
const settingsManager = new SettingsManager();

export default settingsManager;

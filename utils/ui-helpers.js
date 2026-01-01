/**
 * ui-helpers.js
 * UI 컴포넌트 유틸리티 (Toast, Loading)
 *
 * 출처: P91_Settings.html에서 추출
 * GitHub Pages 배포용 - 전역 window 객체 사용
 */

// Toast 카운터 (다중 Toast 지원)
let toastCounter = 0;

/**
 * Toast HTML 엘리먼트 생성 (없으면 자동 생성)
 */
function ensureToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        document.body.appendChild(container);
    }
}

/**
 * Toast 알림 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success', 'error', 'warning', 'info' 중 하나
 * @param {number} duration - 표시 시간 (ms, 기본: 5000)
 * @returns {string} Toast ID
 */
function showToast(message, type = 'success', duration = 5000) {
    ensureToastContainer();

    const container = document.getElementById('toast-container');
    const toastId = `toast-${Date.now()}-${toastCounter++}`;

    // Toast 엘리먼트 생성
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 스타일 적용
    Object.assign(toast.style, {
        padding: '16px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        maxWidth: '400px',
        wordBreak: 'break-word',
        animation: 'slideIn 0.3s ease-out',
        cursor: 'pointer'
    });

    // 타입별 색상 (info 포함)
    const colors = {
        success: { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
        error: { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5' },
        warning: { bg: '#FEF3C7', text: '#92400E', border: '#FDE047' },
        info: { bg: '#EBF5FF', text: '#1E40AF', border: '#93C5FD' }
    };

    const color = colors[type] || colors.success;
    Object.assign(toast.style, {
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`
    });

    // 클릭 시 제거
    toast.addEventListener('click', () => {
        hideToast(toastId);
    });

    // Toast 추가
    container.appendChild(toast);

    // 자동 제거
    if (duration > 0) {
        setTimeout(() => {
            hideToast(toastId);
        }, duration);
    }

    return toastId;
}

/**
 * Toast 숨김
 * @param {string} toastId - Toast ID
 */
function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * 모든 Toast 제거
 */
function clearAllToasts() {
    const container = document.getElementById('toast-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * LLM 로딩 오버레이 표시
 * @param {string} message - 로딩 메시지
 */
function showLLMLoading(message = '처리 중...') {
    // 기존 오버레이 제거
    hideLLMLoading();

    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'llm-loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99998;
    `;

    // 로딩 콘텐츠
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    `;

    // 스피너
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #E5E7EB;
        border-top-color: #25739B;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    `;

    // 텍스트
    const text = document.createElement('div');
    text.id = 'llm-loading-text';
    text.textContent = message;
    text.style.cssText = `
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
    `;

    // CSS 애니메이션 추가
    if (!document.getElementById('llm-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'llm-loading-styles';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 조립
    content.appendChild(spinner);
    content.appendChild(text);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

/**
 * LLM 로딩 오버레이 숨김
 */
function hideLLMLoading() {
    const overlay = document.getElementById('llm-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * LLM 로딩 메시지 업데이트
 * @param {string} message - 새 메시지
 */
function updateLLMLoadingMessage(message) {
    const text = document.getElementById('llm-loading-text');
    if (text) {
        text.textContent = message;
    }
}

/**
 * 간단한 로딩 오버레이 표시 (showLoading 별칭)
 * @param {string} message - 로딩 메시지
 */
function showLoading(message = '처리 중...') {
    showLLMLoading(message);
}

/**
 * 간단한 로딩 오버레이 숨김 (hideLoading 별칭)
 */
function hideLoading() {
    hideLLMLoading();
}

// 전역으로 내보내기 (ES6 모듈 대신 window 객체 사용)
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.hideToast = hideToast;
    window.clearAllToasts = clearAllToasts;
    window.showLLMLoading = showLLMLoading;
    window.hideLLMLoading = hideLLMLoading;
    window.updateLLMLoadingMessage = updateLLMLoadingMessage;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
}

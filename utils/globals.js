/**
 * globals.js
 * 모든 유틸리티를 window 객체에 연결
 * 인라인 스크립트에서 사용 가능하게 함
 */

import * as navigation from './navigation.js';
import * as session from './session.js';
import * as uiHelpers from './ui-helpers.js';
import * as layoutHelper from './layout-helper.js';

// Navigation 함수들
window.navigateTo = navigation.navigateTo;
window.getCurrentPage = navigation.getCurrentPage;
window.getUrlParams = navigation.getUrlParams;
window.getUrlParam = navigation.getUrlParam;

// Session 함수들
window.loadSessionData = session.loadSessionData;
window.saveSessionData = session.saveSessionData;
window.clearSessionData = session.clearSessionData;
window.isAuthenticated = session.isAuthenticated;
window.getCurrentUser = session.getCurrentUser;
window.updateSessionData = session.updateSessionData;
window.getDeploymentMode = session.getDeploymentMode;
window.setDeploymentMode = session.setDeploymentMode;

// UI Helper 함수들
window.showToast = uiHelpers.showToast;
window.hideToast = uiHelpers.hideToast;
window.clearAllToasts = uiHelpers.clearAllToasts;
window.showLLMLoading = uiHelpers.showLLMLoading;
window.hideLLMLoading = uiHelpers.hideLLMLoading;
window.updateLLMLoadingMessage = uiHelpers.updateLLMLoadingMessage;
window.showLoading = uiHelpers.showLoading;
window.hideLoading = uiHelpers.hideLoading;

// Layout Helper 함수들
window.setupUserMenu = layoutHelper.setupUserMenu;
window.updateDeploymentMode = layoutHelper.updateDeploymentMode;
window.updateBreadcrumb = layoutHelper.updateBreadcrumb;
window.updateWorkflowProgress = layoutHelper.updateWorkflowProgress;
window.activateWorkflowStage = layoutHelper.activateWorkflowStage;

// 모듈도 export (다른 모듈에서 import 가능)
export {
    navigation,
    session,
    uiHelpers,
    layoutHelper
};

// 로드 완료 플래그
window.__GLOBALS_LOADED__ = true;

console.log('✅ Global utilities loaded successfully');

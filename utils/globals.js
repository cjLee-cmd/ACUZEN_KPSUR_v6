/**
 * globals.js
 * 유틸리티 로드 완료 플래그 설정
 *
 * 각 유틸리티 파일(navigation.js, session.js, ui-helpers.js, layout-helper.js)이
 * 개별적으로 window 객체에 함수를 등록합니다.
 * 이 파일은 모든 유틸리티가 로드된 후 완료 플래그만 설정합니다.
 */

// 로드 완료 플래그 설정
// 이 파일이 마지막에 로드되므로, 모든 유틸리티가 window에 등록된 상태
window.__GLOBALS_LOADED__ = true;

console.log('✅ Global utilities loaded successfully');

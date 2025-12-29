/**
 * KPSUR Theme Configuration
 * 의료용 소프트웨어를 위한 컬러 팔레트 및 테마 설정
 */

export const colors = {
  primary: '#25739B',      // 주요 파란색
  dark: '#07161D',         // 어두운 배경
  accent: '#369EE1',       // 강조 파란색
  secondary: '#122E4E',    // 보조 어두운 파란색
  white: '#FFFFFF',        // 흰색

  // 추가 시스템 컬러
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // 그라데이션
  gradients: {
    primary: 'linear-gradient(135deg, #25739B 0%, #369EE1 100%)',
    dark: 'linear-gradient(135deg, #07161D 0%, #122E4E 100%)',
    accent: 'linear-gradient(135deg, #369EE1 0%, #25739B 100%)',
  },

  // 투명도 변형
  opacity: {
    primary10: 'rgba(37, 115, 155, 0.1)',
    primary20: 'rgba(37, 115, 155, 0.2)',
    primary50: 'rgba(37, 115, 155, 0.5)',
    accent10: 'rgba(54, 158, 225, 0.1)',
    accent20: 'rgba(54, 158, 225, 0.2)',
    dark80: 'rgba(7, 22, 29, 0.8)',
    dark90: 'rgba(7, 22, 29, 0.9)',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(54, 158, 225, 0.3)',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'Monaco, Consolas, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  zIndex,
  breakpoints,
};

export default theme;

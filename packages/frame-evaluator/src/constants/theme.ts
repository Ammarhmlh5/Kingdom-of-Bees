import { ThemeConfig, ColorScheme } from '../types';

/**
 * Default color scheme
 */
export const DEFAULT_COLORS: ColorScheme = {
  honey: {
    light: '#FEF9C3',
    medium: '#FEF08A',
    dark: '#FDE047',
    stroke: '#D97706',
  },
  brood: {
    eggs: '#FFFBEB',
    youngLarvae: '#FEF3C7',
    oldLarvae: '#FDE68A',
    capped: '#D97706',
    mixed: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'],
    stroke: '#92400E',
  },
  beeBread: {
    light: '#FFEDD5',
    medium: '#FED7AA',
    dark: '#FDBA74',
    variations: ['#FDBA74', '#FB923C', '#F97316'],
  },
  empty: '#F5F5DC',
  background: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};

/**
 * Default theme configuration
 */
export const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  colors: DEFAULT_COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

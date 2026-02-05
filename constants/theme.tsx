import { Platform, TextStyle, ViewStyle } from 'react-native';

export const Colors = {
  primary: {
    DEFAULT: '#15803d',
    hover: '#166534',
    light: '#dcfce7',
  },
  danger: {
    DEFAULT: '#dc2626',
    hover: '#b91c1c',
    light: '#fee2e2',
    text: '#991b1b',
  },
  success: {
    DEFAULT: '#059669',
    light: '#dcfce7',
    text: '#166534',
  },
  warning: {
    DEFAULT: '#d97706',
    light: '#fef3c7',
    text: '#92400e',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  white: '#ffffff',
  black: '#000000',

  light: {
    text: '#1f2937',
    background: '#f3f4f6',
    card: '#ffffff',
    tint: '#15803d',
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#15803d',
    border: '#e5e7eb',
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'System', mono: 'Menlo' },
  android: { sans: 'Roboto', mono: 'monospace' },
  default: { sans: 'System', mono: 'monospace' },
});

export const FontSizes = {
  xs: 16,
  sm: 18,
  base: 20,
  lg: 22,
  xl: 24,
  '2xl': 26,
  '3xl': 32,
  '4xl': 48,
};

export const FontWeights: Record<string, TextStyle['fontWeight']> = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
};

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

export const Shadows: Record<string, ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Design System Constants and Tokens
export const BoltColors = {
  // Primary Purple Scale
  primary: {
    50: '#F3F0FF',
    100: '#E9E2FF',
    200: '#D6CAFE',
    300: '#BAA7FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#6B46C1',
    700: '#553C9A',
    800: '#4C1D95',
    900: '#3B0764',
  },

  // Background System
  background: {
    primary: '#0F0F23',
    secondary: '#1A1A2E',
    tertiary: '#252540',
    overlay: 'rgba(26, 26, 46, 0.9)',
  },

  // Border System
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    default: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(107, 70, 193, 0.3)',
    accent: 'rgba(107, 70, 193, 0.6)',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E2E8F0',
    muted: '#94A3B8',
    inverse: '#1E293B',
    accent: '#8B5CF6',
  },

  // Status Colors
  success: {
    light: '#10B981',
    DEFAULT: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#F59E0B',
    DEFAULT: '#D97706',
    dark: '#92400E',
  },
  error: {
    light: '#EF4444',
    DEFAULT: '#DC2626',
    dark: '#B91C1C',
  },
  info: {
    light: '#3B82F6',
    DEFAULT: '#2563EB',
    dark: '#1D4ED8',
  },

  // Glass Effect Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(0, 0, 0, 0.1)',
    purple: 'rgba(107, 70, 193, 0.1)',
  },
};

export const BoltSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BoltSizes = {
  progressRing: {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 100,
  },
  button: {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 16,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: 18,
    },
  },
};

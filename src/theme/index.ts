// Export all theme components
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './types';
export * from './utils';
export * from './ThemeProvider';
export * from './styleUtils';
export * from './responsive';
export * from './useResponsiveLayout';
export * from './animations';

// Re-export for convenience
export { darkColors as defaultColors } from './colors';
export { typography as defaultTypography } from './typography';
export { spacing as defaultSpacing } from './spacing';

// Backward compatibility exports for existing components
// These will be replaced when components are updated in future tasks
import { darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { getShadowStyle, getBorderRadius } from './utils';

// Legacy theme object for backward compatibility
export const theme = {
  colors: {
    primary: darkColors.primary,
    secondary: '#EC4899',
    success: darkColors.status.confirmed,
    warning: darkColors.status.pending,
    error: darkColors.status.error,
    text: darkColors.text.primary,
    background: darkColors.background,
    surface: darkColors.surface,
    grey0: '#111827',
    grey1: '#374151',
    grey2: '#6B7280',
    grey3: '#9CA3AF',
    grey4: '#D1D5DB',
    grey5: '#F3F4F6',
    greyOutline: '#E5E7EB',
    searchBg: '#F3F4F6',
    disabled: '#9CA3AF',
    divider: '#E5E7EB',
    tabBarActive: darkColors.primary,
    tabBarInactive: '#9CA3AF',
    tabBarBackground: darkColors.surface,
  },
};

// Legacy helper functions for backward compatibility
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary') => ({
  borderRadius: getBorderRadius('medium'),
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  minHeight: 48,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: theme.colors[variant],
  ...getShadowStyle(2),
});

export const getCardStyle = (customStyle?: object) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: getBorderRadius('large'),
  padding: spacing.md,
  ...getShadowStyle(3),
  ...customStyle,
});

export const getTextStyle = (variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' = 'body') => ({
  ...typography[variant],
  color: theme.colors.text,
});

// getShadowStyle is already exported from utils
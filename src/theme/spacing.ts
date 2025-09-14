// Spacing scale for consistent layout
export interface Spacing {
  xs: number;    // 4px
  sm: number;    // 8px
  md: number;    // 16px
  lg: number;    // 24px
  xl: number;    // 32px
  xxl: number;   // 48px
}

// Base spacing values
const baseSpacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Get responsive spacing multiplier based on device size
const getSpacingMultiplier = (): number => {
  const { Dimensions } = require('react-native');
  const { width } = Dimensions.get('window');
  
  if (width < 375) {
    return 0.8; // Small phones
  } else if (width >= 768) {
    return 1.2; // Tablets and larger
  }
  return 1; // Standard phones
};

const multiplier = getSpacingMultiplier();

// Responsive spacing that adapts to device size
export const spacing: Spacing = {
  xs: Math.round(baseSpacing.xs * multiplier),
  sm: Math.round(baseSpacing.sm * multiplier),
  md: Math.round(baseSpacing.md * multiplier),
  lg: Math.round(baseSpacing.lg * multiplier),
  xl: Math.round(baseSpacing.xl * multiplier),
  xxl: Math.round(baseSpacing.xxl * multiplier),
};

// Helper functions for consistent spacing
export const getPadding = (size: keyof Spacing) => ({
  padding: spacing[size],
});

export const getMargin = (size: keyof Spacing) => ({
  margin: spacing[size],
});

export const getPaddingHorizontal = (size: keyof Spacing) => ({
  paddingHorizontal: spacing[size],
});

export const getPaddingVertical = (size: keyof Spacing) => ({
  paddingVertical: spacing[size],
});

export const getMarginHorizontal = (size: keyof Spacing) => ({
  marginHorizontal: spacing[size],
});

export const getMarginVertical = (size: keyof Spacing) => ({
  marginVertical: spacing[size],
});
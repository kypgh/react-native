import { ViewStyle, TextStyle } from 'react-native';
import { spacing } from './spacing';
import { typography } from './typography';

// Utility functions for consistent theming across components

/**
 * Get consistent shadow styles for elevation
 */
export const getShadowStyle = (elevation: number = 2): ViewStyle => ({
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: elevation,
  },
  shadowOpacity: 0.1,
  shadowRadius: elevation * 2,
  elevation: elevation,
});

/**
 * Get consistent border radius based on component type
 */
export const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium'): number => {
  const radiusMap = {
    small: 4,
    medium: 8,
    large: 12,
  };
  return radiusMap[size];
};

/**
 * Get color with opacity (hex to rgba conversion)
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Removed getResponsiveFontSize - now available in responsive.ts

/**
 * Combine multiple style objects safely
 */
export const combineStyles = (...styles: any[]): any => {
  return Object.assign({}, ...styles.filter(Boolean));
};

/**
 * Create consistent button styles
 */
export const createButtonStyle = (
  backgroundColor: string,
  textColor: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): { container: ViewStyle; text: TextStyle } => {
  const sizeMap = {
    small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 14 },
    medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 16 },
    large: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: 18 },
  };

  const sizeStyle = sizeMap[size];

  return {
    container: {
      backgroundColor,
      borderRadius: getBorderRadius('medium'),
      paddingVertical: sizeStyle.paddingVertical,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 48,
      ...getShadowStyle(2),
    },
    text: {
      ...typography.button,
      color: textColor,
      fontSize: sizeStyle.fontSize,
    },
  };
};

/**
 * Create consistent card styles
 */
export const createCardStyle = (
  backgroundColor: string,
  padding: keyof typeof spacing = 'md'
): ViewStyle => ({
  backgroundColor,
  borderRadius: getBorderRadius('large'),
  padding: spacing[padding],
  ...getShadowStyle(3),
});
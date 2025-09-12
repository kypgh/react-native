import { theme, spacing, typography, componentStyles } from './index';
import { AppTypography } from './types';

// Utility functions for consistent theming across components

/**
 * Get consistent shadow styles for elevation
 */
export const getShadowStyle = (elevation: number = 2) => ({
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
export const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
  const radiusMap = {
    small: 4,
    medium: 8,
    large: 12,
  };
  return radiusMap[size];
};

/**
 * Get consistent padding based on spacing scale
 */
export const getPadding = (size: keyof typeof spacing) => ({
  padding: spacing[size],
});

/**
 * Get consistent margin based on spacing scale
 */
export const getMargin = (size: keyof typeof spacing) => ({
  margin: spacing[size],
});

/**
 * Get color with opacity
 */
export const getColorWithOpacity = (color: string, opacity: number) => {
  // Simple hex to rgba conversion for basic colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

/**
 * Get responsive font size based on screen size (basic implementation)
 */
export const getResponsiveFontSize = (baseSize: number, scale: number = 1) => {
  return Math.round(baseSize * scale);
};

/**
 * Combine multiple style objects safely
 */
export const combineStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles.filter(Boolean));
};
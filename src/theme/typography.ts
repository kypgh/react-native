import { TextStyle, Dimensions } from 'react-native';

// Typography scale interface
export interface Typography {
  h1: TextStyle;          // Large headings
  h2: TextStyle;          // Section headings
  h3: TextStyle;          // Card titles
  body: TextStyle;        // Regular text
  caption: TextStyle;     // Small text
  button: TextStyle;      // Button text
}

// Get responsive font size based on screen width
const getResponsiveFontSize = (size: number): number => {
  const { width } = Dimensions.get('window');
  const scale = width / 375; // Base on iPhone X width
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  const minSize = size * 0.8;
  const maxSize = size * 1.2;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Base typography sizes
const baseSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  button: 16,
};

// Responsive typography configuration
export const typography: Typography = {
  h1: {
    fontSize: getResponsiveFontSize(baseSizes.h1),
    fontWeight: 'bold',
    lineHeight: getResponsiveFontSize(baseSizes.h1) * 1.25,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: getResponsiveFontSize(baseSizes.h2),
    fontWeight: 'bold',
    lineHeight: getResponsiveFontSize(baseSizes.h2) * 1.33,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: getResponsiveFontSize(baseSizes.h3),
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(baseSizes.h3) * 1.4,
    letterSpacing: 0,
  },
  body: {
    fontSize: getResponsiveFontSize(baseSizes.body),
    fontWeight: 'normal',
    lineHeight: getResponsiveFontSize(baseSizes.body) * 1.5,
    letterSpacing: 0,
  },
  caption: {
    fontSize: getResponsiveFontSize(baseSizes.caption),
    fontWeight: 'normal',
    lineHeight: getResponsiveFontSize(baseSizes.caption) * 1.43,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: getResponsiveFontSize(baseSizes.button),
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(baseSizes.button) * 1.25,
    letterSpacing: 0.5,
  },
};

// Helper function to get typography with color
export const getTypographyWithColor = (variant: keyof Typography, color: string): TextStyle => ({
  ...typography[variant],
  color,
});
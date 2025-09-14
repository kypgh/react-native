import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device breakpoints
export const breakpoints = {
  small: 320,   // Small phones
  medium: 375,  // Standard phones
  large: 414,   // Large phones
  tablet: 768,  // Tablets
  desktop: 1024 // Desktop/large tablets
};

// Device type detection
export const deviceType = {
  isSmallPhone: screenWidth < breakpoints.medium,
  isMediumPhone: screenWidth >= breakpoints.medium && screenWidth < breakpoints.large,
  isLargePhone: screenWidth >= breakpoints.large && screenWidth < breakpoints.tablet,
  isTablet: screenWidth >= breakpoints.tablet && screenWidth < breakpoints.desktop,
  isDesktop: screenWidth >= breakpoints.desktop,
};

// Orientation detection
export const isLandscape = screenWidth > screenHeight;
export const isPortrait = screenHeight > screenWidth;

// Responsive dimensions
export const responsiveDimensions = {
  screenWidth,
  screenHeight,
  isLandscape,
  isPortrait,
  ...deviceType,
};

/**
 * Get responsive width based on percentage of screen width
 */
export const getResponsiveWidth = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

/**
 * Get responsive height based on percentage of screen height
 */
export const getResponsiveHeight = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

/**
 * Scale size based on device pixel ratio for consistent sizing
 */
export const scaleSize = (size: number): number => {
  return size * PixelRatio.getFontScale();
};

/**
 * Get responsive font size based on screen width
 */
export const getResponsiveFontSize = (size: number): number => {
  const scale = screenWidth / 375; // Base on iPhone X width
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  const minSize = size * 0.8;
  const maxSize = size * 1.2;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

/**
 * Get responsive spacing based on device size
 */
export const getResponsiveSpacing = (baseSpacing: number): number => {
  if (deviceType.isSmallPhone) {
    return baseSpacing * 0.8;
  } else if (deviceType.isTablet || deviceType.isDesktop) {
    return baseSpacing * 1.2;
  }
  return baseSpacing;
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (basePadding: number) => {
  const multiplier = deviceType.isSmallPhone ? 0.8 : 
                   deviceType.isTablet ? 1.3 : 
                   deviceType.isDesktop ? 1.5 : 1;
  
  return basePadding * multiplier;
};

/**
 * Get responsive margin based on screen size
 */
export const getResponsiveMargin = (baseMargin: number) => {
  return getResponsiveSpacing(baseMargin);
};

/**
 * Get responsive border radius
 */
export const getResponsiveBorderRadius = (baseRadius: number): number => {
  return deviceType.isTablet || deviceType.isDesktop ? baseRadius * 1.2 : baseRadius;
};

/**
 * Get responsive touch target size (minimum 44px for accessibility)
 */
export const getResponsiveTouchTarget = (baseSize: number = 44): number => {
  const minTouchTarget = 44;
  const scaledSize = getResponsiveSpacing(baseSize);
  return Math.max(minTouchTarget, scaledSize);
};

/**
 * Get responsive grid columns based on screen width
 */
export const getResponsiveColumns = (maxColumns: number = 2): number => {
  if (deviceType.isSmallPhone) {
    return 1;
  } else if (deviceType.isTablet) {
    return Math.min(3, maxColumns);
  } else if (deviceType.isDesktop) {
    return Math.min(4, maxColumns);
  }
  return Math.min(2, maxColumns);
};

/**
 * Get responsive card width for grid layouts
 */
export const getResponsiveCardWidth = (columns: number, spacing: number = 16): number => {
  const totalSpacing = spacing * (columns + 1);
  return (screenWidth - totalSpacing) / columns;
};

/**
 * Responsive layout utilities
 */
export const responsiveLayout = {
  // Container padding based on device size
  containerPadding: getResponsivePadding(16),
  
  // Section spacing
  sectionSpacing: getResponsiveSpacing(24),
  
  // Card spacing in grids
  cardSpacing: getResponsiveSpacing(12),
  
  // Header height
  headerHeight: deviceType.isTablet ? 80 : 60,
  
  // Tab bar height
  tabBarHeight: deviceType.isTablet ? 70 : 60,
  
  // Button height
  buttonHeight: getResponsiveTouchTarget(48),
  
  // Input height
  inputHeight: getResponsiveTouchTarget(44),
};

/**
 * Responsive typography scale
 */
export const responsiveTypography = {
  h1: getResponsiveFontSize(28),
  h2: getResponsiveFontSize(24),
  h3: getResponsiveFontSize(20),
  body: getResponsiveFontSize(16),
  caption: getResponsiveFontSize(14),
  button: getResponsiveFontSize(16),
};

/**
 * Hook to get current screen dimensions (for use with orientation changes)
 */
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return {
    ...dimensions,
    isLandscape: dimensions.width > dimensions.height,
    isPortrait: dimensions.height > dimensions.width,
  };
};

// Import React for the hook
import React from 'react';
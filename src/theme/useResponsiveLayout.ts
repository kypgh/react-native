import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { 
  breakpoints, 
  deviceType as staticDeviceType,
  getResponsiveColumns,
  getResponsiveCardWidth,
  responsiveLayout
} from './responsive';

interface ResponsiveLayoutHook {
  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
  
  // Orientation
  isLandscape: boolean;
  isPortrait: boolean;
  
  // Device type
  deviceType: {
    isSmallPhone: boolean;
    isMediumPhone: boolean;
    isLargePhone: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  
  // Layout utilities
  getColumns: (maxColumns?: number) => number;
  getCardWidth: (columns: number, spacing?: number) => number;
  
  // Responsive values
  containerPadding: number;
  sectionSpacing: number;
  cardSpacing: number;
  headerHeight: number;
  tabBarHeight: number;
  buttonHeight: number;
}

/**
 * Hook for responsive layout that updates on orientation changes
 */
export const useResponsiveLayout = (): ResponsiveLayoutHook => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calculate device type based on current dimensions
  const deviceType = {
    isSmallPhone: dimensions.width < breakpoints.medium,
    isMediumPhone: dimensions.width >= breakpoints.medium && dimensions.width < breakpoints.large,
    isLargePhone: dimensions.width >= breakpoints.large && dimensions.width < breakpoints.tablet,
    isTablet: dimensions.width >= breakpoints.tablet && dimensions.width < breakpoints.desktop,
    isDesktop: dimensions.width >= breakpoints.desktop,
  };

  // Orientation
  const isLandscape = dimensions.width > dimensions.height;
  const isPortrait = dimensions.height > dimensions.width;

  // Layout utilities
  const getColumns = (maxColumns: number = 2) => getResponsiveColumns(maxColumns);
  const getCardWidth = (columns: number, spacing: number = 16) => getResponsiveCardWidth(columns, spacing);

  // Responsive layout values
  const containerPadding = deviceType.isSmallPhone ? 12 : deviceType.isTablet ? 20 : 16;
  const sectionSpacing = deviceType.isSmallPhone ? 20 : deviceType.isTablet ? 32 : 24;
  const cardSpacing = deviceType.isSmallPhone ? 8 : deviceType.isTablet ? 16 : 12;
  const headerHeight = deviceType.isTablet ? 80 : 60;
  const tabBarHeight = deviceType.isTablet ? 70 : 60;
  const buttonHeight = Math.max(44, deviceType.isTablet ? 52 : 48);

  return {
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    isLandscape,
    isPortrait,
    deviceType,
    getColumns,
    getCardWidth,
    containerPadding,
    sectionSpacing,
    cardSpacing,
    headerHeight,
    tabBarHeight,
    buttonHeight,
  };
};

/**
 * Hook for responsive grid layout
 */
export const useResponsiveGrid = (maxColumns: number = 2, spacing: number = 16) => {
  const { getColumns, getCardWidth, screenWidth } = useResponsiveLayout();
  
  const columns = getColumns(maxColumns);
  const cardWidth = getCardWidth(columns, spacing);
  
  return {
    columns,
    cardWidth,
    itemStyle: {
      width: cardWidth,
      marginHorizontal: spacing / 2,
      marginBottom: spacing,
    },
    containerStyle: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      marginHorizontal: -spacing / 2,
    },
  };
};

/**
 * Hook for responsive typography scaling
 */
export const useResponsiveTypography = () => {
  const { deviceType } = useResponsiveLayout();
  
  const getScaledFontSize = (baseSize: number): number => {
    if (deviceType.isSmallPhone) {
      return baseSize * 0.9;
    } else if (deviceType.isTablet) {
      return baseSize * 1.1;
    } else if (deviceType.isDesktop) {
      return baseSize * 1.2;
    }
    return baseSize;
  };

  return {
    getScaledFontSize,
    scale: deviceType.isSmallPhone ? 0.9 : 
           deviceType.isTablet ? 1.1 : 
           deviceType.isDesktop ? 1.2 : 1,
  };
};
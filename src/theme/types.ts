import { TextStyle, ViewStyle } from 'react-native';

// Theme interface for type safety
export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    text: string;
    background: string;
    surface: string;
    grey0: string;
    grey1: string;
    grey2: string;
    grey3: string;
    grey4: string;
    grey5: string;
    greyOutline: string;
    searchBg: string;
    disabled: string;
    divider: string;
    platform: {
      ios: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
      };
      android: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
      };
    };
  };
}

// Spacing interface
export interface AppSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

// Typography interface
export interface AppTypography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
}

// Component styles interface
export interface ComponentStyles {
  card: ViewStyle;
  button: ViewStyle;
  input: ViewStyle;
  header: ViewStyle;
}
import { TextStyle, ViewStyle } from 'react-native';

// Color palette interface for fitness app
export interface ColorPalette {
  primary: string;        // Purple #8B5CF6
  background: string;     // Dark navy #1E293B
  surface: string;        // Card background #334155
  text: {
    primary: string;      // White #FFFFFF
    secondary: string;    // Light gray #94A3B8
    muted: string;        // Darker gray #64748B
  };
  status: {
    pending: string;      // Yellow #F59E0B
    confirmed: string;    // Green #10B981
    completed: string;    // Blue #3B82F6
    error: string;        // Red #EF4444
  };
}

// Theme mode type
export type ThemeMode = 'light' | 'dark';

// Navigation theme configuration interface
export interface NavigationThemeConfig {
  tabBarStyle: {
    backgroundColor: string;
    borderTopColor: string;
  };
  headerStyle: {
    backgroundColor: string;
    borderBottomColor: string;
  };
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  headerTintColor: string;
}

// Complete theme interface
export interface AppTheme {
  mode: ThemeMode;
  colors: ColorPalette;
  navigation: NavigationThemeConfig;
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
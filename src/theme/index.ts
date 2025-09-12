import { AppSpacing, AppTypography, ComponentStyles } from './types';

// Define comprehensive theme object with colors, spacing, and typography
export const theme = {
  colors: {
    primary: '#6366F1', // Modern indigo for primary actions
    secondary: '#EC4899', // Pink accent for secondary actions
    success: '#10B981', // Green for success states
    warning: '#F59E0B', // Amber for warnings
    error: '#EF4444', // Red for errors
    text: '#1F2937', // Dark gray for text
    background: '#FFFFFF', // White background
    surface: '#F9FAFB', // Light gray surface
    grey0: '#111827', // Very dark gray
    grey1: '#374151', // Dark gray
    grey2: '#6B7280', // Medium gray
    grey3: '#9CA3AF', // Light gray
    grey4: '#D1D5DB', // Very light gray
    grey5: '#F3F4F6', // Almost white gray
    greyOutline: '#E5E7EB', // Border gray
    searchBg: '#F3F4F6', // Search background
    disabled: '#9CA3AF', // Disabled state
    divider: '#E5E7EB', // Divider color
    tabBarActive: '#6366F1', // Active tab color
    tabBarInactive: '#9CA3AF', // Inactive tab color
    tabBarBackground: '#FFFFFF', // Tab bar background
    platform: {
      ios: {
        primary: '#6366F1',
        secondary: '#EC4899',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      android: {
        primary: '#6366F1',
        secondary: '#EC4899',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  },
  Text: {
    style: {
      fontFamily: 'System',
      color: '#212121',
    },
    h1Style: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: '#212121',
      lineHeight: 40,
    },
    h2Style: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#212121',
      lineHeight: 32,
    },
    h3Style: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#212121',
      lineHeight: 28,
    },
    h4Style: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#212121',
      lineHeight: 24,
    },
  },
  Button: {
    titleStyle: {
      fontWeight: '600' as const,
      fontSize: 16,
    },
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minHeight: 48,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginVertical: 8,
      marginHorizontal: 16,
      backgroundColor: '#FFFFFF',
    },
  },
  Header: {
    backgroundColor: '#2196F3',
    centerComponent: {
      style: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600' as const,
      },
    },
  },
  Input: {
    containerStyle: {
      paddingHorizontal: 0,
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: '#bdc6cf',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#F5F5F5',
    },
    inputStyle: {
      fontSize: 16,
      color: '#212121',
    },
    labelStyle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#5e6977',
      marginBottom: 8,
    },
  },
};

// Spacing constants for consistent layout
export const spacing: AppSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography styles with proper typing
export const typography: AppTypography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    color: '#212121',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    color: '#212121',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#212121',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    color: '#212121',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    color: '#666',
  },
};

// Component styles for consistent styling across the app
export const componentStyles: ComponentStyles = {
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc6cf',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};

// Helper functions for consistent styling
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary') => ({
  ...componentStyles.button,
  backgroundColor: theme.colors[variant],
});

export const getCardStyle = (customStyle?: object) => ({
  ...componentStyles.card,
  ...customStyle,
});

export const getTextStyle = (variant: keyof AppTypography = 'body') => typography[variant];

// Export theme utilities
export * from './utils';
export * from './types';

// Default export for the complete theme object
export default {
  theme,
  spacing,
  typography,
  componentStyles,
};
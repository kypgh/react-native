import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, ThemeMode, NavigationThemeConfig } from './types';
import { darkColors, lightColors } from './colors';

// Theme context interface
interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme storage key
const THEME_STORAGE_KEY = '@fitness_app_theme';

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

// Create navigation theme configuration based on mode
const createNavigationTheme = (mode: ThemeMode): NavigationThemeConfig => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  
  return {
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: mode === 'dark' ? '#475569' : '#E2E8F0',
    },
    headerStyle: {
      backgroundColor: colors.background,
      borderBottomColor: mode === 'dark' ? '#475569' : '#E2E8F0',
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.text.muted,
    headerTintColor: colors.text.primary,
  };
};

// Create theme object based on mode
const createTheme = (mode: ThemeMode): AppTheme => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  navigation: createNavigationTheme(mode),
});

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'dark' // Default to dark theme for fitness app
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on app start
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Save theme to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveThemeToStorage(themeMode);
    }
  }, [themeMode, isLoading]);

  const loadThemeFromStorage = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemeToStorage = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const theme = createTheme(themeMode);

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
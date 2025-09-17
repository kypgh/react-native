import React from 'react';
import { ThemeProvider as RNEThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/contexts/AuthContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import { LoadingProvider } from './src/contexts/LoadingContext';
import { BrandProvider } from './src/contexts/BrandContext';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorProvider>
            <LoadingProvider>
              <BrandProvider>
                <RNEThemeProvider theme={theme}>
                  <ErrorBoundary>
                    <AppNavigator />
                  </ErrorBoundary>
                </RNEThemeProvider>
              </BrandProvider>
            </LoadingProvider>
          </ErrorProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

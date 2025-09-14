import React from 'react';
import { ThemeProvider as RNEThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RNEThemeProvider theme={theme}>
          <ErrorBoundary>
            <AppNavigator />
          </ErrorBoundary>
        </RNEThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

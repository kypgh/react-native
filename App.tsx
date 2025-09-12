import React from 'react';
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

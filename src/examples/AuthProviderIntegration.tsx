import React from 'react';
import { View, Text, Button } from 'react-native';
import { ThemeProvider as RNEThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AppNavigator } from '../navigation';
import { ErrorBoundary } from '../components';
import { AuthProvider, useAuthContext } from '../contexts/AuthContext';

/**
 * Example of how to integrate the AuthProvider into your App.tsx
 * 
 * To use this:
 * 1. Replace your current App.tsx content with this structure
 * 2. The AuthProvider should wrap your navigation to provide auth state globally
 * 3. All screens will have access to authentication state via useAuthContext or useAuth
 */
export default function AppWithAuth() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RNEThemeProvider theme={theme}>
          <ErrorBoundary>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </ErrorBoundary>
        </RNEThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Example of using authentication in a screen component
 */
export const ExampleScreenWithAuth: React.FC = () => {
  const { user, isAuthenticated, login, logout, error, clearError } = useAuthContext();

  const handleLogin = async () => {
    const success = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (success) {
      console.log('Login successful!');
    } else {
      console.log('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('Logged out successfully');
  };

  if (!isAuthenticated) {
    return (
      <View>
        <Text>Please log in</Text>
        <Button title="Login" onPress={handleLogin} />
        {error && (
          <View>
            <Text style={{ color: 'red' }}>{error}</Text>
            <Button title="Clear Error" onPress={clearError} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user?.firstName}!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};
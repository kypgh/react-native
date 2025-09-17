import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useBrand } from '../contexts/BrandContext';
import AuthManager from '../services/auth/authManager';
import { LoadingOverlay } from '../components/common';
import LoginScreen from '../screens/LoginScreen';
import BrandSelectionScreen from '../screens/BrandSelectionScreen';
import AppNavigator from './AppNavigator';
import { Brand } from '../types/api';

type AuthState = 'loading' | 'login' | 'brand-selection' | 'authenticated';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const { selectedBrand, setSelectedBrand } = useBrand();

  useEffect(() => {
    checkAuthStatus();
  }, [selectedBrand]);

  const checkAuthStatus = async () => {
    try {
      const authManager = AuthManager.getInstance();
      
      const isAuthenticated = await authManager.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('🔐 → Login (no auth)');
        setAuthState('login');
      } else if (!selectedBrand) {
        console.log('🏢 → Brand selection');
        setAuthState('brand-selection');
      } else {
        console.log('✅ → Main app');
        setAuthState('authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      // Clear tokens on error to prevent loops
      const authManager = AuthManager.getInstance();
      await authManager.clearTokens();
      setAuthState('login');
    }
  };

  const handleLoginSuccess = () => {
    setAuthState('brand-selection');
  };

  const handleBrandSelected = (brand: Brand) => {
    setSelectedBrand(brand);
    setAuthState('authenticated');
  };

  const handleLogout = async () => {
    try {
      const authManager = AuthManager.getInstance();
      await authManager.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setSelectedBrand(null);
    setAuthState('login');
  };

  if (authState === 'loading') {
    return <LoadingOverlay visible={true} message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState === 'login' ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        ) : authState === 'brand-selection' ? (
          <Stack.Screen name="BrandSelection">
            {() => (
              <BrandSelectionScreen
                onBrandSelected={handleBrandSelected}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {() => <AppNavigator />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
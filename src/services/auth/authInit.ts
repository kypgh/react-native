import AuthManager from './authManager';
import AuthService from './authService';
import { httpClient } from '../apiConfig';

/**
 * Initialize the authentication system
 * Call this once when the app starts
 */
export const initializeAuth = async (): Promise<boolean> => {
  try {
    const authManager = AuthManager.getInstance();
    const authService = AuthService.getInstance();
    
    // Check if user has valid tokens
    const isAuthenticated = await authManager.isAuthenticated();
    
    if (isAuthenticated) {
      // Get the current access token and set it in HTTP client
      const token = await authManager.getAccessToken();
      if (token) {
        httpClient.setAuthToken(token);
      }
      
      // Try to fetch user profile
      await authService.fetchUserProfile();
      
      if (__DEV__) {
        console.log('✅ Auth initialized - User is authenticated');
      }
      
      return true;
    } else {
      if (__DEV__) {
        console.log('ℹ️ Auth initialized - User is not authenticated');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize auth:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 * Call this when user logs out or on auth errors
 */
export const clearAuth = async (): Promise<void> => {
  try {
    const authManager = AuthManager.getInstance();
    await authManager.clearTokens();
    httpClient.clearAuthToken();
    
    if (__DEV__) {
      console.log('✅ Auth cleared');
    }
  } catch (error) {
    console.error('❌ Failed to clear auth:', error);
  }
};
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/api';
import AuthService from '../services/auth/authService';
import { AuthManagerEvents } from '../types/auth';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  getAccessToken: () => Promise<string | null>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.initialize();
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err);
      setError('Failed to initialize authentication');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup event listeners
  useEffect(() => {
    const handleTokenRefreshed = () => {
      // Token was refreshed successfully, no action needed
      if (__DEV__) {
        console.log('🔄 Token refreshed in AuthContext');
      }
    };

    const handleTokenExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError('Your session has expired. Please log in again.');
    };

    const handleAuthFailed = (data: { error: string }) => {
      setUser(null);
      setIsAuthenticated(false);
      setError(data.error);
    };

    const handleTokensCleared = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    // Add event listeners
    authService.addEventListener(AuthManagerEvents.TOKEN_REFRESHED, handleTokenRefreshed);
    authService.addEventListener(AuthManagerEvents.TOKEN_EXPIRED, handleTokenExpired);
    authService.addEventListener(AuthManagerEvents.AUTHENTICATION_FAILED, handleAuthFailed);
    authService.addEventListener(AuthManagerEvents.TOKENS_CLEARED, handleTokensCleared);

    // Initialize auth state
    initializeAuth();

    // Cleanup event listeners
    return () => {
      authService.removeEventListener(AuthManagerEvents.TOKEN_REFRESHED, handleTokenRefreshed);
      authService.removeEventListener(AuthManagerEvents.TOKEN_EXPIRED, handleTokenExpired);
      authService.removeEventListener(AuthManagerEvents.AUTHENTICATION_FAILED, handleAuthFailed);
      authService.removeEventListener(AuthManagerEvents.TOKENS_CLEARED, handleTokensCleared);
    };
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.error?.message || 'Login failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.error?.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError('Failed to refresh authentication');
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Get access token function
  const getAccessToken = async (): Promise<string | null> => {
    try {
      return await authService.getAccessToken();
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  };

  // Check auth status function
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      
      return isAuth;
    } catch (err) {
      console.error('Failed to check auth status:', err);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,

    // Utilities
    getAccessToken,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
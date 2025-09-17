import { useAuthContext } from '../contexts/AuthContext';
import { User, LoginCredentials, RegisterData } from '../types/api';

interface UseAuthReturn {
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

/**
 * Custom hook for authentication management
 * Provides easy access to authentication state and actions from AuthContext
 * 
 * @deprecated Consider using useAuthContext directly for better type safety
 */
export const useAuth = (): UseAuthReturn => {
  const authContext = useAuthContext();
  
  return {
    // State
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,

    // Actions
    login: authContext.login,
    register: authContext.register,
    logout: authContext.logout,
    refreshToken: authContext.refreshToken,
    clearError: authContext.clearError,

    // Utilities
    getAccessToken: authContext.getAccessToken,
    checkAuthStatus: authContext.checkAuthStatus,
  };
};
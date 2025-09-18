import * as SecureStore from 'expo-secure-store';
import { 
  AuthTokens, 
  TokenStorage, 
  IAuthManager, 
  SecureStorageConfig,
  TokenRefreshResponse,
  AuthManagerEvents,
  AuthManagerEventData
} from '../../types/auth';
import { ApiResponse, ApiError, ApiErrorType } from '../../types/api';
import { httpClient } from '../apiConfig';
import { API_ENDPOINTS } from '../apiConfig';

// Event emitter for auth events
type EventListener<T = any> = (data: T) => void;

class AuthManager implements IAuthManager {
  private static instance: AuthManager;
  private storageConfig: SecureStorageConfig;
  private eventListeners: Map<AuthManagerEvents, EventListener[]> = new Map();
  private refreshPromise: Promise<string | null> | null = null;
  private lastRefreshAttempt: number = 0;
  private consecutiveRefreshFailures: number = 0;
  private readonly STORAGE_KEY = 'BookingAppAuth_tokens';
  private readonly REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts
  private readonly MAX_CONSECUTIVE_FAILURES = 3; // Max failures before circuit breaker

  private constructor() {
    this.storageConfig = {
      service: 'BookingAppAuth',
      touchID: false, // Can be enabled for biometric auth
      showModal: false,
      kLocalizedFallbackTitle: 'Please enter your passcode',
    };
    
    // Initialize event listeners map
    Object.values(AuthManagerEvents).forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Helper method to get stored token data
  private async getStoredTokenData(): Promise<TokenStorage | null> {
    try {
      const storedData = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (!storedData) {
        return null;
      }
      return JSON.parse(storedData) as TokenStorage;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get stored tokens:', error);
      }
      return null;
    }
  }

  // Event management
  public addEventListener<T extends AuthManagerEvents>(
    event: T, 
    listener: EventListener<AuthManagerEventData[T]>
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  public removeEventListener<T extends AuthManagerEvents>(
    event: T, 
    listener: EventListener<AuthManagerEventData[T]>
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emitEvent<T extends AuthManagerEvents>(
    event: T, 
    data: AuthManagerEventData[T]
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in auth event listener for ${event}:`, error);
      }
    });
  }

  // Token storage methods
  public async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      console.log('💾 Storing tokens...', { expiresIn: tokens.expiresIn });
      
      // Handle both date string and seconds format
      let expiresAt: number;
      if (typeof tokens.expiresIn === 'string') {
        // If expiresIn is a date string, parse it directly
        expiresAt = new Date(tokens.expiresIn).getTime();
      } else {
        // If expiresIn is seconds, add to current time
        expiresAt = Date.now() + (tokens.expiresIn * 1000);
      }
      
      const tokenStorage: TokenStorage = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
        tokenType: tokens.tokenType || 'Bearer',
      };

      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(tokenStorage)
      );

      // Update HTTP client with new token
      httpClient.setAuthToken(tokens.accessToken);

      console.log('✅ Tokens stored to secure storage and HTTP client');
      
      // Verify storage immediately
      const stored = await this.getStoredTokenData();
      console.log('🔍 Verification - tokens in storage:', !!stored);
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  public async getAccessToken(skipRefresh: boolean = false): Promise<string | null> {
    try {
      const tokenStorage = await this.getStoredTokenData();
      
      if (!tokenStorage) {
        console.log('❌ No token storage found');
        return null;
      }
      
      // If skipRefresh is true, return token even if expired (used during refresh)
      if (skipRefresh) {
        return tokenStorage.accessToken;
      }
      
      // Check if token is expired (with 5 minute buffer)
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      const now = Date.now();
      
      if (now >= (tokenStorage.expiresAt - bufferTime)) {
        // Check cooldown to prevent rapid refresh attempts
        if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
          console.log('🔄 Refresh cooldown active, returning current token');
          return tokenStorage.accessToken;
        }
        
        // Circuit breaker: if too many consecutive failures, clear tokens
        if (this.consecutiveRefreshFailures >= this.MAX_CONSECUTIVE_FAILURES) {
          console.log('🚨 Too many consecutive refresh failures, clearing tokens');
          await this.clearTokens();
          return null;
        }
        
        console.log('🔄 Token expired or expiring soon, refreshing...');
        this.lastRefreshAttempt = now;
        return await this.refreshAccessToken();
      }

      return tokenStorage.accessToken;
    } catch (error) {
      console.error('❌ Get token error:', error);
      return null;
    }
  }

  public async getRefreshToken(): Promise<string | null> {
    try {
      const tokenStorage = await this.getStoredTokenData();
      
      if (!tokenStorage) {
        return null;
      }

      return tokenStorage.refreshToken;
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  public async clearTokens(): Promise<void> {
    try {
      console.log('🗑️ CLEARING TOKENS - Called from:', new Error().stack?.split('\n')[2]);
      await SecureStore.deleteItemAsync(this.STORAGE_KEY);
      httpClient.clearAuthToken();
      
      this.emitEvent(AuthManagerEvents.TOKENS_CLEARED, {});
      
      if (__DEV__) {
        console.log('✅ Tokens cleared successfully');
      }
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  // Token validation methods
  public async isTokenValid(): Promise<boolean> {
    try {
      const tokenStorage = await this.getStoredTokenData();
      
      if (!tokenStorage) {
        return false;
      }
      
      // Check if token exists and is not expired
      return !!(tokenStorage.accessToken && Date.now() < tokenStorage.expiresAt);
    } catch (error) {
      console.error('❌ Failed to validate token:', error);
      return false;
    }
  }

  public async isTokenExpired(): Promise<boolean> {
    try {
      const tokenStorage = await this.getStoredTokenData();
      
      if (!tokenStorage) {
        return true;
      }

      return Date.now() >= tokenStorage.expiresAt;
    } catch (error) {
      console.error('❌ Failed to check token expiry:', error);
      return true;
    }
  }

  // Token refresh with retry mechanism
  public async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      console.log('🔄 Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    console.log('🔄 Starting token refresh...');
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      console.log('🔄 Token refresh completed:', !!result);
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const refreshToken = await this.getRefreshToken();
        
        if (!refreshToken) {
          this.emitEvent(AuthManagerEvents.AUTHENTICATION_FAILED, { 
            error: 'No refresh token available' 
          });
          return null;
        }

        // Use AuthService for refresh to handle response structure properly
        const authService = (await import('../api/authService')).default;
        const response = await authService.refreshToken();

        if (!response.success) {
          throw new Error(response.error?.message || 'Token refresh failed');
        }

        // AuthService stores the tokens, get the new access token
        const tokenStorage = await this.getStoredTokenData();
        
        if (!tokenStorage?.accessToken) {
          throw new Error('Failed to get new access token after refresh');
        }
        
        console.log('✅ Token refresh successful - new access token stored');
        
        // Reset failure counter on success
        this.consecutiveRefreshFailures = 0;
        
        this.emitEvent(AuthManagerEvents.TOKEN_REFRESHED, { 
          accessToken: tokenStorage.accessToken 
        });

        if (__DEV__) {
          console.log('✅ Token refreshed successfully');
        }
        
        return tokenStorage.accessToken;

      } catch (error) {
        retryCount++;
        this.consecutiveRefreshFailures++;
        
        if (__DEV__) {
          console.error(`❌ Token refresh attempt ${retryCount} failed:`, error);
        }

        if (retryCount >= maxRetries) {
          // Clear tokens on final failure
          await this.clearTokens();
          
          this.emitEvent(AuthManagerEvents.TOKEN_EXPIRED, { 
            reason: 'Token refresh failed after maximum retries' 
          });
          
          return null;
        }

        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }

  // Authentication state
  public async isAuthenticated(): Promise<boolean> {
    try {
      const tokenStorage = await this.getStoredTokenData();
      
      if (!tokenStorage) {
        console.log('❌ No tokens found');
        return false;
      }
      
      // Check if we have tokens and they're not completely expired
      // Don't trigger refresh here to avoid infinite loops during auth checks
      const hasValidTokens = tokenStorage.accessToken && tokenStorage.refreshToken;
      const isNotCompletelyExpired = Date.now() < tokenStorage.expiresAt + (60 * 60 * 1000); // 1 hour grace period
      
      const isAuth = hasValidTokens && isNotCompletelyExpired;
      
      if (isAuth) {
        console.log('✅ Authentication valid');
      } else {
        console.log('❌ Auth failed - no valid tokens or completely expired');
      }
      
      return isAuth;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return false;
    }
  }

  // Utility methods
  public async getTokenInfo(): Promise<TokenStorage | null> {
    try {
      return await this.getStoredTokenData();
    } catch (error) {
      console.error('❌ Failed to get token info:', error);
      return null;
    }
  }

  public async getTimeUntilExpiry(): Promise<number | null> {
    try {
      const tokenInfo = await this.getTokenInfo();
      
      if (!tokenInfo) {
        return null;
      }

      const timeUntilExpiry = tokenInfo.expiresAt - Date.now();
      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      console.error('❌ Failed to get time until expiry:', error);
      return null;
    }
  }

  // Configure secure storage settings
  public updateStorageConfig(config: Partial<SecureStorageConfig>): void {
    this.storageConfig = { ...this.storageConfig, ...config };
  }
}

export default AuthManager;
import { BaseService } from '../baseService';
import AuthManager from '../auth/authManager';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  UserProfile,
} from '../../types/api';

/**
 * Authentication Service for login, registration, and token management
 */
export class AuthService extends BaseService {
  private readonly basePath = '/auth/client';
  private authManager = AuthManager.getInstance();

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const loginData: LoginRequest = {
      email: email.toLowerCase().trim(),
      password,
    };

    const response = await this.post<LoginResponse>(
      `${this.basePath}/login`,
      loginData,
      'AuthService.login'
    );

    // Store tokens if login successful
    console.log('🔍 Login response:', { 
      success: response.success, 
      hasData: !!response.data,
      hasTokens: !!response.data?.tokens,
      hasNestedTokens: !!response.data?.data?.tokens,
      dataKeys: response.data ? Object.keys(response.data) : 'no data'
    });
    
    let tokens = null;
    
    // Try different possible token locations
    if (response.success) {
      if (response.data?.tokens) {
        tokens = response.data.tokens;
        console.log('📍 Found tokens at data.tokens');
      } else if (response.data?.data?.tokens) {
        tokens = response.data.data.tokens;
        console.log('📍 Found tokens at data.data.tokens');
      }
      
      if (tokens) {
        await this.authManager.storeTokens(tokens);
        console.log('✅ Login successful, tokens stored');
      } else {
        console.log('❌ No tokens found in login response');
      }
    }

    return response;
  }

  /**
   * Register new user account
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.post<RegisterResponse>(
      `${this.basePath}/register`,
      userData,
      'AuthService.register'
    );

    // Store tokens if registration successful
    if (response.success && response.data.tokens) {
      await this.authManager.storeTokens(response.data.tokens);
      console.log('✅ Registration successful, tokens stored');
    }

    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = await this.authManager.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        data: {} as RefreshTokenResponse,
        error: {
          type: 'AUTHENTICATION_ERROR' as any,
          message: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN',
        },
      };
    }

    const response = await this.post<RefreshTokenResponse>(
      `${this.basePath}/refresh`,
      { refreshToken },
      'AuthService.refreshToken'
    );

    // Store new tokens if refresh successful
    console.log('🔍 Refresh response:', { 
      success: response.success, 
      hasTokens: !!response.data?.tokens,
      hasNestedTokens: !!response.data?.data?.tokens,
      dataKeys: response.data ? Object.keys(response.data) : 'no data'
    });
    
    let tokens = null;
    
    if (response.success) {
      if (response.data?.tokens) {
        tokens = response.data.tokens;
        console.log('📍 Found refresh tokens at data.tokens');
      } else if (response.data?.data?.tokens) {
        tokens = response.data.data.tokens;
        console.log('📍 Found refresh tokens at data.data.tokens');
      }
      
      if (tokens) {
        await this.authManager.storeTokens(tokens);
        console.log('✅ Token refresh successful');
      } else {
        console.log('❌ No tokens found in refresh response');
      }
    }

    return response;
  }

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    try {
      // Try to call logout endpoint (optional - server cleanup)
      await this.post(
        `${this.basePath}/logout`,
        {},
        'AuthService.logout'
      );
    } catch (error) {
      // Ignore logout endpoint errors - still clear local tokens
      console.log('⚠️ Logout endpoint error (continuing with local cleanup):', error);
    } finally {
      // Always clear local tokens
      await this.authManager.clearTokens();
      console.log('✅ Logout completed, tokens cleared');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.get<UserProfile>(
      `${this.basePath}/profile`,
      'AuthService.getProfile'
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.put<UserProfile>(
      `${this.basePath}/profile`,
      profileData,
      'AuthService.updateProfile'
    );
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.authManager.isAuthenticated();
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    return this.authManager.getAccessToken();
  }

  /**
   * Force token refresh
   */
  async forceTokenRefresh(): Promise<string | null> {
    return this.authManager.refreshAccessToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
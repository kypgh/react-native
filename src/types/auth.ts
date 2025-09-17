// Authentication token interfaces
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until expiry
  tokenType?: string;
}

// Token storage interface
export interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp when token expires
  tokenType: string;
}

// Auth manager interface
export interface IAuthManager {
  // Token management
  storeTokens(tokens: AuthTokens): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  clearTokens(): Promise<void>;
  
  // Token validation
  isTokenValid(): Promise<boolean>;
  isTokenExpired(): Promise<boolean>;
  
  // Token refresh
  refreshAccessToken(): Promise<string | null>;
  
  // Authentication state
  isAuthenticated(): Promise<boolean>;
}

// Secure storage configuration
export interface SecureStorageConfig {
  service: string;
  touchID?: boolean;
  showModal?: boolean;
  kLocalizedFallbackTitle?: string;
}

// Token refresh response
export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType?: string;
}

// Auth manager events
export enum AuthManagerEvents {
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  TOKENS_CLEARED = 'TOKENS_CLEARED',
}

export interface AuthManagerEventData {
  [AuthManagerEvents.TOKEN_REFRESHED]: { accessToken: string };
  [AuthManagerEvents.TOKEN_EXPIRED]: { reason: string };
  [AuthManagerEvents.AUTHENTICATION_FAILED]: { error: string };
  [AuthManagerEvents.TOKENS_CLEARED]: {};
}
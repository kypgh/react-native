// HTTP Client and Configuration
export { default as httpClient } from './apiConfig';
export { API_CONFIG, API_ENDPOINTS } from './apiConfig';
export { default as HttpClient } from './httpClient';
export type { HttpClientConfig } from './httpClient';

// Base Service
export { BaseService } from './baseService';

// Error Handling
export {
  getErrorMessage,
  isRetryableError,
  requiresAuthentication,
  getRetryDelay,
  logError,
  createErrorResponse,
  ERROR_MESSAGES,
  SPECIFIC_ERROR_MESSAGES,
} from './errorHandler';

// Network Service
export { NetworkService, networkService, useNetworkState } from './networkService';
export type { NetworkState, NetworkServiceConfig } from './networkService';

// Authentication
export { AuthManager, AuthService, initializeAuth, clearAuth } from './auth';
export type {
  AuthTokens,
  TokenStorage,
  IAuthManager,
  SecureStorageConfig,
  TokenRefreshResponse,
  AuthManagerEvents,
  AuthManagerEventData,
} from './auth';

// Discovery Service
export { DiscoveryService, discoveryService } from './api/discoveryService';

// Subscription Service
export { SubscriptionService, subscriptionService } from './api/subscriptionService';

// Credit Service
export { CreditService, creditService } from './api/creditService';

// Profile Service
export { ProfileService, profileService } from './api/profileService';

// Payment Service
export { PaymentService, paymentService } from './api/paymentService';

// Re-export types from api.ts for convenience
export type {
  ApiError,
  ApiErrorType,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  BookingClass,
  BookingSession,
  Booking,
  PaymentPlan,
  Subscription,
  CreditBalance,
  PaginatedResponse,
  Brand,
  BrandDetailsResponse,
  BrandsResponse,
  ClassInfo,
  ClassesResponse,
  Session,
  SessionsResponse,
  BrandQueryParams,
  ClassQueryParams,
  SessionQueryParams,
  SubscriptionPlansResponse,
  CreditPlansResponse,
  ClientProfile,
  ProfileUpdateData,
  ProfileResponse,
} from '../types/api';
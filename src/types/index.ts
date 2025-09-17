// Export all API types
export * from './api';

// Export data transformation utilities
export { DataTransformer } from './transformers';

// Export type guards
export { TypeGuards } from './typeGuards';

// Re-export commonly used types for convenience
export type {
  // Core entity types
  ClientProfile,
  Brand,
  BrandSummary,
  ClassInfo,
  Session,
  Subscription,
  SubscriptionPlan,
  CreditPlan,
  CreditBalance,
  Payment,
  
  // Authentication types
  AuthTokens,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  
  // API response types
  ApiResponse,
  PaginatedResponse,
  BrandsResponse,
  ClassesResponse,
  SessionsResponse,
  SubscriptionsResponse,
  PaymentsResponse,
  
  // Query parameter types
  BrandQueryParams,
  ClassQueryParams,
  SessionQueryParams,
  SubscriptionQueryParams,
  PaymentHistoryQueryParams,
  
  // Error types
  ApiError,
  ApiErrorType,
  ErrorResponse,
  
  // Utility types
  Pagination,
  BookingEligibility,
  CreditEligibility
} from './api';

// Screen props types for backward compatibility
export interface HomeScreenProps {
  navigation: any;
  route: any;
}

export interface BookingsScreenProps {
  navigation: any;
  route: any;
}

export interface PaymentPlansScreenProps {
  navigation: any;
  route: any;
}

export interface ProfileScreenProps {
  navigation: any;
  route: any;
}
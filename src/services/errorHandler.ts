import { ApiError, ApiErrorType } from '../types/api';

// User-friendly error messages mapping
export const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK_ERROR]: 'Please check your internet connection and try again.',
  [ApiErrorType.AUTHENTICATION_ERROR]: 'Please log in again to continue.',
  [ApiErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ApiErrorType.SERVER_ERROR]: 'Something went wrong. Please try again later.',
  [ApiErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
};

// Specific error code messages for better UX
export const SPECIFIC_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
  'ACCOUNT_LOCKED': 'Your account has been temporarily locked. Please contact support.',
  'EMAIL_NOT_VERIFIED': 'Please verify your email address before logging in.',
  'PASSWORD_EXPIRED': 'Your password has expired. Please reset your password.',
  
  // Validation errors
  'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
  'WEAK_PASSWORD': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'REQUIRED_FIELD': 'This field is required.',
  
  // Booking errors
  'SESSION_FULL': 'This session is fully booked. Please choose another time.',
  'INSUFFICIENT_CREDITS': 'You don\'t have enough credits for this booking.',
  'BOOKING_WINDOW_CLOSED': 'Booking window for this session has closed.',
  'ALREADY_BOOKED': 'You have already booked this session.',
  
  // Payment errors
  'PAYMENT_FAILED': 'Payment could not be processed. Please try a different payment method.',
  'CARD_DECLINED': 'Your card was declined. Please check your card details.',
  'INSUFFICIENT_FUNDS': 'Insufficient funds. Please use a different payment method.',
  
  // Subscription errors
  'SUBSCRIPTION_EXPIRED': 'Your subscription has expired. Please renew to continue.',
  'PLAN_NOT_AVAILABLE': 'This subscription plan is no longer available.',
  
  // General errors
  'RATE_LIMIT': 'Too many requests. Please wait a few seconds and try again.',
  'MAINTENANCE': 'The service is temporarily unavailable for maintenance.',
  'NOT_FOUND': 'The requested resource was not found.',
  'FORBIDDEN': 'You don\'t have permission to perform this action.',
};

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: ApiError): string {
  // Check for specific error code first
  if (error.code && SPECIFIC_ERROR_MESSAGES[error.code]) {
    return SPECIFIC_ERROR_MESSAGES[error.code];
  }
  
  // Fall back to general error type message
  if (ERROR_MESSAGES[error.type]) {
    return ERROR_MESSAGES[error.type];
  }
  
  // Use the error message if available, otherwise generic message
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  // Don't retry rate limit errors - they need time to reset
  if (error.code === 'RATE_LIMIT' || error.statusCode === 429) {
    return false;
  }
  
  const retryableTypes = [
    ApiErrorType.NETWORK_ERROR,
    ApiErrorType.TIMEOUT_ERROR,
    ApiErrorType.SERVER_ERROR,
  ];
  
  const retryableCodes = [
    'SERVER_ERROR',
    'TIMEOUT_ERROR',
    'NETWORK_ERROR',
  ];
  
  return retryableTypes.includes(error.type) || 
         (error.code ? retryableCodes.includes(error.code) : false);
}

/**
 * Check if error requires authentication
 */
export function requiresAuthentication(error: ApiError): boolean {
  return error.type === ApiErrorType.AUTHENTICATION_ERROR ||
         error.statusCode === 401 ||
         error.code === 'AUTHENTICATION_ERROR';
}

/**
 * Get retry delay in milliseconds with exponential backoff
 */
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}

/**
 * Log error for debugging (development only)
 */
export function logError(error: ApiError, context?: string): void {
  if (__DEV__) {
    console.group(`🚨 API Error${context ? ` - ${context}` : ''}`);
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.statusCode);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.groupEnd();
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse<T>(error: ApiError): { success: false; data: T; error: ApiError } {
  return {
    success: false,
    data: {} as T,
    error,
  };
}

export default {
  getErrorMessage,
  isRetryableError,
  requiresAuthentication,
  getRetryDelay,
  logError,
  createErrorResponse,
};
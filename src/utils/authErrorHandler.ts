import { ApiError, ApiErrorType } from '../types/api';

/**
 * Authentication-specific error messages
 */
export const AUTH_ERROR_MESSAGES = {
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please try again later.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  TOO_MANY_ATTEMPTS: 'Too many login attempts. Please try again later.',
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long and contain letters and numbers.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields.',
  
  // Token errors
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid authentication token. Please log in again.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh your session. Please log in again.',
  
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Maps API error codes to user-friendly messages
 */
export const getAuthErrorMessage = (error: ApiError): string => {
  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
      case 'AUTHENTICATION_FAILED':
        return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
      
      case 'EMAIL_ALREADY_EXISTS':
      case 'DUPLICATE_EMAIL':
        return AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
      
      case 'WEAK_PASSWORD':
      case 'PASSWORD_TOO_SHORT':
        return AUTH_ERROR_MESSAGES.WEAK_PASSWORD;
      
      case 'INVALID_EMAIL':
      case 'EMAIL_FORMAT_INVALID':
        return AUTH_ERROR_MESSAGES.INVALID_EMAIL;
      
      case 'ACCOUNT_LOCKED':
        return AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED;
      
      case 'ACCOUNT_DISABLED':
        return AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED;
      
      case 'TOO_MANY_ATTEMPTS':
      case 'RATE_LIMIT':
        return AUTH_ERROR_MESSAGES.TOO_MANY_ATTEMPTS;
      
      case 'TOKEN_EXPIRED':
        return AUTH_ERROR_MESSAGES.TOKEN_EXPIRED;
      
      case 'TOKEN_INVALID':
        return AUTH_ERROR_MESSAGES.TOKEN_INVALID;
      
      case 'MISSING_REQUIRED_FIELDS':
      case 'VALIDATION_ERROR':
        return AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS;
    }
  }

  // Handle error types
  switch (error.type) {
    case ApiErrorType.AUTHENTICATION_ERROR:
      return error.message || AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    
    case ApiErrorType.VALIDATION_ERROR:
      return error.message || AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS;
    
    case ApiErrorType.NETWORK_ERROR:
      return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
    
    case ApiErrorType.SERVER_ERROR:
      return AUTH_ERROR_MESSAGES.SERVER_ERROR;
    
    case ApiErrorType.TIMEOUT_ERROR:
      return AUTH_ERROR_MESSAGES.TIMEOUT_ERROR;
    
    default:
      return error.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

/**
 * Determines if an error is recoverable (user can retry)
 */
export const isRecoverableAuthError = (error: ApiError): boolean => {
  const nonRecoverableCodes = [
    'ACCOUNT_DISABLED',
    'ACCOUNT_LOCKED',
    'EMAIL_ALREADY_EXISTS',
    'DUPLICATE_EMAIL',
  ];

  if (error.code && nonRecoverableCodes.includes(error.code)) {
    return false;
  }

  const nonRecoverableTypes = [
    ApiErrorType.AUTHENTICATION_ERROR, // Usually means wrong credentials
  ];

  return !nonRecoverableTypes.includes(error.type);
};

/**
 * Determines if an error should trigger automatic retry
 */
export const shouldRetryAuthError = (error: ApiError): boolean => {
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
  ];

  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }

  const retryableTypes = [
    ApiErrorType.NETWORK_ERROR,
    ApiErrorType.TIMEOUT_ERROR,
    ApiErrorType.SERVER_ERROR,
  ];

  return retryableTypes.includes(error.type);
};

/**
 * Gets retry delay in milliseconds based on error type
 */
export const getRetryDelay = (error: ApiError, attemptNumber: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds

  // Exponential backoff for network and server errors
  if (shouldRetryAuthError(error)) {
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    return delay;
  }

  return 0; // No retry
};

/**
 * Validates login credentials client-side
 */
export const validateLoginCredentials = (credentials: { email: string; password: string }): string | null => {
  if (!credentials.email || !credentials.password) {
    return AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    return AUTH_ERROR_MESSAGES.INVALID_EMAIL;
  }

  return null; // Valid
};

/**
 * Validates registration data client-side
 */
export const validateRegistrationData = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): string | null => {
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    return AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return AUTH_ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (data.password.length < 6) {
    return AUTH_ERROR_MESSAGES.WEAK_PASSWORD;
  }

  return null; // Valid
};
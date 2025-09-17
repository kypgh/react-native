import { DataTransformer } from './transformers';
import { TypeGuards } from './typeGuards';
import {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  BrandDetailsResponse,
  SubscriptionPlansResponse,
  CreditPlansResponse,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  BrandsResponse,
  ClassesResponse,
  SessionsResponse,
  SubscriptionsResponse,
  PaymentsResponse,
  CreditBalancesResponse,
  CreditTransactionsResponse,
  ExpiringCreditsResponse,
  TokenRefreshResponse,
  ProfileResponse,
  ApiError,
  ApiErrorType,
  ErrorResponse
} from './api';

/**
 * Utility functions for safely processing API responses with type validation
 * and data transformation
 */
export class ApiUtils {
  /**
   * Safely process and transform an API response with type validation
   */
  static processApiResponse<T, R>(
    response: unknown,
    typeGuard: (value: unknown) => value is T,
    transformer: (data: T) => R
  ): { success: true; data: R } | { success: false; error: ApiError } {
    try {
      // First check if it's a basic API response structure
      if (!TypeGuards.isObject(response)) {
        return {
          success: false,
          error: {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'Invalid response format',
            code: 'INVALID_RESPONSE'
          }
        };
      }

      // Check if it's an error response
      if ('success' in response && response.success === false && 'error' in response) {
        const errorResponse = response as unknown as ErrorResponse;
        return {
          success: false,
          error: {
            type: ApiErrorType.SERVER_ERROR,
            message: errorResponse.error.message,
            code: errorResponse.error.code,
            details: typeof errorResponse.error.details === 'object' 
              ? errorResponse.error.details as Record<string, any>
              : undefined
          }
        };
      }

      // Validate the response structure
      if (!TypeGuards.isApiResponse(response, typeGuard)) {
        return {
          success: false,
          error: {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'Response data does not match expected type',
            code: 'TYPE_VALIDATION_FAILED'
          }
        };
      }

      // Transform the data
      const transformedData = transformer(response.data);
      return { success: true, data: transformedData };

    } catch (error) {
      return {
        success: false,
        error: {
          type: ApiErrorType.SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROCESSING_ERROR'
        }
      };
    }
  }

  /**
   * Safely process and transform a paginated API response
   */
  static processPaginatedResponse<T, R>(
    response: unknown,
    typeGuard: (value: unknown) => value is T,
    transformer: (data: T) => R
  ): { success: true; data: R } | { success: false; error: ApiError } {
    try {
      if (!TypeGuards.isObject(response)) {
        return {
          success: false,
          error: {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'Invalid response format',
            code: 'INVALID_RESPONSE'
          }
        };
      }

      // Check if it's an error response
      if ('success' in response && response.success === false && 'error' in response) {
        const errorResponse = response as unknown as ErrorResponse;
        return {
          success: false,
          error: {
            type: ApiErrorType.SERVER_ERROR,
            message: errorResponse.error.message,
            code: errorResponse.error.code,
            details: typeof errorResponse.error.details === 'object' 
              ? errorResponse.error.details as Record<string, any>
              : undefined
          }
        };
      }

      // Validate the paginated response structure
      if (!TypeGuards.isPaginatedResponse(response, typeGuard)) {
        return {
          success: false,
          error: {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'Paginated response data does not match expected type',
            code: 'TYPE_VALIDATION_FAILED'
          }
        };
      }

      // Transform the data
      const transformedData = transformer(response.data);
      return { success: true, data: transformedData };

    } catch (error) {
      return {
        success: false,
        error: {
          type: ApiErrorType.SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROCESSING_ERROR'
        }
      };
    }
  }

  // Specific response processors for common API endpoints

  /**
   * Process authentication response
   */
  static processAuthResponse(response: unknown) {
    return this.processApiResponse(
      response,
      TypeGuards.isAuthResponse,
      DataTransformer.transformAuthResponse
    );
  }

  /**
   * Process token refresh response
   */
  static processTokenRefreshResponse(response: unknown) {
    return this.processApiResponse(
      response,
      (data): data is TokenRefreshResponse => 
        TypeGuards.isObject(data) && 
        TypeGuards.isString(data.accessToken) && 
        TypeGuards.isNumber(data.expiresIn),
      (data) => ({
        accessToken: data.accessToken,
        expiresIn: data.expiresIn
      })
    );
  }

  /**
   * Process profile response
   */
  static processProfileResponse(response: unknown) {
    return this.processApiResponse(
      response,
      (data): data is ProfileResponse => 
        TypeGuards.isObject(data) && 
        TypeGuards.isClientProfile(data.client),
      (data) => ({
        client: DataTransformer.transformClientProfile(data.client)
      })
    );
  }

  /**
   * Utility to check if a response indicates success
   */
  static isSuccessResponse(response: unknown): boolean {
    return TypeGuards.isObject(response) && response.success === true;
  }

  /**
   * Utility to extract error from response
   */
  static extractError(response: unknown): ApiError | null {
    if (!TypeGuards.isObject(response)) return null;
    
    if ('success' in response && response.success === false && 'error' in response) {
      const errorResponse = response as unknown as ErrorResponse;
      return {
        type: ApiErrorType.SERVER_ERROR,
        message: errorResponse.error.message,
        code: errorResponse.error.code,
        details: typeof errorResponse.error.details === 'object' 
          ? errorResponse.error.details as Record<string, any>
          : undefined
      };
    }

    return null;
  }
}
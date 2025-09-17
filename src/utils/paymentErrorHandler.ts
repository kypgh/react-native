import { ApiError, ApiErrorType } from '../types/api';

/**
 * Payment-specific error types
 */
export enum PaymentErrorType {
  CARD_DECLINED = 'CARD_DECLINED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  EXPIRED_CARD = 'EXPIRED_CARD',
  INCORRECT_CVC = 'INCORRECT_CVC',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  PAYMENT_METHOD_ERROR = 'PAYMENT_METHOD_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Payment error interface
 */
export interface PaymentError extends ApiError {
  paymentErrorType?: PaymentErrorType;
  retryable?: boolean;
  requiresAction?: boolean;
  actionType?: 'authentication' | 'new_payment_method' | 'contact_bank';
}

/**
 * Payment error handler utility
 */
export class PaymentErrorHandler {
  /**
   * Transform various error types to standardized payment error
   */
  static transformError(error: any): PaymentError {
    if (!error) {
      return {
        type: ApiErrorType.SERVER_ERROR,
        paymentErrorType: PaymentErrorType.UNKNOWN_ERROR,
        message: 'An unknown payment error occurred',
        code: 'UNKNOWN_ERROR',
        retryable: true,
      };
    }

    // Handle Stripe errors
    if (error.type && error.code) {
      return this.transformStripeError(error);
    }

    // Handle API errors
    if (error.type && Object.values(ApiErrorType).includes(error.type)) {
      return this.transformApiError(error);
    }

    // Handle generic errors
    return {
      type: ApiErrorType.SERVER_ERROR,
      paymentErrorType: PaymentErrorType.UNKNOWN_ERROR,
      message: error.message || 'Payment processing failed',
      code: error.code || 'PAYMENT_ERROR',
      retryable: true,
    };
  }

  /**
   * Transform Stripe-specific errors
   */
  private static transformStripeError(error: any): PaymentError {
    const baseError: PaymentError = {
      type: ApiErrorType.VALIDATION_ERROR,
      message: error.message || 'Payment failed',
      code: error.code,
      retryable: false,
    };

    switch (error.code) {
      case 'card_declined':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.CARD_DECLINED,
          message: 'Your card was declined. Please try a different payment method.',
          retryable: true,
          actionType: 'new_payment_method',
        };

      case 'insufficient_funds':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.INSUFFICIENT_FUNDS,
          message: 'Insufficient funds. Please check your account balance or try a different card.',
          retryable: true,
          actionType: 'contact_bank',
        };

      case 'expired_card':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.EXPIRED_CARD,
          message: 'Your card has expired. Please update your payment method.',
          retryable: true,
          actionType: 'new_payment_method',
        };

      case 'incorrect_cvc':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.INCORRECT_CVC,
          message: 'The security code is incorrect. Please check and try again.',
          retryable: true,
        };

      case 'processing_error':
        return {
          ...baseError,
          type: ApiErrorType.SERVER_ERROR,
          paymentErrorType: PaymentErrorType.PROCESSING_ERROR,
          message: 'Payment processing error. Please try again in a few minutes.',
          retryable: true,
        };

      case 'authentication_required':
      case 'payment_intent_authentication_failure':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.AUTHENTICATION_REQUIRED,
          message: 'Additional authentication required. Please complete the verification.',
          retryable: true,
          requiresAction: true,
          actionType: 'authentication',
        };

      case 'payment_method_unactivated':
      case 'payment_method_unexpected_state':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.PAYMENT_METHOD_ERROR,
          message: 'There is an issue with your payment method. Please contact your bank or try a different card.',
          retryable: true,
          actionType: 'contact_bank',
        };

      case 'payment_method_unsupported_type':
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.PAYMENT_METHOD_ERROR,
          message: 'This payment method is not supported. Please try a different method.',
          retryable: true,
          actionType: 'new_payment_method',
        };

      case 'connection_error':
        return {
          ...baseError,
          type: ApiErrorType.NETWORK_ERROR,
          paymentErrorType: PaymentErrorType.NETWORK_ERROR,
          message: 'Connection error. Please check your internet connection and try again.',
          retryable: true,
        };

      case 'rate_limit_error':
        return {
          ...baseError,
          type: ApiErrorType.SERVER_ERROR,
          paymentErrorType: PaymentErrorType.PROCESSING_ERROR,
          message: 'Too many requests. Please wait a moment and try again.',
          retryable: true,
        };

      default:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.UNKNOWN_ERROR,
          message: error.message || 'Payment failed. Please try again.',
          retryable: true,
        };
    }
  }

  /**
   * Transform API errors to payment errors
   */
  private static transformApiError(error: ApiError): PaymentError {
    const baseError: PaymentError = {
      ...error,
      retryable: false,
    };

    switch (error.type) {
      case ApiErrorType.NETWORK_ERROR:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.NETWORK_ERROR,
          retryable: true,
        };

      case ApiErrorType.VALIDATION_ERROR:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.VALIDATION_ERROR,
          retryable: true,
        };

      case ApiErrorType.SERVER_ERROR:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.PROCESSING_ERROR,
          retryable: true,
        };

      case ApiErrorType.TIMEOUT_ERROR:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.NETWORK_ERROR,
          retryable: true,
        };

      default:
        return {
          ...baseError,
          paymentErrorType: PaymentErrorType.UNKNOWN_ERROR,
          retryable: true,
        };
    }
  }

  /**
   * Get user-friendly error message with action guidance
   */
  static getErrorMessage(error: PaymentError): string {
    let message = error.message;

    if (error.actionType) {
      switch (error.actionType) {
        case 'authentication':
          message += ' Please complete the additional verification steps.';
          break;
        case 'new_payment_method':
          message += ' Please try using a different payment method.';
          break;
        case 'contact_bank':
          message += ' Please contact your bank or card issuer for assistance.';
          break;
      }
    }

    return message;
  }

  /**
   * Get retry strategy for error
   */
  static getRetryStrategy(error: PaymentError): {
    shouldRetry: boolean;
    retryDelay: number;
    maxRetries: number;
    requiresUserAction: boolean;
  } {
    if (!error.retryable) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: 0,
        requiresUserAction: true,
      };
    }

    switch (error.paymentErrorType) {
      case PaymentErrorType.NETWORK_ERROR:
      case PaymentErrorType.PROCESSING_ERROR:
        return {
          shouldRetry: true,
          retryDelay: 2000, // 2 seconds
          maxRetries: 3,
          requiresUserAction: false,
        };

      case PaymentErrorType.AUTHENTICATION_REQUIRED:
        return {
          shouldRetry: false,
          retryDelay: 0,
          maxRetries: 0,
          requiresUserAction: true,
        };

      case PaymentErrorType.CARD_DECLINED:
      case PaymentErrorType.INSUFFICIENT_FUNDS:
      case PaymentErrorType.EXPIRED_CARD:
      case PaymentErrorType.PAYMENT_METHOD_ERROR:
        return {
          shouldRetry: false,
          retryDelay: 0,
          maxRetries: 0,
          requiresUserAction: true,
        };

      case PaymentErrorType.INCORRECT_CVC:
      case PaymentErrorType.VALIDATION_ERROR:
        return {
          shouldRetry: true,
          retryDelay: 0,
          maxRetries: 1,
          requiresUserAction: true,
        };

      default:
        return {
          shouldRetry: true,
          retryDelay: 1000, // 1 second
          maxRetries: 2,
          requiresUserAction: false,
        };
    }
  }

  /**
   * Check if error requires immediate user action
   */
  static requiresUserAction(error: PaymentError): boolean {
    return error.requiresAction || 
           error.actionType !== undefined ||
           !error.retryable ||
           [
             PaymentErrorType.CARD_DECLINED,
             PaymentErrorType.INSUFFICIENT_FUNDS,
             PaymentErrorType.EXPIRED_CARD,
             PaymentErrorType.INCORRECT_CVC,
             PaymentErrorType.PAYMENT_METHOD_ERROR,
             PaymentErrorType.AUTHENTICATION_REQUIRED,
           ].includes(error.paymentErrorType!);
  }

  /**
   * Get suggested actions for error resolution
   */
  static getSuggestedActions(error: PaymentError): string[] {
    const actions: string[] = [];

    switch (error.paymentErrorType) {
      case PaymentErrorType.CARD_DECLINED:
        actions.push('Try a different payment method');
        actions.push('Contact your bank to verify the transaction');
        actions.push('Check if your card has sufficient funds');
        break;

      case PaymentErrorType.INSUFFICIENT_FUNDS:
        actions.push('Add funds to your account');
        actions.push('Try a different payment method');
        actions.push('Contact your bank for assistance');
        break;

      case PaymentErrorType.EXPIRED_CARD:
        actions.push('Update your payment method with a valid card');
        actions.push('Check your card expiration date');
        break;

      case PaymentErrorType.INCORRECT_CVC:
        actions.push('Double-check the security code on your card');
        actions.push('Try entering the CVC again');
        break;

      case PaymentErrorType.AUTHENTICATION_REQUIRED:
        actions.push('Complete the additional verification steps');
        actions.push('Check for SMS or email verification codes');
        break;

      case PaymentErrorType.PAYMENT_METHOD_ERROR:
        actions.push('Try a different payment method');
        actions.push('Contact your bank or card issuer');
        break;

      case PaymentErrorType.NETWORK_ERROR:
        actions.push('Check your internet connection');
        actions.push('Try again in a few moments');
        break;

      case PaymentErrorType.PROCESSING_ERROR:
        actions.push('Wait a few minutes and try again');
        actions.push('Contact support if the problem persists');
        break;

      default:
        actions.push('Try again');
        actions.push('Contact support if the problem continues');
        break;
    }

    return actions;
  }

  /**
   * Log payment error for debugging
   */
  static logError(error: PaymentError, context?: string): void {
    if (__DEV__) {
      console.error('💳 Payment Error:', {
        context,
        type: error.type,
        paymentErrorType: error.paymentErrorType,
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        requiresAction: error.requiresAction,
        actionType: error.actionType,
        details: error.details,
      });
    }
  }
}

export default PaymentErrorHandler;
import { StripeProvider, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { PaymentIntent } from '../types/api';

/**
 * Stripe configuration and utilities
 */
export interface StripeConfig {
  publishableKey: string;
  merchantIdentifier?: string;
  urlScheme?: string;
}

/**
 * Payment processing result
 */
export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

/**
 * Payment method creation result
 */
export interface PaymentMethodResult {
  success: boolean;
  paymentMethod?: {
    id: string;
    type: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  };
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

/**
 * Stripe utility class for payment processing
 */
export class StripeUtils {
  private static instance: StripeUtils;
  private config: StripeConfig;

  private constructor(config: StripeConfig) {
    this.config = config;
  }

  public static getInstance(config?: StripeConfig): StripeUtils {
    if (!StripeUtils.instance && config) {
      StripeUtils.instance = new StripeUtils(config);
    }
    return StripeUtils.instance;
  }

  /**
   * Get Stripe configuration
   */
  public getConfig(): StripeConfig {
    return this.config;
  }

  /**
   * Update Stripe configuration
   */
  public updateConfig(config: Partial<StripeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Transform Stripe error to our error format
   */
  public transformStripeError(error: any): {
    code: string;
    message: string;
    type: string;
  } {
    if (!error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        type: 'api_error',
      };
    }

    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: this.getErrorMessage(error.code || error.type),
      type: error.type || 'api_error',
    };
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'card_declined': 'Your card was declined. Please try a different payment method.',
      'insufficient_funds': 'Insufficient funds. Please check your account balance.',
      'expired_card': 'Your card has expired. Please update your payment method.',
      'incorrect_cvc': 'The security code is incorrect. Please check and try again.',
      'processing_error': 'Payment processing error. Please try again in a few minutes.',
      'authentication_required': 'Additional authentication required. Please complete the verification.',
      'payment_intent_authentication_failure': 'Payment authentication failed. Please try again.',
      'payment_method_unactivated': 'Your payment method needs to be activated. Please contact your bank.',
      'payment_method_unexpected_state': 'Payment method is in an unexpected state. Please try again.',
      'payment_method_unsupported_type': 'This payment method is not supported. Please try a different method.',
      'setup_intent_authentication_failure': 'Payment method setup failed. Please try again.',
      'invalid_request_error': 'Invalid payment request. Please check your information and try again.',
      'api_error': 'Payment service error. Please try again later.',
      'connection_error': 'Connection error. Please check your internet connection and try again.',
      'rate_limit_error': 'Too many requests. Please wait a moment and try again.',
    };

    return errorMessages[errorCode] || 'Payment failed. Please try again.';
  }

  /**
   * Validate payment method data
   */
  public validatePaymentMethodData(data: {
    number?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.number) {
      // Basic card number validation (Luhn algorithm would be better)
      const cleanNumber = data.number.replace(/\s/g, '');
      if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        errors.push('Card number must be between 13 and 19 digits');
      }
      if (!/^\d+$/.test(cleanNumber)) {
        errors.push('Card number must contain only digits');
      }
    }

    if (data.expiryMonth) {
      if (data.expiryMonth < 1 || data.expiryMonth > 12) {
        errors.push('Expiry month must be between 1 and 12');
      }
    }

    if (data.expiryYear) {
      const currentYear = new Date().getFullYear();
      if (data.expiryYear < currentYear || data.expiryYear > currentYear + 20) {
        errors.push('Expiry year is invalid');
      }
    }

    if (data.cvc) {
      if (data.cvc.length < 3 || data.cvc.length > 4) {
        errors.push('Security code must be 3 or 4 digits');
      }
      if (!/^\d+$/.test(data.cvc)) {
        errors.push('Security code must contain only digits');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format card number for display
   */
  public formatCardNumber(number: string): string {
    const cleanNumber = number.replace(/\s/g, '');
    const groups = cleanNumber.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }

  /**
   * Get card brand from number
   */
  public getCardBrand(number: string): string {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(cleanNumber)) return 'jcb';
    if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return 'diners';
    
    return 'unknown';
  }

  /**
   * Mask card number for display
   */
  public maskCardNumber(number: string): string {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 4) return number;
    
    const last4 = cleanNumber.slice(-4);
    const masked = '*'.repeat(cleanNumber.length - 4);
    return this.formatCardNumber(masked + last4);
  }
}

/**
 * Hook for Stripe payment processing
 */
export const useStripePayment = () => {
  const { confirmPayment } = useConfirmPayment();
  const stripe = useStripe();

  /**
   * Confirm payment with payment intent
   */
  const confirmPaymentIntent = async (
    paymentIntentClientSecret: string,
    paymentMethodId?: string
  ): Promise<PaymentResult> => {
    try {
      if (!stripe) {
        return {
          success: false,
          error: {
            code: 'STRIPE_NOT_INITIALIZED',
            message: 'Stripe is not initialized',
            type: 'initialization_error',
          },
        };
      }

      const { error, paymentIntent } = await confirmPayment(paymentIntentClientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        return {
          success: false,
          error: StripeUtils.getInstance().transformStripeError(error),
        };
      }

      return {
        success: true,
        paymentIntent: paymentIntent as PaymentIntent,
      };
    } catch (error) {
      return {
        success: false,
        error: StripeUtils.getInstance().transformStripeError(error),
      };
    }
  };

  /**
   * Create payment method
   */
  const createPaymentMethod = async (cardDetails: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
  }): Promise<PaymentMethodResult> => {
    try {
      if (!stripe) {
        return {
          success: false,
          error: {
            code: 'STRIPE_NOT_INITIALIZED',
            message: 'Stripe is not initialized',
            type: 'initialization_error',
          },
        };
      }

      // Validate card details
      const validation = StripeUtils.getInstance().validatePaymentMethodData(cardDetails);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join(', '),
            type: 'validation_error',
          },
        };
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: 'test@example.com', // This would come from user data in real implementation
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: StripeUtils.getInstance().transformStripeError(error),
        };
      }

      return {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: 'Card',
          card: paymentMethod.Card ? {
            brand: paymentMethod.Card.brand || 'unknown',
            last4: paymentMethod.Card.last4 || '0000',
            expMonth: paymentMethod.Card.expMonth || 0,
            expYear: paymentMethod.Card.expYear || 0,
          } : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: StripeUtils.getInstance().transformStripeError(error),
      };
    }
  };

  return {
    confirmPaymentIntent,
    createPaymentMethod,
    isStripeReady: !!stripe,
  };
};

/**
 * Default Stripe configuration
 * This should be loaded from environment variables or config
 */
export const DEFAULT_STRIPE_CONFIG: StripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  merchantIdentifier: 'merchant.com.yourapp.booking',
  urlScheme: 'your-app-scheme',
};

export default StripeUtils;
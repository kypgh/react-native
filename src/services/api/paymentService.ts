import { BaseService } from '../baseService';
import {
  ApiResponse,
  PaymentIntent,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  PaymentConfirmationRequest,
  Payment,
  PaymentsResponse,
  PaymentHistoryQueryParams,
  PaymentResponse,
  SubscriptionPurchaseRequest,
  CreditPurchaseRequest,
} from '../../types/api';

/**
 * Payment Service for handling payment processing integration
 * Manages payment intents, confirmations, transaction history, and error handling
 */
export class PaymentService extends BaseService {
  private readonly basePath = '/client/payments';

  /**
   * Create payment intent for subscription purchase
   */
  async createSubscriptionPaymentIntent(
    subscriptionPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    const url = `${this.basePath}/subscription/payment-intent`;
    const data: SubscriptionPurchaseRequest = {
      subscriptionPlanId,
      paymentMethodId,
    };
    
    return this.post<PaymentIntentResponse>(
      url, 
      data, 
      `PaymentService.createSubscriptionPaymentIntent(${subscriptionPlanId})`
    );
  }

  /**
   * Create payment intent for credit purchase
   */
  async createCreditPaymentIntent(
    creditPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    const url = `${this.basePath}/credit/payment-intent`;
    const data: CreditPurchaseRequest = {
      creditPlanId,
      paymentMethodId,
    };
    
    return this.post<PaymentIntentResponse>(
      url, 
      data, 
      `PaymentService.createCreditPaymentIntent(${creditPlanId})`
    );
  }

  /**
   * Confirm payment after client-side payment processing
   */
  async confirmPayment(
    paymentIntentId: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> {
    const url = `${this.basePath}/confirm`;
    const data: PaymentConfirmationRequest = {
      paymentIntentId,
    };
    
    return this.post<PaymentConfirmationResponse>(
      url, 
      data, 
      `PaymentService.confirmPayment(${paymentIntentId})`
    );
  }

  /**
   * Get payment transaction history
   */
  async getPaymentHistory(
    params?: PaymentHistoryQueryParams
  ): Promise<ApiResponse<PaymentsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/history${queryString}`;
    
    return this.get<PaymentsResponse>(url, 'PaymentService.getPaymentHistory');
  }

  /**
   * Get details of a specific payment transaction
   */
  async getPayment(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    const url = `${this.basePath}/${paymentId}`;
    
    return this.get<PaymentResponse>(url, `PaymentService.getPayment(${paymentId})`);
  }

  /**
   * Retry a failed payment
   */
  async retryPayment(
    paymentId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    const url = `${this.basePath}/${paymentId}/retry`;
    const data = paymentMethodId ? { paymentMethodId } : {};
    
    return this.post<PaymentIntentResponse>(
      url, 
      data, 
      `PaymentService.retryPayment(${paymentId})`
    );
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    const url = `${this.basePath}/${paymentId}/cancel`;
    
    return this.post<PaymentResponse>(
      url, 
      {}, 
      `PaymentService.cancelPayment(${paymentId})`
    );
  }

  /**
   * Get payment methods for the current user
   */
  async getPaymentMethods(): Promise<ApiResponse<{
    paymentMethods: Array<{
      id: string;
      type: string;
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      };
      isDefault: boolean;
    }>;
  }>> {
    const url = `${this.basePath}/methods`;
    
    return this.get<{
      paymentMethods: Array<{
        id: string;
        type: string;
        card?: {
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
        };
        isDefault: boolean;
      }>;
    }>(url, 'PaymentService.getPaymentMethods');
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(
    paymentMethodId: string,
    setAsDefault: boolean = false
  ): Promise<ApiResponse<{
    paymentMethod: {
      id: string;
      type: string;
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      };
      isDefault: boolean;
    };
  }>> {
    const url = `${this.basePath}/methods`;
    const data = {
      paymentMethodId,
      setAsDefault,
    };
    
    return this.post<{
      paymentMethod: {
        id: string;
        type: string;
        card?: {
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
        };
        isDefault: boolean;
      };
    }>(url, data, 'PaymentService.addPaymentMethod');
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<ApiResponse<{ success: boolean }>> {
    const url = `${this.basePath}/methods/${paymentMethodId}`;
    
    return this.delete<{ success: boolean }>(
      url, 
      `PaymentService.removePaymentMethod(${paymentMethodId})`
    );
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<ApiResponse<{
    paymentMethod: {
      id: string;
      type: string;
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      };
      isDefault: boolean;
    };
  }>> {
    const url = `${this.basePath}/methods/${paymentMethodId}/default`;
    
    return this.post<{
      paymentMethod: {
        id: string;
        type: string;
        card?: {
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
        };
        isDefault: boolean;
      };
    }>(url, {}, `PaymentService.setDefaultPaymentMethod(${paymentMethodId})`);
  }

  /**
   * Process subscription purchase (combines payment intent creation and confirmation)
   */
  async processSubscriptionPurchase(
    subscriptionPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> {
    try {
      // Create payment intent
      const paymentIntentResponse = await this.createSubscriptionPaymentIntent(
        subscriptionPlanId,
        paymentMethodId
      );

      if (!paymentIntentResponse.success || !paymentIntentResponse.data.paymentIntent) {
        return {
          success: false,
          data: {} as PaymentConfirmationResponse,
          error: paymentIntentResponse.error,
        };
      }

      const paymentIntent = paymentIntentResponse.data.paymentIntent;

      // If payment requires confirmation (e.g., 3D Secure), return the payment intent
      // for client-side handling
      if (paymentIntent.status === 'requires_confirmation' || 
          paymentIntent.status === 'requires_action') {
        return {
          success: false,
          data: {
            payment: {} as Payment,
            requiresAction: true,
            paymentIntent,
          } as PaymentConfirmationResponse,
          error: {
            type: 'PAYMENT_ACTION_REQUIRED' as any,
            message: 'Payment requires additional authentication',
            code: 'REQUIRES_ACTION',
          },
        };
      }

      // If payment succeeded immediately, confirm it
      if (paymentIntent.status === 'succeeded') {
        const confirmationResponse = await this.confirmPayment(paymentIntent.id);
        return confirmationResponse;
      }

      // Handle other payment statuses
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: `Payment failed with status: ${paymentIntent.status}`,
          code: 'PAYMENT_FAILED',
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: error as any,
      };
    }
  }

  /**
   * Process credit purchase (combines payment intent creation and confirmation)
   */
  async processCreditPurchase(
    creditPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> {
    try {
      // Create payment intent
      const paymentIntentResponse = await this.createCreditPaymentIntent(
        creditPlanId,
        paymentMethodId
      );

      if (!paymentIntentResponse.success || !paymentIntentResponse.data.paymentIntent) {
        return {
          success: false,
          data: {} as PaymentConfirmationResponse,
          error: paymentIntentResponse.error,
        };
      }

      const paymentIntent = paymentIntentResponse.data.paymentIntent;

      // If payment requires confirmation (e.g., 3D Secure), return the payment intent
      // for client-side handling
      if (paymentIntent.status === 'requires_confirmation' || 
          paymentIntent.status === 'requires_action') {
        return {
          success: false,
          data: {
            payment: {} as Payment,
            requiresAction: true,
            paymentIntent,
          } as PaymentConfirmationResponse,
          error: {
            type: 'PAYMENT_ACTION_REQUIRED' as any,
            message: 'Payment requires additional authentication',
            code: 'REQUIRES_ACTION',
          },
        };
      }

      // If payment succeeded immediately, confirm it
      if (paymentIntent.status === 'succeeded') {
        const confirmationResponse = await this.confirmPayment(paymentIntent.id);
        return confirmationResponse;
      }

      // Handle other payment statuses
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: `Payment failed with status: ${paymentIntent.status}`,
          code: 'PAYMENT_FAILED',
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: error as any,
      };
    }
  }

  /**
   * Get recent payments (last 30 days)
   */
  async getRecentPayments(): Promise<ApiResponse<PaymentsResponse>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const params: PaymentHistoryQueryParams = {
      startDate: thirtyDaysAgo.toISOString(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 50,
    };
    
    return this.getPaymentHistory(params);
  }

  /**
   * Get successful payments only
   */
  async getSuccessfulPayments(
    params?: Omit<PaymentHistoryQueryParams, 'status'>
  ): Promise<ApiResponse<PaymentsResponse>> {
    const queryParams: PaymentHistoryQueryParams = {
      ...params,
      status: 'succeeded',
    };
    
    return this.getPaymentHistory(queryParams);
  }

  /**
   * Get failed payments for retry
   */
  async getFailedPayments(
    params?: Omit<PaymentHistoryQueryParams, 'status'>
  ): Promise<ApiResponse<PaymentsResponse>> {
    const queryParams: PaymentHistoryQueryParams = {
      ...params,
      status: 'failed',
    };
    
    return this.getPaymentHistory(queryParams);
  }

  /**
   * Get subscription payments only
   */
  async getSubscriptionPayments(
    params?: Omit<PaymentHistoryQueryParams, 'type'>
  ): Promise<ApiResponse<PaymentsResponse>> {
    const queryParams: PaymentHistoryQueryParams = {
      ...params,
      type: 'subscription',
    };
    
    return this.getPaymentHistory(queryParams);
  }

  /**
   * Get credit payments only
   */
  async getCreditPayments(
    params?: Omit<PaymentHistoryQueryParams, 'type'>
  ): Promise<ApiResponse<PaymentsResponse>> {
    const queryParams: PaymentHistoryQueryParams = {
      ...params,
      type: 'credit',
    };
    
    return this.getPaymentHistory(queryParams);
  }

  /**
   * Build query string from parameters object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return filteredParams ? `?${filteredParams}` : '';
  }

  /**
   * Transform payment error for user-friendly display
   */
  protected transformPaymentError(error: any): string {
    if (!error) return 'Payment failed. Please try again.';
    
    const errorCode = error.code || error.type;
    
    switch (errorCode) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.';
      case 'insufficient_funds':
        return 'Insufficient funds. Please check your account balance.';
      case 'expired_card':
        return 'Your card has expired. Please update your payment method.';
      case 'incorrect_cvc':
        return 'The security code is incorrect. Please check and try again.';
      case 'processing_error':
        return 'Payment processing error. Please try again in a few minutes.';
      case 'authentication_required':
        return 'Additional authentication required. Please complete the verification.';
      case 'REQUIRES_ACTION':
        return 'Payment requires additional verification. Please complete the authentication.';
      case 'PAYMENT_ACTION_REQUIRED':
        return 'Please complete the payment verification process.';
      default:
        return error.message || 'Payment failed. Please try again.';
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
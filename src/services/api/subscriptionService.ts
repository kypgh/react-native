import { BaseService } from '../baseService';
import {
  ApiResponse,
  Subscription,
  SubscriptionPlan,
  SubscriptionsResponse,
  SubscriptionPlansResponse,
  SubscriptionResponse,
  SubscriptionQueryParams,
  SubscriptionPurchaseRequest,
  SubscriptionCancellationRequest,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  PaymentConfirmationRequest,
  BookingEligibility,
} from '../../types/api';

/**
 * Subscription Service for managing subscription plans and user subscriptions
 * Handles subscription browsing, purchasing, status tracking, and cancellation
 */
export class SubscriptionService extends BaseService {
  private readonly basePath = '/client/subscriptions';

  /**
   * Get all subscription plans for a specific brand
   */
  async getSubscriptionPlans(brandId: string): Promise<ApiResponse<SubscriptionPlansResponse>> {
    const url = `/api/client/discovery/brands/${brandId}/subscription-plans`;
    
    return this.get<SubscriptionPlansResponse>(url, `SubscriptionService.getSubscriptionPlans(${brandId})`);
  }

  /**
   * Get user's active and past subscriptions
   */
  async getUserSubscriptions(params?: SubscriptionQueryParams): Promise<ApiResponse<SubscriptionsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}${queryString}`;
    
    return this.get<SubscriptionsResponse>(url, 'SubscriptionService.getUserSubscriptions');
  }

  /**
   * Get details of a specific subscription
   */
  async getSubscription(subscriptionId: string): Promise<ApiResponse<SubscriptionResponse>> {
    const url = `${this.basePath}/${subscriptionId}`;
    
    return this.get<SubscriptionResponse>(url, `SubscriptionService.getSubscription(${subscriptionId})`);
  }

  /**
   * Create payment intent for subscription purchase
   */
  async createSubscriptionPaymentIntent(
    subscriptionPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    const url = `${this.basePath}/payment-intent`;
    const data: SubscriptionPurchaseRequest = {
      subscriptionPlanId,
      paymentMethodId,
    };
    
    return this.post<PaymentIntentResponse>(url, data, 'SubscriptionService.createSubscriptionPaymentIntent');
  }

  /**
   * Confirm subscription payment and activate subscription
   */
  async confirmSubscriptionPayment(
    paymentIntentId: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> {
    const url = `${this.basePath}/confirm-payment`;
    const data: PaymentConfirmationRequest = {
      paymentIntentId,
    };
    
    return this.post<PaymentConfirmationResponse>(url, data, 'SubscriptionService.confirmSubscriptionPayment');
  }

  /**
   * Purchase subscription plan (combines payment intent creation and confirmation)
   */
  async purchaseSubscription(
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

      // Confirm payment
      const confirmationResponse = await this.confirmSubscriptionPayment(
        paymentIntentResponse.data.paymentIntent.id
      );

      return confirmationResponse;
    } catch (error) {
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: error as any,
      };
    }
  }

  /**
   * Cancel an active subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<ApiResponse<SubscriptionResponse>> {
    const url = `${this.basePath}/${subscriptionId}/cancel`;
    const data: SubscriptionCancellationRequest = {
      reason,
    };
    
    return this.post<SubscriptionResponse>(url, data, `SubscriptionService.cancelSubscription(${subscriptionId})`);
  }

  /**
   * Reactivate a cancelled subscription (if within grace period)
   */
  async reactivateSubscription(subscriptionId: string): Promise<ApiResponse<SubscriptionResponse>> {
    const url = `${this.basePath}/${subscriptionId}/reactivate`;
    
    return this.post<SubscriptionResponse>(url, {}, `SubscriptionService.reactivateSubscription(${subscriptionId})`);
  }

  /**
   * Update subscription auto-renewal setting
   */
  async updateAutoRenewal(
    subscriptionId: string,
    autoRenew: boolean
  ): Promise<ApiResponse<SubscriptionResponse>> {
    const url = `${this.basePath}/${subscriptionId}/auto-renewal`;
    const data = { autoRenew };
    
    return this.patch<SubscriptionResponse>(url, data, `SubscriptionService.updateAutoRenewal(${subscriptionId})`);
  }

  /**
   * Check booking eligibility based on subscription status
   */
  async checkBookingEligibility(
    sessionId: string,
    subscriptionId?: string
  ): Promise<ApiResponse<BookingEligibility>> {
    const url = `${this.basePath}/booking-eligibility`;
    const params = {
      sessionId,
      subscriptionId,
    };
    const queryString = this.buildQueryString(params);
    
    return this.get<BookingEligibility>(`${url}${queryString}`, 'SubscriptionService.checkBookingEligibility');
  }

  /**
   * Get active subscriptions only
   */
  async getActiveSubscriptions(): Promise<ApiResponse<SubscriptionsResponse>> {
    const params: SubscriptionQueryParams = {
      status: 'active',
      sortBy: 'startDate',
      sortOrder: 'desc',
    };
    
    return this.getUserSubscriptions(params);
  }

  /**
   * Get subscription history (cancelled and expired)
   */
  async getSubscriptionHistory(): Promise<ApiResponse<SubscriptionsResponse>> {
    const params: SubscriptionQueryParams = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    
    return this.getUserSubscriptions(params);
  }

  /**
   * Get subscriptions for a specific brand
   */
  async getSubscriptionsByBrand(brandId: string): Promise<ApiResponse<SubscriptionsResponse>> {
    const params: SubscriptionQueryParams = {
      brand: brandId,
      sortBy: 'startDate',
      sortOrder: 'desc',
    };
    
    return this.getUserSubscriptions(params);
  }

  /**
   * Check if user has active subscription for a brand
   */
  async hasActiveSubscriptionForBrand(brandId: string): Promise<boolean> {
    try {
      const response = await this.getSubscriptionsByBrand(brandId);
      
      if (!response.success || !response.data.subscriptions) {
        return false;
      }

      return response.data.subscriptions.some(
        subscription => subscription.status === 'active'
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get subscription plan details by ID
   */
  async getSubscriptionPlan(planId: string): Promise<ApiResponse<{ plan: SubscriptionPlan }>> {
    const url = `/api/client/subscription-plans/${planId}`;
    
    return this.get<{ plan: SubscriptionPlan }>(url, `SubscriptionService.getSubscriptionPlan(${planId})`);
  }

  /**
   * Get subscription usage statistics
   */
  async getSubscriptionUsage(subscriptionId: string): Promise<ApiResponse<{
    subscription: Subscription;
    usage: {
      totalBookings: number;
      remainingBookings?: number;
      usagePercentage: number;
      nextResetDate?: string;
    };
  }>> {
    const url = `${this.basePath}/${subscriptionId}/usage`;
    
    return this.get<{
      subscription: Subscription;
      usage: {
        totalBookings: number;
        remainingBookings?: number;
        usagePercentage: number;
        nextResetDate?: string;
      };
    }>(url, `SubscriptionService.getSubscriptionUsage(${subscriptionId})`);
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
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;
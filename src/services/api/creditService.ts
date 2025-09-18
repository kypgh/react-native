import { BaseService } from '../baseService';
import {
  ApiResponse,
  CreditPlan,
  CreditBalance,
  CreditTransaction,
  ExpiringCredit,
  CreditPlansResponse,
  CreditBalancesResponse,
  CreditTransactionsResponse,
  ExpiringCreditsResponse,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  CreditPurchaseRequest,
  PaymentConfirmationRequest,
  CreditEligibility,
  PaymentHistoryQueryParams,
} from '../../types/api';

/**
 * Credit Service for managing credit plans, balances, and transactions
 * Handles credit browsing, purchasing, balance tracking, and eligibility checking
 */
export class CreditService extends BaseService {
  private readonly basePath = '/client/credits';

  /**
   * Get all credit plans for a specific brand
   */
  async getCreditPlans(brandId: string): Promise<ApiResponse<CreditPlansResponse>> {
    const url = `/client/discovery/brands/${brandId}/credit-plans`;
    
    return this.get<CreditPlansResponse>(url, `CreditService.getCreditPlans(${brandId})`);
  }

  /**
   * Get user's credit balances across all brands
   */
  async getCreditBalances(): Promise<ApiResponse<CreditBalancesResponse>> {
    const url = `${this.basePath}/balances`;
    
    return this.get<CreditBalancesResponse>(url, 'CreditService.getCreditBalances');
  }

  /**
   * Get credit balance for a specific brand
   */
  async getCreditBalance(brandId: string): Promise<ApiResponse<{ balance: CreditBalance }>> {
    const url = `${this.basePath}/balances/${brandId}`;
    
    return this.get<{ balance: CreditBalance }>(url, `CreditService.getCreditBalance(${brandId})`);
  }

  /**
   * Get credit transaction history
   */
  async getCreditTransactions(params?: PaymentHistoryQueryParams): Promise<ApiResponse<CreditTransactionsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/transactions${queryString}`;
    
    return this.get<CreditTransactionsResponse>(url, 'CreditService.getCreditTransactions');
  }

  /**
   * Get credit transactions for a specific brand
   */
  async getCreditTransactionsByBrand(
    brandId: string,
    params?: PaymentHistoryQueryParams
  ): Promise<ApiResponse<CreditTransactionsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/transactions/brand/${brandId}${queryString}`;
    
    return this.get<CreditTransactionsResponse>(url, `CreditService.getCreditTransactionsByBrand(${brandId})`);
  }

  /**
   * Get credits that are expiring soon
   */
  async getExpiringCredits(days: number = 30): Promise<ApiResponse<ExpiringCreditsResponse>> {
    const url = `${this.basePath}/expiring?days=${days}`;
    
    return this.get<ExpiringCreditsResponse>(url, `CreditService.getExpiringCredits(${days})`);
  }

  /**
   * Create payment intent for credit purchase
   */
  async createCreditPaymentIntent(
    creditPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    const url = `/client/payments/credits/create-intent`;
    const data: CreditPurchaseRequest = {
      creditPlanId,
      paymentMethodId,
    };
    
    return this.post<PaymentIntentResponse>(url, data, 'CreditService.createCreditPaymentIntent');
  }

  /**
   * Confirm credit payment and add credits to balance
   */
  async confirmCreditPayment(
    paymentIntentId: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> {
    const url = `/client/payments/confirm`;
    const data: PaymentConfirmationRequest = {
      paymentIntentId,
    };
    
    return this.post<PaymentConfirmationResponse>(url, data, 'CreditService.confirmCreditPayment');
  }

  /**
   * Purchase credit plan (combines payment intent creation and confirmation)
   */
  async purchaseCredits(
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

      // Confirm payment
      const confirmationResponse = await this.confirmCreditPayment(
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
   * Check credit eligibility for class booking
   */
  async checkCreditEligibility(
    sessionId: string,
    brandId: string
  ): Promise<ApiResponse<CreditEligibility>> {
    const url = `${this.basePath}/booking-eligibility`;
    const params = {
      sessionId,
      brandId,
    };
    const queryString = this.buildQueryString(params);
    
    return this.get<CreditEligibility>(`${url}${queryString}`, 'CreditService.checkCreditEligibility');
  }

  /**
   * Use credits for booking (deduct from balance)
   */
  async useCredits(
    sessionId: string,
    brandId: string,
    creditsToUse: number
  ): Promise<ApiResponse<{
    transaction: CreditTransaction;
    remainingBalance: CreditBalance;
  }>> {
    const url = `${this.basePath}/use`;
    const data = {
      sessionId,
      brandId,
      creditsToUse,
    };
    
    return this.post<{
      transaction: CreditTransaction;
      remainingBalance: CreditBalance;
    }>(url, data, 'CreditService.useCredits');
  }

  /**
   * Get credit plan details by ID
   */
  async getCreditPlan(planId: string): Promise<ApiResponse<{ plan: CreditPlan }>> {
    const url = `/api/client/credit-plans/${planId}`;
    
    return this.get<{ plan: CreditPlan }>(url, `CreditService.getCreditPlan(${planId})`);
  }

  /**
   * Get total available credits across all brands
   */
  async getTotalAvailableCredits(): Promise<number> {
    try {
      const response = await this.getCreditBalances();
      
      if (!response.success || !response.data.balances) {
        return 0;
      }

      return response.data.balances.reduce(
        (total, balance) => total + balance.availableCredits,
        0
      );
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get available credits for a specific brand
   */
  async getAvailableCreditsForBrand(brandId: string): Promise<number> {
    try {
      const response = await this.getCreditBalance(brandId);
      
      if (!response.success || !response.data.balance) {
        return 0;
      }

      return response.data.balance.availableCredits;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if user has sufficient credits for booking
   */
  async hasSufficientCredits(
    sessionId: string,
    brandId: string,
    requiredCredits: number = 1
  ): Promise<boolean> {
    try {
      const eligibilityResponse = await this.checkCreditEligibility(sessionId, brandId);
      
      if (!eligibilityResponse.success || !eligibilityResponse.data) {
        return false;
      }

      return eligibilityResponse.data.eligible && 
             eligibilityResponse.data.availableCredits >= requiredCredits;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get credits expiring within specified days for a brand
   */
  async getExpiringCreditsForBrand(
    brandId: string,
    days: number = 30
  ): Promise<ExpiringCredit | null> {
    try {
      const response = await this.getExpiringCredits(days);
      
      if (!response.success || !response.data.expiringCredits) {
        return null;
      }

      return response.data.expiringCredits.find(
        credit => credit.brand._id === brandId
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get recent credit transactions (last 30 days)
   */
  async getRecentTransactions(): Promise<ApiResponse<CreditTransactionsResponse>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const params: PaymentHistoryQueryParams = {
      startDate: thirtyDaysAgo.toISOString(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 50,
    };
    
    return this.getCreditTransactions(params);
  }

  /**
   * Get purchase history (credit purchases only)
   */
  async getPurchaseHistory(): Promise<ApiResponse<CreditTransactionsResponse>> {
    const params: PaymentHistoryQueryParams = {
      type: 'credit',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    
    return this.getCreditTransactions(params);
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
export const creditService = new CreditService();
export default creditService;
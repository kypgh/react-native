import { useState, useCallback } from 'react';
import { paymentService } from '../services/api/paymentService';
import {
  ApiResponse,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  PaymentsResponse,
  PaymentResponse,
  PaymentHistoryQueryParams,
} from '../types/api';

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  paymentHistory: PaymentsResponse['payments'] | null;
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
  }> | null;
}

export interface UsePaymentsReturn {
  state: PaymentState;
  
  // Payment processing
  processSubscriptionPurchase: (
    subscriptionPlanId: string,
    paymentMethodId?: string
  ) => Promise<ApiResponse<PaymentConfirmationResponse>>;
  
  processCreditPurchase: (
    creditPlanId: string,
    paymentMethodId?: string
  ) => Promise<ApiResponse<PaymentConfirmationResponse>>;
  
  confirmPayment: (paymentIntentId: string) => Promise<ApiResponse<PaymentConfirmationResponse>>;
  
  retryPayment: (
    paymentId: string,
    paymentMethodId?: string
  ) => Promise<ApiResponse<PaymentIntentResponse>>;
  
  // Payment history
  loadPaymentHistory: (params?: PaymentHistoryQueryParams) => Promise<void>;
  getPayment: (paymentId: string) => Promise<ApiResponse<PaymentResponse>>;
  
  // Payment methods
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string, setAsDefault?: boolean) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  
  // Utility methods
  clearError: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for payment operations
 * Provides payment processing, history management, and payment method handling
 */
export const usePayments = (): UsePaymentsReturn => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    paymentHistory: null,
    paymentMethods: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Process subscription purchase
   */
  const processSubscriptionPurchase = useCallback(async (
    subscriptionPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.processSubscriptionPurchase(
        subscriptionPlanId,
        paymentMethodId
      );

      if (!response.success && response.error) {
        setError(paymentService['transformPaymentError'](response.error));
      }

      return response;
    } catch (error: any) {
      const errorMessage = paymentService['transformPaymentError'](error);
      setError(errorMessage);
      
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: errorMessage,
          code: 'PAYMENT_PROCESSING_ERROR',
        },
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Process credit purchase
   */
  const processCreditPurchase = useCallback(async (
    creditPlanId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.processCreditPurchase(
        creditPlanId,
        paymentMethodId
      );

      if (!response.success && response.error) {
        setError(paymentService['transformPaymentError'](response.error));
      }

      return response;
    } catch (error: any) {
      const errorMessage = paymentService['transformPaymentError'](error);
      setError(errorMessage);
      
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: errorMessage,
          code: 'PAYMENT_PROCESSING_ERROR',
        },
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Confirm payment after client-side processing
   */
  const confirmPayment = useCallback(async (
    paymentIntentId: string
  ): Promise<ApiResponse<PaymentConfirmationResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.confirmPayment(paymentIntentId);

      if (!response.success && response.error) {
        setError(paymentService['transformPaymentError'](response.error));
      }

      return response;
    } catch (error: any) {
      const errorMessage = paymentService['transformPaymentError'](error);
      setError(errorMessage);
      
      return {
        success: false,
        data: {} as PaymentConfirmationResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: errorMessage,
          code: 'PAYMENT_CONFIRMATION_ERROR',
        },
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Retry a failed payment
   */
  const retryPayment = useCallback(async (
    paymentId: string,
    paymentMethodId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.retryPayment(paymentId, paymentMethodId);

      if (!response.success && response.error) {
        setError(paymentService['transformPaymentError'](response.error));
      }

      return response;
    } catch (error: any) {
      const errorMessage = paymentService['transformPaymentError'](error);
      setError(errorMessage);
      
      return {
        success: false,
        data: {} as PaymentIntentResponse,
        error: {
          type: 'PAYMENT_ERROR' as any,
          message: errorMessage,
          code: 'PAYMENT_RETRY_ERROR',
        },
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Load payment history
   */
  const loadPaymentHistory = useCallback(async (
    params?: PaymentHistoryQueryParams
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPaymentHistory(params);

      if (response.success) {
        setState(prev => ({
          ...prev,
          paymentHistory: response.data.payments,
        }));
      } else if (response.error) {
        setError(response.error.message || 'Failed to load payment history');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Get specific payment details
   */
  const getPayment = useCallback(async (
    paymentId: string
  ): Promise<ApiResponse<PaymentResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPayment(paymentId);

      if (!response.success && response.error) {
        setError(response.error.message || 'Failed to load payment details');
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load payment details';
      setError(errorMessage);
      
      return {
        success: false,
        data: {} as PaymentResponse,
        error: {
          type: 'API_ERROR' as any,
          message: errorMessage,
          code: 'PAYMENT_FETCH_ERROR',
        },
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Load payment methods
   */
  const loadPaymentMethods = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPaymentMethods();

      if (response.success) {
        setState(prev => ({
          ...prev,
          paymentMethods: response.data.paymentMethods,
        }));
      } else if (response.error) {
        setError(response.error.message || 'Failed to load payment methods');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Add new payment method
   */
  const addPaymentMethod = useCallback(async (
    paymentMethodId: string,
    setAsDefault: boolean = false
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.addPaymentMethod(paymentMethodId, setAsDefault);

      if (response.success) {
        // Refresh payment methods list
        await loadPaymentMethods();
        return true;
      } else if (response.error) {
        setError(response.error.message || 'Failed to add payment method');
        return false;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message || 'Failed to add payment method');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, loadPaymentMethods]);

  /**
   * Remove payment method
   */
  const removePaymentMethod = useCallback(async (
    paymentMethodId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.removePaymentMethod(paymentMethodId);

      if (response.success) {
        // Refresh payment methods list
        await loadPaymentMethods();
        return true;
      } else if (response.error) {
        setError(response.error.message || 'Failed to remove payment method');
        return false;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message || 'Failed to remove payment method');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, loadPaymentMethods]);

  /**
   * Set default payment method
   */
  const setDefaultPaymentMethod = useCallback(async (
    paymentMethodId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.setDefaultPaymentMethod(paymentMethodId);

      if (response.success) {
        // Refresh payment methods list
        await loadPaymentMethods();
        return true;
      } else if (response.error) {
        setError(response.error.message || 'Failed to set default payment method');
        return false;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message || 'Failed to set default payment method');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, loadPaymentMethods]);

  /**
   * Refresh all payment data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadPaymentHistory(),
      loadPaymentMethods(),
    ]);
  }, [loadPaymentHistory, loadPaymentMethods]);

  return {
    state,
    processSubscriptionPurchase,
    processCreditPurchase,
    confirmPayment,
    retryPayment,
    loadPaymentHistory,
    getPayment,
    loadPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    clearError,
    refreshData,
  };
};

export default usePayments;
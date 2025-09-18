import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditPlan,
  CreditBalance,
  CreditTransaction,
  ExpiringCredit,
  CreditPlansResponse,
  CreditBalancesResponse,
  CreditTransactionsResponse,
  ExpiringCreditsResponse,
  PaymentConfirmationResponse,
  CreditEligibility,
  ApiError,
  PaymentHistoryQueryParams,
} from '../types/api';
import { creditService } from '../services/api/creditService';

export interface UseCreditsState {
  // Data
  creditPlans: CreditPlan[];
  creditBalances: CreditBalance[];
  creditTransactions: CreditTransaction[];
  expiringCredits: ExpiringCredit[];
  currentBalance: CreditBalance | null;
  totalAvailableCredits: number;
  
  // Loading states
  isLoading: boolean;
  isLoadingPlans: boolean;
  isLoadingBalances: boolean;
  isLoadingTransactions: boolean;
  isPurchasing: boolean;
  isCheckingEligibility: boolean;
  isUsingCredits: boolean;
  
  // Error states
  error: ApiError | null;
  purchaseError: ApiError | null;
  eligibilityError: ApiError | null;
  usageError: ApiError | null;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface UseCreditsActions {
  // Data fetching
  fetchCreditPlans: (brandId: string) => Promise<void>;
  fetchCreditBalances: (refresh?: boolean) => Promise<void>;
  fetchCreditBalance: (brandId: string) => Promise<void>;
  fetchCreditTransactions: (params?: PaymentHistoryQueryParams, refresh?: boolean) => Promise<void>;
  fetchCreditTransactionsByBrand: (brandId: string, params?: PaymentHistoryQueryParams) => Promise<void>;
  fetchExpiringCredits: (days?: number) => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
  fetchPurchaseHistory: () => Promise<void>;
  
  // Credit management
  purchaseCredits: (planId: string, paymentMethodId?: string) => Promise<PaymentConfirmationResponse | null>;
  useCredits: (sessionId: string, brandId: string, creditsToUse: number) => Promise<boolean>;
  
  // Eligibility checking
  checkCreditEligibility: (sessionId: string, brandId: string) => Promise<CreditEligibility | null>;
  hasSufficientCredits: (sessionId: string, brandId: string, requiredCredits?: number) => Promise<boolean>;
  
  // Utility functions
  getCreditBalanceForBrand: (brandId: string) => CreditBalance | null;
  getAvailableCreditsForBrand: (brandId: string) => number;
  getExpiringCreditsForBrand: (brandId: string) => ExpiringCredit | null;
  getTotalCreditsExpiringSoon: (days?: number) => number;
  getTransactionsByType: (type: CreditTransaction['type']) => CreditTransaction[];
  
  // State management
  clearError: () => void;
  clearPurchaseError: () => void;
  clearEligibilityError: () => void;
  clearUsageError: () => void;
  reset: () => void;
  loadMore: () => Promise<void>;
}

export interface UseCreditsReturn extends UseCreditsState, UseCreditsActions {}

const initialState: UseCreditsState = {
  creditPlans: [],
  creditBalances: [],
  creditTransactions: [],
  expiringCredits: [],
  currentBalance: null,
  totalAvailableCredits: 0,
  isLoading: false,
  isLoadingPlans: false,
  isLoadingBalances: false,
  isLoadingTransactions: false,
  isPurchasing: false,
  isCheckingEligibility: false,
  isUsingCredits: false,
  error: null,
  purchaseError: null,
  eligibilityError: null,
  usageError: null,
  hasMore: false,
  currentPage: 1,
  totalPages: 1,
};

export const useCredits = (): UseCreditsReturn => {
  const [state, setState] = useState<UseCreditsState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseCreditsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error functions
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const clearPurchaseError = useCallback(() => {
    updateState({ purchaseError: null });
  }, [updateState]);

  const clearEligibilityError = useCallback(() => {
    updateState({ eligibilityError: null });
  }, [updateState]);

  const clearUsageError = useCallback(() => {
    updateState({ usageError: null });
  }, [updateState]);

  // Reset all state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Fetch credit plans for a brand
  const fetchCreditPlans = useCallback(async (brandId: string) => {
    updateState({ isLoadingPlans: true, error: null });

    try {
      const response = await creditService.getCreditPlans(brandId);
console.log(response);

      if (response.success && response.data?.data) {
        updateState({
          creditPlans: response.data.data.creditPlans || [],
          isLoadingPlans: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingPlans: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingPlans: false,
      });
    }
  }, [updateState]);

  // Fetch credit balances
  const fetchCreditBalances = useCallback(async (refresh = false) => {
    updateState({ isLoadingBalances: true, error: null });

    try {
      const response = await creditService.getCreditBalances();

      if (response.success && response.data) {
        const balances = response.data.balances || [];
        const totalCredits = balances.reduce(
          (total, balance) => total + balance.availableCredits,
          0
        );

        updateState({
          creditBalances: balances,
          totalAvailableCredits: totalCredits,
          isLoadingBalances: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingBalances: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingBalances: false,
      });
    }
  }, [updateState]);

  // Fetch credit balance for specific brand
  const fetchCreditBalance = useCallback(async (brandId: string) => {
    updateState({ isLoading: true, error: null });

    try {
      const response = await creditService.getCreditBalance(brandId);

      if (response.success && response.data) {
        updateState({
          currentBalance: response.data.balance,
          isLoading: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoading: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoading: false,
      });
    }
  }, [updateState]);

  // Fetch credit transactions
  const fetchCreditTransactions = useCallback(async (
    params?: PaymentHistoryQueryParams,
    refresh = false
  ) => {
    if (state.isLoadingTransactions && !refresh) return;

    updateState({ 
      isLoadingTransactions: true, 
      error: null,
      ...(refresh && { currentPage: 1 })
    });

    try {
      const queryParams = {
        ...params,
        page: refresh ? 1 : state.currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const response = await creditService.getCreditTransactions(queryParams);

      if (response.success && response.data) {
        const newTransactions = response.data.transactions || [];
        
        updateState({
          creditTransactions: refresh ? newTransactions : [...state.creditTransactions, ...newTransactions],
          hasMore: response.data.pagination ? 
            response.data.pagination.currentPage < response.data.pagination.totalPages : false,
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          isLoadingTransactions: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingTransactions: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingTransactions: false,
      });
    }
  }, [state.isLoadingTransactions, state.currentPage, state.creditTransactions, updateState]);

  // Fetch credit transactions by brand
  const fetchCreditTransactionsByBrand = useCallback(async (
    brandId: string,
    params?: PaymentHistoryQueryParams
  ) => {
    updateState({ isLoadingTransactions: true, error: null });

    try {
      const response = await creditService.getCreditTransactionsByBrand(brandId, params);

      if (response.success && response.data) {
        updateState({
          creditTransactions: response.data.transactions || [],
          isLoadingTransactions: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingTransactions: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingTransactions: false,
      });
    }
  }, [updateState]);

  // Fetch expiring credits
  const fetchExpiringCredits = useCallback(async (days = 30) => {
    updateState({ isLoading: true, error: null });

    try {
      const response = await creditService.getExpiringCredits(days);

      if (response.success && response.data) {
        updateState({
          expiringCredits: response.data.expiringCredits || [],
          isLoading: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoading: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoading: false,
      });
    }
  }, [updateState]);

  // Fetch recent transactions
  const fetchRecentTransactions = useCallback(async () => {
    updateState({ isLoadingTransactions: true, error: null });

    try {
      const response = await creditService.getRecentTransactions();

      if (response.success && response.data) {
        updateState({
          creditTransactions: response.data.transactions || [],
          isLoadingTransactions: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingTransactions: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingTransactions: false,
      });
    }
  }, [updateState]);

  // Fetch purchase history
  const fetchPurchaseHistory = useCallback(async () => {
    updateState({ isLoadingTransactions: true, error: null });

    try {
      const response = await creditService.getPurchaseHistory();

      if (response.success && response.data) {
        updateState({
          creditTransactions: response.data.transactions || [],
          isLoadingTransactions: false,
        });
      } else {
        updateState({
          error: response.error || null,
          isLoadingTransactions: false,
        });
      }
    } catch (error) {
      updateState({
        error: error as ApiError,
        isLoadingTransactions: false,
      });
    }
  }, [updateState]);

  // Purchase credits
  const purchaseCredits = useCallback(async (
    planId: string,
    paymentMethodId?: string
  ): Promise<PaymentConfirmationResponse | null> => {
    updateState({ isPurchasing: true, purchaseError: null });

    try {
      const response = await creditService.purchaseCredits(planId, paymentMethodId);

      if (response.success && response.data) {
        // Refresh balances after successful purchase
        await fetchCreditBalances(true);
        
        updateState({ isPurchasing: false });
        return response.data;
      } else {
        updateState({
          purchaseError: response.error || null,
          isPurchasing: false,
        });
        return null;
      }
    } catch (error) {
      updateState({
        purchaseError: error as ApiError,
        isPurchasing: false,
      });
      return null;
    }
  }, [updateState, fetchCreditBalances]);

  // Use credits for booking
  const useCredits = useCallback(async (
    sessionId: string,
    brandId: string,
    creditsToUse: number
  ): Promise<boolean> => {
    updateState({ isUsingCredits: true, usageError: null });

    try {
      const response = await creditService.useCredits(sessionId, brandId, creditsToUse);

      if (response.success && response.data) {
        // Update local balance
        const updatedBalance = response.data.remainingBalance;
        updateState({
          creditBalances: state.creditBalances.map(balance =>
            balance.brand._id === brandId ? updatedBalance : balance
          ),
          totalAvailableCredits: state.totalAvailableCredits - creditsToUse,
          creditTransactions: [response.data.transaction, ...state.creditTransactions],
          isUsingCredits: false,
        });
        return true;
      } else {
        updateState({
          usageError: response.error || null,
          isUsingCredits: false,
        });
        return false;
      }
    } catch (error) {
      updateState({
        usageError: error as ApiError,
        isUsingCredits: false,
      });
      return false;
    }
  }, [state.creditBalances, state.totalAvailableCredits, state.creditTransactions, updateState]);

  // Check credit eligibility
  const checkCreditEligibility = useCallback(async (
    sessionId: string,
    brandId: string
  ): Promise<CreditEligibility | null> => {
    updateState({ isCheckingEligibility: true, eligibilityError: null });

    try {
      const response = await creditService.checkCreditEligibility(sessionId, brandId);

      if (response.success && response.data) {
        updateState({ isCheckingEligibility: false });
        return response.data;
      } else {
        updateState({
          eligibilityError: response.error || null,
          isCheckingEligibility: false,
        });
        return null;
      }
    } catch (error) {
      updateState({
        eligibilityError: error as ApiError,
        isCheckingEligibility: false,
      });
      return null;
    }
  }, [updateState]);

  // Check if user has sufficient credits
  const hasSufficientCredits = useCallback(async (
    sessionId: string,
    brandId: string,
    requiredCredits = 1
  ): Promise<boolean> => {
    try {
      return await creditService.hasSufficientCredits(sessionId, brandId, requiredCredits);
    } catch (error) {
      return false;
    }
  }, []);

  // Load more transactions
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoadingTransactions) return;
    
    updateState({ currentPage: state.currentPage + 1 });
    await fetchCreditTransactions(undefined, false);
  }, [state.hasMore, state.isLoadingTransactions, state.currentPage, updateState, fetchCreditTransactions]);

  // Utility functions
  const getCreditBalanceForBrand = useCallback((brandId: string): CreditBalance | null => {
    return state.creditBalances.find(balance => balance.brand._id === brandId) || null;
  }, [state.creditBalances]);

  const getAvailableCreditsForBrand = useCallback((brandId: string): number => {
    const balance = getCreditBalanceForBrand(brandId);
    return balance ? balance.availableCredits : 0;
  }, [getCreditBalanceForBrand]);

  const getExpiringCreditsForBrand = useCallback((brandId: string): ExpiringCredit | null => {
    return state.expiringCredits.find(credit => credit.brand._id === brandId) || null;
  }, [state.expiringCredits]);

  const getTotalCreditsExpiringSoon = useCallback((days = 7): number => {
    return state.expiringCredits
      .filter(credit => credit.daysUntilExpiry <= days)
      .reduce((total, credit) => total + credit.credits, 0);
  }, [state.expiringCredits]);

  const getTransactionsByType = useCallback((type: CreditTransaction['type']): CreditTransaction[] => {
    return state.creditTransactions.filter(transaction => transaction.type === type);
  }, [state.creditTransactions]);

  return {
    // State
    ...state,
    
    // Actions
    fetchCreditPlans,
    fetchCreditBalances,
    fetchCreditBalance,
    fetchCreditTransactions,
    fetchCreditTransactionsByBrand,
    fetchExpiringCredits,
    fetchRecentTransactions,
    fetchPurchaseHistory,
    purchaseCredits,
    useCredits,
    checkCreditEligibility,
    hasSufficientCredits,
    getCreditBalanceForBrand,
    getAvailableCreditsForBrand,
    getExpiringCreditsForBrand,
    getTotalCreditsExpiringSoon,
    getTransactionsByType,
    clearError,
    clearPurchaseError,
    clearEligibilityError,
    clearUsageError,
    reset,
    loadMore,
  };
};

export default useCredits;
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionsResponse,
  SubscriptionPlansResponse,
  PaymentConfirmationResponse,
  BookingEligibility,
  ApiError,
} from "../types/api";
import { subscriptionService } from "../services/api/subscriptionService";

export interface UseSubscriptionsState {
  // Data
  subscriptions: Subscription[];
  activeSubscriptions: Subscription[];
  subscriptionHistory: Subscription[];
  subscriptionPlans: SubscriptionPlan[];
  currentSubscription: Subscription | null;

  // Loading states
  isLoading: boolean;
  isLoadingPlans: boolean;
  isLoadingSubscriptions: boolean;
  isPurchasing: boolean;
  isCancelling: boolean;
  isCheckingEligibility: boolean;

  // Error states
  error: ApiError | null;
  purchaseError: ApiError | null;
  cancellationError: ApiError | null;
  eligibilityError: ApiError | null;

  // Pagination
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface UseSubscriptionsActions {
  // Data fetching
  fetchSubscriptions: (refresh?: boolean) => Promise<void>;
  fetchActiveSubscriptions: () => Promise<void>;
  fetchSubscriptionHistory: () => Promise<void>;
  fetchSubscriptionPlans: (brandId: string) => Promise<void>;
  fetchSubscription: (subscriptionId: string) => Promise<void>;

  // Subscription management
  purchaseSubscription: (
    planId: string,
    paymentMethodId?: string
  ) => Promise<PaymentConfirmationResponse | null>;
  cancelSubscription: (
    subscriptionId: string,
    reason?: string
  ) => Promise<boolean>;
  reactivateSubscription: (subscriptionId: string) => Promise<boolean>;
  updateAutoRenewal: (
    subscriptionId: string,
    autoRenew: boolean
  ) => Promise<boolean>;

  // Eligibility checking
  checkBookingEligibility: (
    sessionId: string,
    subscriptionId?: string
  ) => Promise<BookingEligibility | null>;
  hasActiveSubscriptionForBrand: (brandId: string) => Promise<boolean>;

  // Utility functions
  getSubscriptionsByBrand: (brandId: string) => Subscription[];
  getActiveSubscriptionForBrand: (brandId: string) => Subscription | null;
  isSubscriptionActive: (subscription: Subscription) => boolean;
  isSubscriptionExpiringSoon: (
    subscription: Subscription,
    days?: number
  ) => boolean;

  // State management
  clearError: () => void;
  clearPurchaseError: () => void;
  clearCancellationError: () => void;
  clearEligibilityError: () => void;
  reset: () => void;
  loadMore: () => Promise<void>;
}

export interface UseSubscriptionsReturn
  extends UseSubscriptionsState,
    UseSubscriptionsActions {}

const initialState: UseSubscriptionsState = {
  subscriptions: [],
  activeSubscriptions: [],
  subscriptionHistory: [],
  subscriptionPlans: [],
  currentSubscription: null,
  isLoading: false,
  isLoadingPlans: false,
  isLoadingSubscriptions: false,
  isPurchasing: false,
  isCancelling: false,
  isCheckingEligibility: false,
  error: null,
  purchaseError: null,
  cancellationError: null,
  eligibilityError: null,
  hasMore: false,
  currentPage: 1,
  totalPages: 1,
};

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [state, setState] = useState<UseSubscriptionsState>(initialState);
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
  const updateState = useCallback((updates: Partial<UseSubscriptionsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear error functions
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const clearPurchaseError = useCallback(() => {
    updateState({ purchaseError: null });
  }, [updateState]);

  const clearCancellationError = useCallback(() => {
    updateState({ cancellationError: null });
  }, [updateState]);

  const clearEligibilityError = useCallback(() => {
    updateState({ eligibilityError: null });
  }, [updateState]);

  // Reset all state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Fetch user subscriptions
  const fetchSubscriptions = useCallback(
    async (refresh = false) => {
      if (state.isLoadingSubscriptions && !refresh) return;

      updateState({
        isLoadingSubscriptions: true,
        error: null,
        ...(refresh && { currentPage: 1 }),
      });

      try {
        const response = await subscriptionService.getUserSubscriptions({
          page: refresh ? 1 : state.currentPage,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        if (response.success && response.data) {
          const newSubscriptions = response.data.subscriptions || [];

          updateState({
            subscriptions: refresh
              ? newSubscriptions
              : [...state.subscriptions, ...newSubscriptions],
            hasMore:
              response.data.pagination.currentPage <
              response.data.pagination.totalPages,
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            isLoadingSubscriptions: false,
          });
        } else {
          updateState({
            error: response.error || null,
            isLoadingSubscriptions: false,
          });
        }
      } catch (error) {
        updateState({
          error: error as ApiError,
          isLoadingSubscriptions: false,
        });
      }
    },
    [
      state.isLoadingSubscriptions,
      state.currentPage,
      state.subscriptions,
      updateState,
    ]
  );

  // Fetch active subscriptions
  const fetchActiveSubscriptions = useCallback(async () => {
    updateState({ isLoading: true, error: null });

    try {
      const response = await subscriptionService.getActiveSubscriptions();

      if (response.success && response.data) {
        updateState({
          activeSubscriptions: response.data.subscriptions || [],
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

  // Fetch subscription history
  const fetchSubscriptionHistory = useCallback(async () => {
    updateState({ isLoading: true, error: null });

    try {
      const response = await subscriptionService.getSubscriptionHistory();

      if (response.success && response.data) {
        updateState({
          subscriptionHistory: response.data.subscriptions || [],
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

  // Fetch subscription plans for a brand
  const fetchSubscriptionPlans = useCallback(
    async (brandId: string) => {
      updateState({ isLoadingPlans: true, error: null });

      try {
        const response = await subscriptionService.getSubscriptionPlans(
          brandId
        );

        if (response.success && response.data?.data) {
          updateState({
            subscriptionPlans: response.data.data.subscriptionPlans || [],
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
    },
    [updateState]
  );

  // Fetch specific subscription
  const fetchSubscription = useCallback(
    async (subscriptionId: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const response = await subscriptionService.getSubscription(
          subscriptionId
        );

        if (response.success && response.data) {
          updateState({
            currentSubscription: response.data.subscription,
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
    },
    [updateState]
  );

  // Purchase subscription
  const purchaseSubscription = useCallback(
    async (
      planId: string,
      paymentMethodId?: string
    ): Promise<PaymentConfirmationResponse | null> => {
      updateState({ isPurchasing: true, purchaseError: null });

      try {
        const response = await subscriptionService.purchaseSubscription(
          planId,
          paymentMethodId
        );

        if (response.success && response.data) {
          // Refresh subscriptions after successful purchase
          await fetchActiveSubscriptions();

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
    },
    [updateState, fetchActiveSubscriptions]
  );

  // Cancel subscription
  const cancelSubscription = useCallback(
    async (subscriptionId: string, reason?: string): Promise<boolean> => {
      updateState({ isCancelling: true, cancellationError: null });

      try {
        const response = await subscriptionService.cancelSubscription(
          subscriptionId,
          reason
        );

        if (response.success) {
          // Update local state
          updateState({
            subscriptions: state.subscriptions.map((sub) =>
              sub._id === subscriptionId
                ? { ...sub, status: "cancelled" as const }
                : sub
            ),
            activeSubscriptions: state.activeSubscriptions.filter(
              (sub) => sub._id !== subscriptionId
            ),
            isCancelling: false,
          });
          return true;
        } else {
          updateState({
            cancellationError: response.error || null,
            isCancelling: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          cancellationError: error as ApiError,
          isCancelling: false,
        });
        return false;
      }
    },
    [state.subscriptions, state.activeSubscriptions, updateState]
  );

  // Reactivate subscription
  const reactivateSubscription = useCallback(
    async (subscriptionId: string): Promise<boolean> => {
      updateState({ isLoading: true, error: null });

      try {
        const response = await subscriptionService.reactivateSubscription(
          subscriptionId
        );

        if (response.success && response.data) {
          // Update local state
          const updatedSubscription = response.data.subscription;
          updateState({
            subscriptions: state.subscriptions.map((sub) =>
              sub._id === subscriptionId ? updatedSubscription : sub
            ),
            activeSubscriptions: [
              ...state.activeSubscriptions,
              updatedSubscription,
            ],
            isLoading: false,
          });
          return true;
        } else {
          updateState({
            error: response.error || null,
            isLoading: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error as ApiError,
          isLoading: false,
        });
        return false;
      }
    },
    [state.subscriptions, state.activeSubscriptions, updateState]
  );

  // Update auto renewal
  const updateAutoRenewal = useCallback(
    async (subscriptionId: string, autoRenew: boolean): Promise<boolean> => {
      updateState({ isLoading: true, error: null });

      try {
        const response = await subscriptionService.updateAutoRenewal(
          subscriptionId,
          autoRenew
        );

        if (response.success && response.data) {
          // Update local state
          const updatedSubscription = response.data.subscription;
          updateState({
            subscriptions: state.subscriptions.map((sub) =>
              sub._id === subscriptionId ? updatedSubscription : sub
            ),
            activeSubscriptions: state.activeSubscriptions.map((sub) =>
              sub._id === subscriptionId ? updatedSubscription : sub
            ),
            isLoading: false,
          });
          return true;
        } else {
          updateState({
            error: response.error || null,
            isLoading: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error as ApiError,
          isLoading: false,
        });
        return false;
      }
    },
    [state.subscriptions, state.activeSubscriptions, updateState]
  );

  // Check booking eligibility
  const checkBookingEligibility = useCallback(
    async (
      sessionId: string,
      subscriptionId?: string
    ): Promise<BookingEligibility | null> => {
      updateState({ isCheckingEligibility: true, eligibilityError: null });

      try {
        const response = await subscriptionService.checkBookingEligibility(
          sessionId,
          subscriptionId
        );

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
    },
    [updateState]
  );

  // Check if user has active subscription for brand
  const hasActiveSubscriptionForBrand = useCallback(
    async (brandId: string): Promise<boolean> => {
      try {
        return await subscriptionService.hasActiveSubscriptionForBrand(brandId);
      } catch (error) {
        return false;
      }
    },
    []
  );

  // Load more subscriptions
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoadingSubscriptions) return;

    updateState({ currentPage: state.currentPage + 1 });
    await fetchSubscriptions(false);
  }, [
    state.hasMore,
    state.isLoadingSubscriptions,
    state.currentPage,
    updateState,
    fetchSubscriptions,
  ]);

  // Utility functions
  const getSubscriptionsByBrand = useCallback(
    (brandId: string): Subscription[] => {
      return state.subscriptions.filter((sub) =>
        sub.plan.includedClasses.some((cls) => cls.brand._id === brandId)
      );
    },
    [state.subscriptions]
  );

  const getActiveSubscriptionForBrand = useCallback(
    (brandId: string): Subscription | null => {
      return (
        state.activeSubscriptions.find(
          (sub) =>
            sub.status === "active" &&
            sub.plan.includedClasses.some((cls) => cls.brand._id === brandId)
        ) || null
      );
    },
    [state.activeSubscriptions]
  );

  const isSubscriptionActive = useCallback(
    (subscription: Subscription): boolean => {
      return (
        subscription.status === "active" &&
        (!subscription.endDate || new Date(subscription.endDate) > new Date())
      );
    },
    []
  );

  const isSubscriptionExpiringSoon = useCallback(
    (subscription: Subscription, days = 7): boolean => {
      if (!subscription.endDate || subscription.status !== "active")
        return false;

      const expiryDate = new Date(subscription.endDate);
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + days);

      return expiryDate <= warningDate;
    },
    []
  );

  return {
    // State
    ...state,

    // Actions
    fetchSubscriptions,
    fetchActiveSubscriptions,
    fetchSubscriptionHistory,
    fetchSubscriptionPlans,
    fetchSubscription,
    purchaseSubscription,
    cancelSubscription,
    reactivateSubscription,
    updateAutoRenewal,
    checkBookingEligibility,
    hasActiveSubscriptionForBrand,
    getSubscriptionsByBrand,
    getActiveSubscriptionForBrand,
    isSubscriptionActive,
    isSubscriptionExpiringSoon,
    clearError,
    clearPurchaseError,
    clearCancellationError,
    clearEligibilityError,
    reset,
    loadMore,
  };
};

export default useSubscriptions;

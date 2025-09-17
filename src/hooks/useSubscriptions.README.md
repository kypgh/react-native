# useSubscriptions Hook

A comprehensive React hook for managing subscription state and operations in the React Native booking app.

## Features

### State Management
- **Subscription Data**: Active subscriptions, history, and current subscription details
- **Plan Data**: Available subscription plans for brands
- **Loading States**: Granular loading indicators for different operations
- **Error Handling**: Separate error states for different operations
- **Pagination**: Support for paginated subscription lists

### Operations
- **Data Fetching**: Fetch subscriptions, plans, and individual subscription details
- **Purchase Flow**: Complete subscription purchase with payment processing
- **Subscription Management**: Cancel, reactivate, and update auto-renewal settings
- **Eligibility Checking**: Verify booking eligibility based on subscription status
- **Utility Functions**: Helper functions for subscription status and brand filtering

## Usage

```typescript
import { useSubscriptions } from '../hooks/useSubscriptions';

function SubscriptionScreen() {
  const {
    // State
    subscriptions,
    activeSubscriptions,
    subscriptionPlans,
    isLoading,
    isPurchasing,
    error,
    
    // Actions
    fetchActiveSubscriptions,
    fetchSubscriptionPlans,
    purchaseSubscription,
    cancelSubscription,
    checkBookingEligibility,
    
    // Utilities
    getActiveSubscriptionForBrand,
    isSubscriptionActive,
    isSubscriptionExpiringSoon,
  } = useSubscriptions();

  useEffect(() => {
    fetchActiveSubscriptions();
  }, []);

  const handlePurchase = async (planId: string) => {
    const result = await purchaseSubscription(planId);
    if (result) {
      console.log('Purchase successful:', result);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    const success = await cancelSubscription(subscriptionId, 'No longer needed');
    if (success) {
      console.log('Subscription cancelled');
    }
  };

  return (
    // Your component JSX
  );
}
```

## State Structure

```typescript
interface UseSubscriptionsState {
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
```

## Key Methods

### Data Fetching
- `fetchSubscriptions(refresh?)` - Fetch user subscriptions with pagination
- `fetchActiveSubscriptions()` - Fetch only active subscriptions
- `fetchSubscriptionHistory()` - Fetch subscription history
- `fetchSubscriptionPlans(brandId)` - Fetch plans for a specific brand
- `fetchSubscription(subscriptionId)` - Fetch specific subscription details

### Subscription Management
- `purchaseSubscription(planId, paymentMethodId?)` - Purchase a subscription plan
- `cancelSubscription(subscriptionId, reason?)` - Cancel an active subscription
- `reactivateSubscription(subscriptionId)` - Reactivate a cancelled subscription
- `updateAutoRenewal(subscriptionId, autoRenew)` - Update auto-renewal setting

### Eligibility & Utilities
- `checkBookingEligibility(sessionId, subscriptionId?)` - Check if user can book a session
- `hasActiveSubscriptionForBrand(brandId)` - Check if user has active subscription for brand
- `getSubscriptionsByBrand(brandId)` - Get all subscriptions for a specific brand
- `getActiveSubscriptionForBrand(brandId)` - Get active subscription for a brand
- `isSubscriptionActive(subscription)` - Check if subscription is currently active
- `isSubscriptionExpiringSoon(subscription, days?)` - Check if subscription expires soon

### Error Management
- `clearError()` - Clear general error state
- `clearPurchaseError()` - Clear purchase-specific error
- `clearCancellationError()` - Clear cancellation-specific error
- `clearEligibilityError()` - Clear eligibility check error
- `reset()` - Reset all state to initial values

## Error Handling

The hook provides granular error handling with separate error states for different operations:
- `error` - General API errors
- `purchaseError` - Subscription purchase errors
- `cancellationError` - Subscription cancellation errors
- `eligibilityError` - Booking eligibility check errors

## Pagination Support

The hook supports paginated loading of subscriptions:
- `hasMore` - Indicates if more data is available
- `currentPage` - Current page number
- `totalPages` - Total number of pages
- `loadMore()` - Load next page of subscriptions

## Testing

Unit tests are provided in `__tests__/useSubscriptions.test.ts` covering:
- All hook methods and state updates
- Error scenarios and error handling
- Pagination functionality
- Utility functions
- State management and cleanup

## Requirements Fulfilled

This hook implementation satisfies requirement **4.4** from the specification:
- Complete subscription state management for the React Native app
- Integration with subscription service for all operations
- Proper error handling and loading states
- Utility functions for subscription status checking
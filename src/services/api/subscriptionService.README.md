# Subscription Service

This service handles all subscription-related API operations for the React Native booking app.

## Features

### Core Functionality
- **Plan Browsing**: Fetch available subscription plans for brands
- **Purchase Management**: Create payment intents and confirm subscription purchases
- **Status Tracking**: Monitor subscription status, billing dates, and auto-renewal settings
- **Cancellation**: Cancel active subscriptions with optional reason
- **Eligibility Checking**: Verify booking eligibility based on subscription status

### API Endpoints Covered
- `GET /api/client/discovery/brands/{brandId}/subscription-plans` - Get subscription plans
- `GET /api/client/subscriptions` - Get user subscriptions with filtering
- `GET /api/client/subscriptions/{subscriptionId}` - Get specific subscription
- `POST /api/client/subscriptions/payment-intent` - Create payment intent
- `POST /api/client/subscriptions/confirm-payment` - Confirm payment
- `POST /api/client/subscriptions/{subscriptionId}/cancel` - Cancel subscription
- `POST /api/client/subscriptions/{subscriptionId}/reactivate` - Reactivate subscription
- `PATCH /api/client/subscriptions/{subscriptionId}/auto-renewal` - Update auto-renewal
- `GET /api/client/subscriptions/booking-eligibility` - Check booking eligibility

## Usage

```typescript
import { subscriptionService } from '../services/api/subscriptionService';

// Get subscription plans for a brand
const plansResponse = await subscriptionService.getSubscriptionPlans('brand123');

// Purchase a subscription
const purchaseResponse = await subscriptionService.purchaseSubscription('plan123', 'pm_123');

// Check booking eligibility
const eligibility = await subscriptionService.checkBookingEligibility('session123', 'sub123');

// Cancel subscription
const cancelResponse = await subscriptionService.cancelSubscription('sub123', 'No longer needed');
```

## Error Handling

The service uses the BaseService pattern with automatic retry logic and consistent error handling. All methods return `ApiResponse<T>` objects with success/error states.

## Testing

Unit tests are provided in `__tests__/subscriptionService.test.ts` covering:
- All API methods
- Error scenarios
- Query parameter handling
- Response transformation

## Requirements Fulfilled

This implementation satisfies the following requirements from the specification:
- **4.1**: Subscription plan browsing and purchase methods
- **4.2**: Subscription status tracking and cancellation functionality  
- **4.3**: Booking eligibility checking based on subscription status
- **4.4**: Complete subscription management lifecycle
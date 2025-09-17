# PaymentService Documentation

## Overview

The PaymentService provides comprehensive payment processing integration for the React Native booking app. It handles payment intents, confirmations, transaction history, and integrates with Stripe for secure payment processing.

## Features

- **Payment Intent Creation**: Create payment intents for subscriptions and credits
- **Payment Confirmation**: Confirm payments after client-side processing
- **Transaction History**: Retrieve and manage payment history
- **Payment Methods**: Manage user payment methods
- **Error Handling**: Comprehensive error handling with retry logic
- **Stripe Integration**: Seamless integration with Stripe payment processing

## Architecture

```
PaymentService
├── Payment Intent Management
├── Payment Confirmation
├── Transaction History
├── Payment Methods Management
├── Error Handling & Retry Logic
└── Stripe Integration
```

## API Endpoints

### Payment Intents
- `POST /api/client/payments/subscription/payment-intent` - Create subscription payment intent
- `POST /api/client/payments/credit/payment-intent` - Create credit payment intent

### Payment Confirmation
- `POST /api/client/payments/confirm` - Confirm payment after processing

### Transaction History
- `GET /api/client/payments/history` - Get payment history with filtering
- `GET /api/client/payments/{paymentId}` - Get specific payment details

### Payment Methods
- `GET /api/client/payments/methods` - Get user payment methods
- `POST /api/client/payments/methods` - Add new payment method
- `DELETE /api/client/payments/methods/{methodId}` - Remove payment method
- `POST /api/client/payments/methods/{methodId}/default` - Set default payment method

### Payment Management
- `POST /api/client/payments/{paymentId}/retry` - Retry failed payment
- `POST /api/client/payments/{paymentId}/cancel` - Cancel pending payment

## Usage Examples

### Basic Payment Processing

```typescript
import { paymentService } from '../services/api/paymentService';

// Process subscription purchase
const response = await paymentService.processSubscriptionPurchase(
  'subscription_plan_id',
  'payment_method_id' // optional
);

if (response.success) {
  console.log('Payment successful:', response.data);
} else if (response.error?.code === 'REQUIRES_ACTION') {
  // Handle additional authentication required
  const paymentIntent = response.data.paymentIntent;
  // Use Stripe to handle authentication
} else {
  console.error('Payment failed:', response.error);
}
```

### Using with React Hook

```typescript
import { usePayments } from '../hooks/usePayments';

const MyComponent = () => {
  const { 
    processSubscriptionPurchase, 
    processCreditPurchase,
    state 
  } = usePayments();

  const handlePurchase = async () => {
    const result = await processSubscriptionPurchase('plan_id');
    if (result.success) {
      // Handle success
    }
  };

  return (
    <Button 
      onPress={handlePurchase}
      loading={state.isLoading}
      disabled={state.isLoading}
    />
  );
};
```

### Stripe Integration

```typescript
import { useStripePayment } from '../utils/stripeUtils';
import { usePayments } from '../hooks/usePayments';

const PaymentComponent = () => {
  const { confirmPaymentIntent } = useStripePayment();
  const { processSubscriptionPurchase, confirmPayment } = usePayments();

  const handlePayment = async () => {
    // Step 1: Create payment intent
    const response = await processSubscriptionPurchase('plan_id');
    
    if (response.error?.code === 'REQUIRES_ACTION') {
      // Step 2: Handle authentication with Stripe
      const confirmResult = await confirmPaymentIntent(
        response.data.paymentIntent.clientSecret
      );
      
      if (confirmResult.success) {
        // Step 3: Confirm with backend
        await confirmPayment(confirmResult.paymentIntent.id);
      }
    }
  };
};
```

## Error Handling

The PaymentService includes comprehensive error handling:

### Error Types
- **Card Declined**: User's card was declined
- **Insufficient Funds**: Not enough funds in account
- **Authentication Required**: Additional verification needed
- **Processing Error**: Server-side processing error
- **Network Error**: Connection issues

### Error Response Format
```typescript
interface PaymentError {
  type: ApiErrorType;
  paymentErrorType?: PaymentErrorType;
  message: string;
  code: string;
  retryable?: boolean;
  requiresAction?: boolean;
  actionType?: 'authentication' | 'new_payment_method' | 'contact_bank';
}
```

### Retry Logic
The service automatically retries failed requests based on error type:
- Network errors: 3 retries with exponential backoff
- Processing errors: 2 retries with delay
- Authentication errors: No automatic retry (requires user action)

## Payment Flow

### Subscription Purchase Flow
1. **Create Payment Intent**: Call `createSubscriptionPaymentIntent()`
2. **Handle Authentication**: If required, use Stripe to authenticate
3. **Confirm Payment**: Call `confirmPayment()` after successful authentication
4. **Update UI**: Refresh subscription data

### Credit Purchase Flow
1. **Create Payment Intent**: Call `createCreditPaymentIntent()`
2. **Handle Authentication**: If required, use Stripe to authenticate
3. **Confirm Payment**: Call `confirmPayment()` after successful authentication
4. **Update UI**: Refresh credit balance

## Configuration

### Stripe Configuration
```typescript
// In your app initialization
import { StripeProvider } from '../components/StripeProvider';

const App = () => (
  <StripeProvider
    publishableKey="pk_test_..."
    merchantIdentifier="merchant.com.yourapp"
    urlScheme="your-app-scheme"
  >
    <YourApp />
  </StripeProvider>
);
```

### Environment Variables
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Security Considerations

- **Token Security**: All API calls include authentication headers
- **PCI Compliance**: Sensitive card data is handled by Stripe
- **HTTPS Only**: All requests use secure connections
- **Input Validation**: Client-side validation before API calls
- **Error Sanitization**: Sensitive error details are not exposed to users

## Testing

### Manual Testing
1. **Test Cards**: Use Stripe test cards for different scenarios
2. **Error Scenarios**: Test network failures, declined cards, etc.
3. **Authentication**: Test 3D Secure authentication flows
4. **Edge Cases**: Test with expired cards, insufficient funds, etc.

### Test Cards
```typescript
// Successful payment
const successCard = '4242424242424242';

// Requires authentication
const authCard = '4000002500003155';

// Declined card
const declinedCard = '4000000000000002';

// Insufficient funds
const insufficientCard = '4000000000009995';
```

## Performance Optimization

- **Request Deduplication**: Prevents duplicate payment attempts
- **Caching**: Payment methods and history are cached
- **Optimistic Updates**: UI updates optimistically for better UX
- **Background Refresh**: Payment data refreshes in background

## Monitoring and Debugging

### Development Logging
```typescript
// Enable detailed logging in development
if (__DEV__) {
  console.log('Payment request:', paymentData);
  console.log('Payment response:', response);
}
```

### Error Tracking
```typescript
import { PaymentErrorHandler } from '../utils/paymentErrorHandler';

// Log errors for debugging
PaymentErrorHandler.logError(error, 'PaymentService.processPayment');
```

## Migration from Mock Data

When migrating from mock payment data:

1. **Replace Mock Calls**: Replace mock payment functions with PaymentService calls
2. **Update State Management**: Use usePayments hook instead of local state
3. **Add Error Handling**: Implement proper error handling and user feedback
4. **Test Integration**: Thoroughly test with Stripe test environment

## Best Practices

1. **Always Handle Errors**: Provide user-friendly error messages
2. **Show Loading States**: Display loading indicators during payment processing
3. **Validate Input**: Validate payment data before API calls
4. **Secure Storage**: Never store sensitive payment data locally
5. **Test Thoroughly**: Test all payment scenarios including edge cases
6. **Monitor Performance**: Track payment success rates and error patterns

## Troubleshooting

### Common Issues

1. **Stripe Not Initialized**
   - Ensure StripeProvider is properly configured
   - Check publishable key is valid

2. **Payment Intent Creation Fails**
   - Verify API endpoints are correct
   - Check authentication tokens
   - Validate request data

3. **Authentication Required Loop**
   - Ensure proper handling of 3D Secure flow
   - Check Stripe configuration

4. **Network Errors**
   - Implement proper retry logic
   - Check internet connectivity
   - Verify API server status

### Debug Steps
1. Check network requests in debugger
2. Verify Stripe configuration
3. Test with different payment methods
4. Check server logs for API errors
5. Validate authentication tokens
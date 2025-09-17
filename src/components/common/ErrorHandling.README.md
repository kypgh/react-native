# Comprehensive Error Handling System

This document describes the comprehensive error handling system implemented for the React Native booking app. The system provides robust error management, loading states, network connectivity detection, and user-friendly error displays.

## Overview

The error handling system consists of several interconnected components:

1. **Global Error Boundary** - Catches unhandled React errors
2. **Error Context** - Manages application-wide error state
3. **Loading Context** - Manages loading states for operations
4. **Network Service** - Monitors network connectivity
5. **Error Display Components** - User-friendly error presentations
6. **Skeleton Loading Components** - Loading state placeholders
7. **Error Handling Hooks** - Simplified error management for components

## Core Components

### 1. Error Boundary (`ErrorBoundary.tsx`)

Enhanced error boundary that catches unhandled React errors and provides recovery options.

**Features:**
- Automatic network error detection
- Retry functionality with exponential backoff
- Development error details
- Network status monitoring
- Custom fallback components

**Usage:**
```tsx
<ErrorBoundary
  fallback={(error, retry) => <CustomErrorScreen error={error} onRetry={retry} />}
  onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
  enableRetry={true}
  maxRetries={3}
>
  <App />
</ErrorBoundary>
```

### 2. Error Context (`ErrorContext.tsx`)

Centralized error state management with operation-specific error tracking.

**Features:**
- Operation-specific error tracking
- Global error state
- Automatic retry counting
- Error type classification
- Network error creation

**Usage:**
```tsx
// Provider setup
<ErrorProvider maxRetries={3}>
  <App />
</ErrorProvider>

// In components
const { setError, clearError, hasError, getError } = useError();
const { error, setError, clearError, canRetry } = useOperationError('login');
```

### 3. Loading Context (`LoadingContext.tsx`)

Manages loading states for different operations throughout the app.

**Features:**
- Operation-specific loading states
- Global loading state
- Loading messages
- Async operation wrapper

**Usage:**
```tsx
// Provider setup
<LoadingProvider>
  <App />
</LoadingProvider>

// In components
const { startLoading, stopLoading, isLoading } = useLoading();
const { isLoading, withLoading } = useOperationLoading('fetchData');

// Automatic loading management
const result = await withLoading(async () => {
  return await apiCall();
}, 'Fetching data...');
```

### 4. Network Service (`networkService.ts`)

Monitors network connectivity and provides network-aware error handling.

**Features:**
- Real-time connectivity monitoring
- Connection quality assessment
- Network error creation
- Offline detection
- Connection type identification

**Usage:**
```tsx
const { 
  isConnected, 
  isInternetReachable, 
  networkQuality, 
  refreshState 
} = useNetworkState();

// Create network-specific errors
const networkError = networkService.createNetworkError('Custom message');
```

## Error Display Components

### 1. ErrorDisplay (`ErrorDisplay.tsx`)

Comprehensive error display with retry options and detailed information.

**Variants:**
- **Full Display**: Complete error information with actions
- **Compact Display**: Minimal error display for inline use
- **Inline Error**: Simple error message for form fields
- **Error Banner**: Top-of-screen error notification

**Usage:**
```tsx
// Full error display
<ErrorDisplay
  error={apiError}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  showDetails={__DEV__}
/>

// Compact display
<ErrorDisplay error={apiError} compact={true} />

// Inline error
<InlineError error="Email is required" />

// Error banner
<ErrorBanner
  error={networkError}
  onRetry={retryConnection}
  onDismiss={dismissBanner}
/>
```

### 2. NetworkStatus (`NetworkStatus.tsx`)

Displays current network connectivity status with retry options.

**Features:**
- Automatic show/hide based on connectivity
- Connection quality indicators
- Retry functionality
- Customizable appearance

**Usage:**
```tsx
// Auto-hiding network status
<NetworkStatus
  showWhenConnected={false}
  autoHide={true}
  autoHideDelay={3000}
  onRetry={handleNetworkRetry}
/>

// Network status indicator
<NetworkStatusIndicator size="medium" showText={true} />
```

## Skeleton Loading Components

### 1. SkeletonLoader (`SkeletonLoader.tsx`)

Basic skeleton loading components for different UI elements.

**Components:**
- `SkeletonLoader` - Basic rectangular skeleton
- `SkeletonText` - Multi-line text skeleton
- `SkeletonCircle` - Circular skeleton (avatars, icons)
- `SkeletonCard` - Card-like skeleton with image and text
- `SkeletonList` - List of skeleton items

**Usage:**
```tsx
// Basic skeleton
<SkeletonLoader width="100%" height={20} />

// Text skeleton
<SkeletonText lines={3} lineHeight={16} />

// Card skeleton
<SkeletonCard
  showImage={true}
  imageHeight={120}
  showTitle={true}
  showDescription={true}
  descriptionLines={2}
/>
```

### 2. SkeletonScreens (`SkeletonScreens.tsx`)

Pre-built skeleton screens for different app sections.

**Available Screens:**
- `HomeScreenSkeleton` - Home screen loading state
- `ProfileScreenSkeleton` - Profile screen loading state
- `PaymentPlansScreenSkeleton` - Payment plans loading state
- `BookingsScreenSkeleton` - Bookings screen loading state
- `GenericLoadingSkeleton` - Configurable generic skeleton

**Usage:**
```tsx
// Show skeleton while loading
{isLoading ? <HomeScreenSkeleton /> : <HomeScreen />}

// Generic skeleton
<GenericLoadingSkeleton
  showHeader={true}
  showCards={true}
  itemCount={5}
/>
```

## Error Handling Hooks

### 1. useErrorHandling (`useErrorHandling.ts`)

Comprehensive hook that combines error handling, loading states, and network awareness.

**Features:**
- Automatic error and loading management
- Retry logic with exponential backoff
- Network connectivity checks
- Operation state tracking

**Usage:**
```tsx
const errorHandler = useErrorHandling('fetchUserData');

// Execute operation with full error handling
const userData = await errorHandler.executeWithHandling(
  async () => {
    return await userService.fetchUserData();
  },
  {
    loadingMessage: 'Loading user data...',
    retryAttempts: 3,
    onSuccess: (data) => console.log('User data loaded:', data),
    onError: (error) => console.error('Failed to load user data:', error),
  }
);

// Access current state
const {
  error,
  isLoading,
  hasError,
  canRetry,
  errorMessage,
  retryCount
} = errorHandler;
```

### 2. useMultipleOperationsErrorHandling

Handles multiple related operations with coordinated error and loading states.

**Usage:**
```tsx
const multiHandler = useMultipleOperationsErrorHandling([
  'fetchUser',
  'fetchPreferences',
  'fetchSubscriptions'
]);

const results = await multiHandler.executeMultipleWithHandling([
  {
    key: 'fetchUser',
    operation: () => userService.fetchUser(),
    loadingMessage: 'Loading user...'
  },
  {
    key: 'fetchPreferences',
    operation: () => userService.fetchPreferences(),
    loadingMessage: 'Loading preferences...'
  }
], {
  parallel: true,
  stopOnFirstError: false,
  onProgress: (completed, total) => console.log(`${completed}/${total} completed`)
});
```

## Integration Guide

### 1. App Setup

Wrap your app with the necessary providers:

```tsx
import { ErrorProvider, LoadingProvider } from './src/contexts';
import { ErrorBoundary } from './src/components';

export default function App() {
  return (
    <ErrorBoundary enableRetry={true} maxRetries={3}>
      <ErrorProvider maxRetries={3}>
        <LoadingProvider>
          <NetworkStatus />
          <YourAppContent />
        </LoadingProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
```

### 2. Screen Implementation

Use error handling in your screens:

```tsx
import { useErrorHandling } from '../hooks';
import { HomeScreenSkeleton, ErrorDisplay } from '../components/common';

export const HomeScreen = () => {
  const errorHandler = useErrorHandling('homeData');
  const [data, setData] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const result = await errorHandler.executeWithHandling(
      async () => {
        return await homeService.fetchHomeData();
      },
      {
        loadingMessage: 'Loading home data...',
        onSuccess: setData,
      }
    );
  };

  if (errorHandler.isLoading) {
    return <HomeScreenSkeleton />;
  }

  if (errorHandler.hasError) {
    return (
      <ErrorDisplay
        error={errorHandler.error}
        onRetry={loadHomeData}
        onDismiss={errorHandler.clearError}
      />
    );
  }

  return <HomeContent data={data} />;
};
```

### 3. Form Error Handling

Handle form validation errors:

```tsx
import { useOperationError } from '../contexts';
import { InlineError } from '../components/common';

export const LoginForm = () => {
  const { error, setError, clearError } = useOperationError('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      clearError();
      await authService.login({ email, password });
    } catch (err) {
      setError(err, 'Login attempt');
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      
      <InlineError error={error} />
      
      <Button
        title="Login"
        onPress={handleLogin}
        loading={isLoading}
      />
    </View>
  );
};
```

## Best Practices

### 1. Error Classification

Always use appropriate error types:
- `NETWORK_ERROR` - Connection issues
- `AUTHENTICATION_ERROR` - Auth failures
- `VALIDATION_ERROR` - Input validation
- `SERVER_ERROR` - Backend issues
- `TIMEOUT_ERROR` - Request timeouts

### 2. User-Friendly Messages

Provide clear, actionable error messages:
```tsx
// Good
"Please check your internet connection and try again."

// Bad
"Network request failed with status 500"
```

### 3. Retry Logic

Implement smart retry logic:
- Only retry retryable errors
- Use exponential backoff
- Limit retry attempts
- Check network connectivity

### 4. Loading States

Always provide loading feedback:
- Use skeleton screens for initial loads
- Show loading overlays for actions
- Provide progress indicators for long operations

### 5. Error Recovery

Offer multiple recovery options:
- Retry the operation
- Navigate to a different screen
- Provide alternative actions
- Clear error state

## Testing

The system includes an example component (`ErrorHandlingExample.tsx`) that demonstrates all features:

```tsx
import { ErrorHandlingExample } from './src/examples/ErrorHandlingExample';

// Use in development to test error handling
<ErrorHandlingExample />
```

## Performance Considerations

1. **Error State Cleanup**: Always clean up error states when components unmount
2. **Network Monitoring**: Network service uses efficient event listeners
3. **Skeleton Animations**: Skeleton animations are optimized for performance
4. **Memory Management**: Error contexts properly clean up listeners and state

## Troubleshooting

### Common Issues

1. **Errors not displaying**: Ensure ErrorProvider wraps your app
2. **Network status not updating**: Check network permissions
3. **Skeleton not showing**: Verify loading states are properly managed
4. **Retry not working**: Check if error is marked as retryable

### Debug Mode

Enable debug logging in development:
```tsx
// Error details are automatically shown in __DEV__ mode
// Network state changes are logged to console
// Error boundary shows component stack traces
```

This comprehensive error handling system provides a robust foundation for managing errors, loading states, and network connectivity in your React Native application.
# Authentication Service Documentation

This directory contains the complete authentication system for the React Native booking app, including secure token management, API integration, and user-friendly error handling.

## Architecture Overview

The authentication system consists of several key components:

1. **AuthManager** - Handles secure token storage and refresh logic
2. **AuthService** - Manages authentication API calls and user state
3. **AuthContext** - Provides app-wide authentication state management
4. **useAuth Hook** - Convenient hook for accessing authentication functionality
5. **Error Handling** - User-friendly error messages and validation

## Components

### AuthManager (`authManager.ts`)

The AuthManager handles secure token storage using Expo SecureStore and automatic token refresh.

**Key Features:**
- Secure token storage using Expo SecureStore
- Automatic token refresh with retry logic
- Event-driven architecture for auth state changes
- Exponential backoff for failed refresh attempts

**Usage:**
```typescript
const authManager = AuthManager.getInstance();
await authManager.storeTokens(tokens);
const accessToken = await authManager.getAccessToken();
```

### AuthService (`authService.ts`)

The AuthService provides high-level authentication operations and integrates with the backend API.

**Key Features:**
- Login and registration with validation
- User profile management
- Integration with AuthManager for token handling
- Comprehensive error handling

**Usage:**
```typescript
const authService = AuthService.getInstance();
const result = await authService.login({ email, password });
if (result.success) {
  console.log('User logged in:', result.data);
}
```

### AuthContext (`../contexts/AuthContext.tsx`)

The AuthContext provides app-wide authentication state management using React Context.

**Key Features:**
- Centralized authentication state
- Automatic initialization on app start
- Event listeners for auth state changes
- Loading and error state management

**Usage:**
```typescript
// Wrap your app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
const { user, isAuthenticated, login, logout } = useAuthContext();
```

### useAuth Hook (`../hooks/useAuth.ts`)

A convenience hook that provides access to authentication functionality.

**Usage:**
```typescript
const { user, isAuthenticated, login, logout, error } = useAuth();

const handleLogin = async () => {
  const success = await login({ email: 'user@example.com', password: 'password' });
  if (!success) {
    console.error('Login failed:', error);
  }
};
```

## API Endpoints

The authentication system integrates with the following backend endpoints:

- `POST /auth/client/login` - User login
- `POST /auth/client/register` - User registration
- `POST /auth/client/refresh` - Token refresh
- `POST /auth/client/logout` - User logout
- `GET /auth/client/profile` - Get user profile

## Error Handling

The system includes comprehensive error handling with user-friendly messages:

### Error Types
- **AUTHENTICATION_ERROR** - Invalid credentials, token issues
- **VALIDATION_ERROR** - Invalid input data
- **NETWORK_ERROR** - Connection issues
- **SERVER_ERROR** - Backend server errors
- **TIMEOUT_ERROR** - Request timeouts

### Error Messages
The system maps technical error codes to user-friendly messages:

```typescript
import { getAuthErrorMessage } from '../../utils/authErrorHandler';

const userMessage = getAuthErrorMessage(apiError);
// Returns: "Invalid email or password. Please try again."
```

## Security Features

### Token Security
- Tokens stored in device secure storage
- Automatic token rotation on refresh
- Secure token transmission with HTTPS
- Token cleanup on logout

### Validation
- Client-side input validation
- Email format validation
- Password strength requirements
- Required field validation

### Error Handling
- No sensitive information in error messages
- Rate limiting awareness
- Secure error logging

## Integration Guide

### 1. Setup AuthProvider

Wrap your app with the AuthProvider:

```typescript
// App.tsx
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}
```

### 2. Use Authentication in Components

```typescript
import { useAuthContext } from '../contexts/AuthContext';

const LoginScreen = () => {
  const { login, isLoading, error } = useAuthContext();

  const handleLogin = async () => {
    const success = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (success) {
      // Navigate to authenticated area
    }
  };

  return (
    <View>
      <Button title="Login" onPress={handleLogin} disabled={isLoading} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
```

### 3. Protect Routes

```typescript
const ProtectedScreen = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedContent />;
};
```

## Testing

The authentication system includes comprehensive unit tests:

- **AuthService Tests** - API integration and error handling
- **AuthContext Tests** - State management and React integration
- **Error Handler Tests** - Error message mapping and validation

Run tests:
```bash
npm test -- --testPathPattern=auth
```

## Event System

The authentication system uses an event-driven architecture for state changes:

### Available Events
- `TOKEN_REFRESHED` - Token was successfully refreshed
- `TOKEN_EXPIRED` - Token expired and refresh failed
- `AUTHENTICATION_FAILED` - Authentication operation failed
- `TOKENS_CLEARED` - Tokens were cleared (logout)

### Listening to Events
```typescript
const authService = AuthService.getInstance();

authService.addEventListener('TOKEN_EXPIRED', () => {
  // Handle token expiry - redirect to login
});
```

## Configuration

### API Configuration
Update the API endpoints in `../apiConfig.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/client/login',
    REGISTER: '/auth/client/register',
    REFRESH: '/auth/client/refresh',
    LOGOUT: '/auth/client/logout',
    PROFILE: '/auth/client/profile',
  },
};
```

### Secure Storage Configuration
Configure secure storage settings in AuthManager:

```typescript
const authManager = AuthManager.getInstance();
authManager.updateStorageConfig({
  touchID: true, // Enable biometric authentication
  showModal: true, // Show biometric prompt
});
```

## Troubleshooting

### Common Issues

1. **Token Refresh Loops**
   - Check that refresh endpoint returns valid tokens
   - Verify token expiry times are correct

2. **Secure Storage Access Errors**
   - Ensure app has secure storage access permissions
   - Check device secure storage availability

3. **Network Errors**
   - Verify API endpoint URLs
   - Check network connectivity
   - Validate SSL certificates

### Debug Mode

Enable debug logging in development:

```typescript
// The system automatically logs in __DEV__ mode
if (__DEV__) {
  console.log('Auth debug info:', await authService.getTokenInfo());
}
```

## Best Practices

1. **Always use the AuthContext** - Don't instantiate AuthService directly in components
2. **Handle loading states** - Show loading indicators during auth operations
3. **Validate inputs** - Use client-side validation before API calls
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Clear sensitive data** - Ensure tokens are cleared on logout
6. **Test edge cases** - Test network failures, token expiry, etc.

## Migration from Mock Data

When migrating from mock authentication:

1. Replace mock auth calls with real AuthService calls
2. Update navigation logic to use authentication state
3. Add proper error handling and loading states
4. Test with real backend API endpoints
5. Update tests to use real authentication flow
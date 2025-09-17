# API Infrastructure

This directory contains the core API infrastructure for the React Native booking app. It provides a centralized, robust, and type-safe way to interact with backend APIs.

## Structure

```
src/services/
├── httpClient.ts          # Core HTTP client with interceptors
├── apiConfig.ts           # API configuration and endpoints
├── baseService.ts         # Base service class for API services
├── errorHandler.ts        # Error handling utilities
├── index.ts              # Main exports
├── examples/             # Usage examples
└── __tests__/           # Tests
```

## Key Features

### 1. HTTP Client (`httpClient.ts`)
- Centralized Axios-based HTTP client
- Automatic authentication token management
- Request/response interceptors
- Comprehensive error transformation
- Development logging

### 2. API Configuration (`apiConfig.ts`)
- Environment-specific base URLs
- Centralized endpoint definitions
- Timeout and retry configuration
- Pre-configured HTTP client instance

### 3. Error Handling (`errorHandler.ts`)
- User-friendly error message mapping
- Error type categorization
- Retry logic for recoverable errors
- Development error logging

### 4. Base Service (`baseService.ts`)
- Abstract base class for API services
- Built-in retry logic with exponential backoff
- Consistent error handling
- Request/response transformation hooks

## Usage

### Basic API Calls

```typescript
import { httpClient, API_ENDPOINTS } from '../services';

// GET request
const response = await httpClient.get(API_ENDPOINTS.DISCOVERY.BRANDS);

// POST request
const loginResponse = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});
```

### Authentication

```typescript
import { httpClient } from '../services';

// Set authentication token
httpClient.setAuthToken('your-jwt-token');

// Clear authentication
httpClient.clearAuthToken();
```

### Error Handling

```typescript
import { getErrorMessage, logError } from '../services';

const response = await httpClient.get('/some-endpoint');

if (!response.success && response.error) {
  // Get user-friendly error message
  const message = getErrorMessage(response.error);
  
  // Log detailed error for debugging
  logError(response.error, 'API Call Context');
  
  // Show message to user
  Alert.alert('Error', message);
}
```

### Creating API Services

```typescript
import { BaseService } from '../services';
import { API_ENDPOINTS } from '../services';

class AuthService extends BaseService {
  async login(credentials: LoginCredentials) {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, credentials, 'User Login');
  }
  
  async getProfile() {
    return this.get(API_ENDPOINTS.AUTH.PROFILE, 'Get User Profile');
  }
}
```

## Configuration

### Environment Setup

Update `apiConfig.ts` to set the correct API base URLs:

```typescript
export const API_CONFIG: HttpClientConfig = {
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api'     // Development
    : 'https://api.yourdomain.com/api', // Production
  timeout: 10000,
  retryAttempts: 3,
};
```

### Adding New Endpoints

Add new endpoints to the `API_ENDPOINTS` object in `apiConfig.ts`:

```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  NEW_FEATURE: {
    LIST: '/new-feature/list',
    CREATE: '/new-feature/create',
    UPDATE: '/new-feature/update',
  },
};
```

## Error Types

The system categorizes errors into these types:

- `NETWORK_ERROR`: Connection issues
- `AUTHENTICATION_ERROR`: Auth failures (401, 403)
- `VALIDATION_ERROR`: Bad request data (400, 404)
- `SERVER_ERROR`: Server issues (500, 502, 503, 504)
- `TIMEOUT_ERROR`: Request timeouts

## Development Features

- Automatic request/response logging in development
- Detailed error information in console
- Type safety with TypeScript
- Comprehensive error categorization

## Next Steps

This infrastructure is ready for implementing specific API services:

1. Authentication Service (Task 2)
2. Discovery Service (Task 5)
3. Subscription Service (Task 6)
4. Profile Service (Task 8)
5. Payment Service (Task 9)

Each service should extend `BaseService` and use the established patterns for consistency and reliability.
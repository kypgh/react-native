# API Types and Utilities

This directory contains the updated type definitions, data transformers, and type guards for the React Native booking app's API integration.

## Files Overview

- **`api.ts`** - Core type definitions matching the backend API structure
- **`transformers.ts`** - Data transformation utilities for backend-to-frontend mapping
- **`typeGuards.ts`** - Runtime type validation functions
- **`apiUtils.ts`** - Utility functions for processing API responses safely
- **`index.ts`** - Main export file for all types and utilities

## Key Features

### 1. Updated Type Definitions
All types now match the backend API structure exactly:
- `ClientProfile` instead of `User` for client data
- Proper `AuthResponse` with `client` and `tokens` properties
- Comprehensive pagination and API response wrapper types
- Error response types matching backend format

### 2. Data Transformers
The `DataTransformer` class provides methods to convert backend responses to frontend-compatible formats:

```typescript
import { DataTransformer } from './types';

// Transform backend client data
const clientProfile = DataTransformer.transformClientProfile(backendClient);

// Transform authentication response
const authResponse = DataTransformer.transformAuthResponse(backendAuthData);
```

### 3. Type Guards
The `TypeGuards` class provides runtime type validation:

```typescript
import { TypeGuards } from './types';

// Validate basic types
if (TypeGuards.isString(value)) {
  // value is guaranteed to be a string
}

// Validate complex objects
if (TypeGuards.isClientProfile(data)) {
  // data is guaranteed to be a valid ClientProfile
}
```

### 4. API Utilities
The `ApiUtils` class provides safe API response processing:

```typescript
import { ApiUtils } from './types';

// Process API response with validation and transformation
const result = ApiUtils.processAuthResponse(apiResponse);
if (result.success) {
  console.log('User:', result.data.client);
} else {
  console.error('Error:', result.error.message);
}
```

## Usage Examples

### Processing Authentication Response
```typescript
import { ApiUtils, TypeGuards } from './types';

async function handleLogin(credentials: LoginCredentials) {
  try {
    const response = await fetch('/api/auth/client/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    
    const result = ApiUtils.processAuthResponse(data);
    if (result.success) {
      // Safely access transformed data
      const { client, tokens } = result.data;
      console.log('Logged in as:', client.email);
      return { client, tokens };
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### Manual Type Validation and Transformation
```typescript
import { TypeGuards, DataTransformer } from './types';

function processClientData(rawData: unknown) {
  // Validate the data structure
  if (!TypeGuards.isClientProfile(rawData)) {
    throw new Error('Invalid client data format');
  }
  
  // Transform if needed (though in this case it's already validated)
  const transformedClient = DataTransformer.transformClientProfile(rawData);
  return transformedClient;
}
```

### Handling Paginated Responses
```typescript
import { ApiUtils } from './types';

async function fetchBrands(params: BrandQueryParams) {
  const response = await fetch('/api/client/discovery/brands?' + new URLSearchParams(params));
  const data = await response.json();
  
  const result = ApiUtils.processBrandsResponse(data);
  if (result.success) {
    const { brands, pagination } = result.data;
    console.log(`Found ${brands.length} brands (page ${pagination.currentPage})`);
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

## Migration Notes

### Breaking Changes
1. **User → ClientProfile**: The main user type is now `ClientProfile` with different property structure
2. **AuthResponse Structure**: Now contains `client` and `tokens` properties instead of direct user data
3. **Error Handling**: New structured error types with `ApiErrorType` enum

### Backward Compatibility
- Legacy `User` interface is still available for gradual migration
- Screen props types are maintained for existing components
- Mock data interfaces remain unchanged

## Type Safety Benefits

1. **Runtime Validation**: Type guards ensure data matches expected structure
2. **Transformation Safety**: Transformers handle missing or malformed data gracefully  
3. **Error Handling**: Structured error types with consistent format
4. **API Response Processing**: Unified approach to handling success/error responses
5. **Pagination Support**: Built-in support for paginated API responses

## Next Steps

When implementing API services, use these utilities to ensure type safety:

1. Import the appropriate types and utilities
2. Use `ApiUtils` methods for processing responses
3. Leverage type guards for runtime validation
4. Use transformers to convert backend data to frontend format
5. Handle errors consistently using the structured error types
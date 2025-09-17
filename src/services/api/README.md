# Discovery Service

The Discovery Service provides comprehensive functionality for browsing brands, classes, and sessions in the React Native booking app. It handles all discovery-related API calls with search, filtering, and pagination support.

## Overview

The Discovery Service is built on top of the BaseService class and provides a clean, consistent interface for interacting with the backend discovery APIs. It includes automatic error handling, retry logic, and proper TypeScript typing.

## Features

- **Brand Discovery**: Browse and search fitness brands with location filtering
- **Class Browsing**: Find classes by category, difficulty, and brand
- **Session Management**: Get available sessions with real-time availability
- **Search & Filtering**: Comprehensive search and filtering capabilities
- **Pagination**: Built-in pagination support for large datasets
- **Error Handling**: Robust error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with proper type definitions

## API Methods

### Brand Methods

#### `getBrands(params?: BrandQueryParams): Promise<ApiResponse<BrandsResponse>>`
Fetches a list of brands with optional filtering parameters.

```typescript
const response = await discoveryService.getBrands({
  search: 'fitness',
  city: 'New York',
  state: 'NY',
  page: 1,
  limit: 20
});
```

#### `getBrandDetails(brandId: string): Promise<ApiResponse<BrandDetailsResponse>>`
Gets detailed information about a specific brand including classes and statistics.

```typescript
const response = await discoveryService.getBrandDetails('brand123');
```

#### `searchBrands(searchTerm: string, location?: { city?: string; state?: string }): Promise<ApiResponse<BrandsResponse>>`
Searches for brands by name with optional location filtering.

```typescript
const response = await discoveryService.searchBrands('yoga', {
  city: 'Los Angeles',
  state: 'CA'
});
```

### Class Methods

#### `getClasses(params?: ClassQueryParams): Promise<ApiResponse<ClassesResponse>>`
Fetches a list of classes with optional filtering parameters.

```typescript
const response = await discoveryService.getClasses({
  category: 'Wellness',
  difficulty: 'intermediate',
  brand: 'brand123'
});
```

#### `searchClasses(searchTerm: string, filters?: ClassFilters): Promise<ApiResponse<ClassesResponse>>`
Searches for classes with comprehensive filtering options.

```typescript
const response = await discoveryService.searchClasses('pilates', {
  category: 'Wellness',
  difficulty: 'beginner',
  brandId: 'brand123',
  location: { city: 'Miami', state: 'FL' }
});
```

#### `getClassesByBrand(brandId: string): Promise<ApiResponse<ClassesResponse>>`
Gets all classes offered by a specific brand.

```typescript
const response = await discoveryService.getClassesByBrand('brand123');
```

### Session Methods

#### `getSessions(params?: SessionQueryParams): Promise<ApiResponse<SessionsResponse>>`
Fetches sessions with comprehensive filtering options.

```typescript
const response = await discoveryService.getSessions({
  startDate: '2025-09-15T00:00:00Z',
  endDate: '2025-09-16T23:59:59Z',
  availableOnly: true
});
```

#### `getAvailableSessions(filters?: SessionFilters): Promise<ApiResponse<SessionsResponse>>`
Gets only available sessions with filtering options.

```typescript
const response = await discoveryService.getAvailableSessions({
  brandId: 'brand123',
  startDate: new Date('2025-09-15'),
  endDate: new Date('2025-09-16')
});
```

#### `getSessionsByDateRange(startDate: Date, endDate: Date, filters?: SessionFilters): Promise<ApiResponse<SessionsResponse>>`
Gets sessions within a specific date range.

```typescript
const response = await discoveryService.getSessionsByDateRange(
  new Date('2025-09-15'),
  new Date('2025-09-22'),
  { brandId: 'brand123', availableOnly: true }
);
```

#### `getSessionsByClass(classId: string, filters?: SessionFilters): Promise<ApiResponse<SessionsResponse>>`
Gets all sessions for a specific class.

```typescript
const response = await discoveryService.getSessionsByClass('class456', {
  startDate: new Date('2025-09-15'),
  availableOnly: true
});
```

### Plan Methods

#### `getSubscriptionPlans(brandId: string): Promise<ApiResponse<SubscriptionPlansResponse>>`
Gets available subscription plans for a brand.

```typescript
const response = await discoveryService.getSubscriptionPlans('brand123');
```

#### `getCreditPlans(brandId: string): Promise<ApiResponse<CreditPlansResponse>>`
Gets available credit plans for a brand.

```typescript
const response = await discoveryService.getCreditPlans('brand123');
```

## Usage Examples

### Basic Brand Search
```typescript
import { discoveryService } from '../services/api/discoveryService';

// Search for fitness brands in New York
const searchBrands = async () => {
  const response = await discoveryService.searchBrands('fitness', {
    city: 'New York',
    state: 'NY'
  });
  
  if (response.success) {
    console.log('Found brands:', response.data.brands);
  } else {
    console.error('Search failed:', response.error?.message);
  }
};
```

### Get Available Sessions
```typescript
// Get available sessions for next week
const getWeekSessions = async () => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);
  
  const response = await discoveryService.getAvailableSessions({
    startDate,
    endDate,
    location: { city: 'Los Angeles', state: 'CA' }
  });
  
  if (response.success) {
    console.log('Available sessions:', response.data.sessions);
  }
};
```

### Browse Classes by Category
```typescript
// Get all yoga classes
const getYogaClasses = async () => {
  const response = await discoveryService.searchClasses('yoga', {
    category: 'Wellness',
    difficulty: 'beginner'
  });
  
  if (response.success) {
    response.data.classes.forEach(cls => {
      console.log(`${cls.name} - ${cls.difficulty} level`);
    });
  }
};
```

## Error Handling

The Discovery Service includes comprehensive error handling:

```typescript
const handleApiCall = async () => {
  const response = await discoveryService.getBrands();
  
  if (!response.success) {
    switch (response.error?.type) {
      case ApiErrorType.NETWORK_ERROR:
        // Handle network issues
        showNetworkError();
        break;
      case ApiErrorType.SERVER_ERROR:
        // Handle server errors
        showServerError();
        break;
      default:
        // Handle other errors
        showGenericError(response.error?.message);
    }
  }
};
```

## Type Definitions

The service uses comprehensive TypeScript types:

```typescript
interface BrandQueryParams {
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ClassQueryParams {
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  brand?: string;
  city?: string;
  state?: string;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SessionQueryParams {
  search?: string;
  brand?: string;
  class?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  startDate?: string;
  endDate?: string;
  availableOnly?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Testing

The Discovery Service includes comprehensive unit tests covering:

- All API methods
- Error handling scenarios
- Query parameter building
- Response transformation
- Edge cases and validation

Run tests with:
```bash
npm test -- --testPathPatterns="discoveryService"
```

## Integration

The Discovery Service is automatically exported from the services index:

```typescript
import { discoveryService } from '../services';
// or
import { DiscoveryService } from '../services';
```

It's also integrated with custom React hooks for easy use in components:

```typescript
import { useDiscovery, useBrands, useClasses } from '../hooks';
```
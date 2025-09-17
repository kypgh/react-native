# Discovery Hooks

This directory contains custom React hooks for managing discovery data in the React Native booking app. These hooks provide a clean, reusable interface for components to interact with the Discovery Service.

## Available Hooks

### `useDiscovery`
A comprehensive hook for general discovery operations including brands, classes, and sessions.

### `useBrands`
A specialized hook for brand management with detailed brand information and plans.

### `useClasses`
A specialized hook for class management with session data.

## Hook Details

## `useDiscovery`

The main discovery hook that provides search and filtering functionality across all discovery data types.

### Features
- Multi-type search (brands, classes, sessions)
- Pagination support
- Loading state management
- Error handling
- Result caching

### Usage
```typescript
import { useDiscovery } from '../hooks';

const DiscoveryScreen = () => {
  const {
    brands,
    classes,
    sessions,
    isLoading,
    error,
    hasMore,
    searchBrands,
    searchClasses,
    getAvailableSessions,
    loadMoreBrands,
    clearResults,
    clearError
  } = useDiscovery();

  const handleBrandSearch = async (searchTerm: string) => {
    await searchBrands(searchTerm, { city: 'New York', state: 'NY' });
  };

  const handleClassSearch = async (searchTerm: string) => {
    await searchClasses(searchTerm, {
      category: 'Wellness',
      difficulty: 'intermediate'
    });
  };

  const handleSessionSearch = async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    
    await getAvailableSessions({
      startDate,
      endDate,
      location: { city: 'Los Angeles', state: 'CA' }
    });
  };

  return (
    <View>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onDismiss={clearError} />}
      
      <SearchInput onSearch={handleBrandSearch} placeholder="Search brands..." />
      
      <FlatList
        data={brands}
        renderItem={({ item }) => <BrandCard brand={item} />}
        onEndReached={loadMoreBrands}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};
```

### API Reference

#### State
```typescript
interface UseDiscoveryState {
  brands: Brand[];
  classes: ClassInfo[];
  sessions: Session[];
  isLoading: boolean;
  error: ApiError | null;
  hasMore: boolean;
  currentPage: number;
}
```

#### Actions
```typescript
interface UseDiscoveryActions {
  searchBrands: (searchTerm: string, location?: LocationFilter) => Promise<void>;
  searchClasses: (searchTerm: string, filters?: ClassFilters) => Promise<void>;
  getAvailableSessions: (filters?: SessionFilters) => Promise<void>;
  loadMoreBrands: () => Promise<void>;
  loadMoreClasses: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}
```

## `useBrands`

A specialized hook for brand management with detailed brand information and subscription/credit plans.

### Features
- Brand browsing and search
- Brand details with statistics
- Subscription and credit plan management
- Loading states for different operations
- Brand selection management

### Usage
```typescript
import { useBrands } from '../hooks';

const BrandScreen = () => {
  const {
    brands,
    selectedBrand,
    brandDetails,
    subscriptionPlans,
    creditPlans,
    isLoading,
    isLoadingDetails,
    isLoadingPlans,
    error,
    getBrands,
    getBrandDetails,
    getSubscriptionPlans,
    getCreditPlans,
    selectBrand,
    searchBrands
  } = useBrands();

  useEffect(() => {
    getBrands({ city: 'New York', state: 'NY' });
  }, []);

  const handleBrandSelect = async (brand: Brand) => {
    selectBrand(brand);
    await getBrandDetails(brand._id);
    await getSubscriptionPlans(brand._id);
    await getCreditPlans(brand._id);
  };

  return (
    <View>
      {isLoading && <LoadingSpinner />}
      
      <FlatList
        data={brands}
        renderItem={({ item }) => (
          <BrandCard 
            brand={item} 
            onPress={() => handleBrandSelect(item)}
            selected={selectedBrand?._id === item._id}
          />
        )}
      />
      
      {selectedBrand && (
        <BrandDetailsModal
          brand={selectedBrand}
          details={brandDetails}
          subscriptionPlans={subscriptionPlans}
          creditPlans={creditPlans}
          isLoading={isLoadingDetails || isLoadingPlans}
        />
      )}
    </View>
  );
};
```

### API Reference

#### State
```typescript
interface UseBrandsState {
  brands: Brand[];
  selectedBrand: Brand | null;
  brandDetails: BrandDetailsResponse | null;
  subscriptionPlans: SubscriptionPlansResponse | null;
  creditPlans: CreditPlansResponse | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingPlans: boolean;
  error: ApiError | null;
  hasMore: boolean;
  currentPage: number;
}
```

#### Actions
```typescript
interface UseBrandsActions {
  getBrands: (params?: BrandQueryParams) => Promise<void>;
  getBrandDetails: (brandId: string) => Promise<void>;
  getSubscriptionPlans: (brandId: string) => Promise<void>;
  getCreditPlans: (brandId: string) => Promise<void>;
  searchBrands: (searchTerm: string, location?: LocationFilter) => Promise<void>;
  loadMoreBrands: (params?: BrandQueryParams) => Promise<void>;
  selectBrand: (brand: Brand | null) => void;
  clearBrands: () => void;
  clearBrandDetails: () => void;
  clearPlans: () => void;
  clearError: () => void;
}
```

## `useClasses`

A specialized hook for class management with session data and filtering capabilities.

### Features
- Class browsing and search
- Session management for classes
- Brand-specific class filtering
- Pagination for both classes and sessions
- Class selection management

### Usage
```typescript
import { useClasses } from '../hooks';

const ClassScreen = () => {
  const {
    classes,
    selectedClass,
    classSessions,
    isLoading,
    isLoadingSessions,
    error,
    getClasses,
    getClassesByBrand,
    getSessionsByClass,
    searchClasses,
    selectClass,
    loadMoreClasses
  } = useClasses();

  const handleClassSelect = async (classInfo: ClassInfo) => {
    selectClass(classInfo);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    
    await getSessionsByClass(classInfo._id, {
      startDate,
      endDate,
      availableOnly: true
    });
  };

  const handleBrandFilter = async (brandId: string) => {
    await getClassesByBrand(brandId);
  };

  return (
    <View>
      <SearchInput 
        onSearch={(term) => searchClasses(term, { difficulty: 'intermediate' })}
        placeholder="Search classes..."
      />
      
      {isLoading && <LoadingSpinner />}
      
      <FlatList
        data={classes}
        renderItem={({ item }) => (
          <ClassCard 
            class={item} 
            onPress={() => handleClassSelect(item)}
            selected={selectedClass?._id === item._id}
          />
        )}
        onEndReached={loadMoreClasses}
      />
      
      {selectedClass && (
        <SessionsList
          sessions={classSessions}
          isLoading={isLoadingSessions}
          class={selectedClass}
        />
      )}
    </View>
  );
};
```

### API Reference

#### State
```typescript
interface UseClassesState {
  classes: ClassInfo[];
  selectedClass: ClassInfo | null;
  classSessions: Session[];
  isLoading: boolean;
  isLoadingSessions: boolean;
  error: ApiError | null;
  hasMore: boolean;
  hasMoreSessions: boolean;
  currentPage: number;
  currentSessionsPage: number;
}
```

#### Actions
```typescript
interface UseClassesActions {
  getClasses: (params?: ClassQueryParams) => Promise<void>;
  getClassesByBrand: (brandId: string) => Promise<void>;
  getSessionsByClass: (classId: string, filters?: SessionFilters) => Promise<void>;
  searchClasses: (searchTerm: string, filters?: ClassFilters) => Promise<void>;
  loadMoreClasses: (params?: ClassQueryParams) => Promise<void>;
  loadMoreSessions: (classId: string, filters?: SessionFilters) => Promise<void>;
  selectClass: (classInfo: ClassInfo | null) => void;
  clearClasses: () => void;
  clearSessions: () => void;
  clearError: () => void;
}
```

## Common Patterns

### Error Handling
All hooks provide consistent error handling:

```typescript
const { error, clearError } = useDiscovery();

useEffect(() => {
  if (error) {
    Alert.alert(
      'Error',
      error.message,
      [{ text: 'OK', onPress: clearError }]
    );
  }
}, [error, clearError]);
```

### Loading States
Hooks provide granular loading states:

```typescript
const { isLoading, isLoadingDetails, isLoadingPlans } = useBrands();

return (
  <View>
    {isLoading && <Text>Loading brands...</Text>}
    {isLoadingDetails && <Text>Loading brand details...</Text>}
    {isLoadingPlans && <Text>Loading plans...</Text>}
  </View>
);
```

### Pagination
All hooks support pagination:

```typescript
const { hasMore, loadMoreBrands } = useBrands();

const handleEndReached = () => {
  if (hasMore && !isLoading) {
    loadMoreBrands();
  }
};
```

### Search and Filtering
Hooks provide flexible search and filtering:

```typescript
const { searchClasses } = useClasses();

const handleSearch = (term: string) => {
  searchClasses(term, {
    category: selectedCategory,
    difficulty: selectedDifficulty,
    location: { city: userCity, state: userState }
  });
};
```

## Best Practices

1. **Clear State on Unmount**: Always clear state when components unmount to prevent memory leaks.

2. **Handle Loading States**: Show appropriate loading indicators for better UX.

3. **Error Boundaries**: Use error boundaries to catch and handle hook errors gracefully.

4. **Debounce Search**: Debounce search inputs to avoid excessive API calls.

5. **Cache Management**: Use the clear methods appropriately to manage memory usage.

6. **Pagination**: Implement proper pagination UI with loading indicators.

## Integration with Components

These hooks are designed to work seamlessly with React Native components and can be easily integrated into existing screens and navigation flows.
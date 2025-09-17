import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brand,
  BrandDetailsResponse,
  BrandsResponse,
  ClassInfo,
  ClassesResponse,
  Session,
  SessionsResponse,
  BrandQueryParams,
  ClassQueryParams,
  SessionQueryParams,
  ApiError,
  SubscriptionPlansResponse,
  CreditPlansResponse,
} from '../types/api';
import { discoveryService } from '../services/api/discoveryService';

interface UseDiscoveryState {
  brands: Brand[];
  classes: ClassInfo[];
  sessions: Session[];
  isLoading: boolean;
  error: ApiError | null;
  hasMore: boolean;
  currentPage: number;
}

interface UseDiscoveryActions {
  searchBrands: (searchTerm: string, location?: { city?: string; state?: string }) => Promise<void>;
  searchClasses: (
    searchTerm: string,
    filters?: {
      category?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      brandId?: string;
      location?: { city?: string; state?: string };
    }
  ) => Promise<void>;
  getAvailableSessions: (filters?: {
    brandId?: string;
    classId?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    startDate?: Date;
    endDate?: Date;
    location?: { city?: string; state?: string };
  }) => Promise<void>;
  loadMoreBrands: () => Promise<void>;
  loadMoreClasses: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

interface UseDiscoveryReturn extends UseDiscoveryState, UseDiscoveryActions {}

/**
 * Custom hook for discovery data management
 * Provides search and filtering functionality for brands, classes, and sessions
 */
export const useDiscovery = (): UseDiscoveryReturn => {
  const [state, setState] = useState<UseDiscoveryState>({
    brands: [],
    classes: [],
    sessions: [],
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
  });

  // Store current search parameters for pagination
  const currentSearchRef = useRef<{
    type: 'brands' | 'classes' | 'sessions';
    params: any;
  } | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      brands: [],
      classes: [],
      sessions: [],
      isLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
    });
    currentSearchRef.current = null;
  }, []);

  const searchBrands = useCallback(async (
    searchTerm: string,
    location?: { city?: string; state?: string }
  ) => {
    setLoading(true);
    clearError();

    try {
      const params: BrandQueryParams = {
        search: searchTerm,
        ...location,
        status: 'active',
        page: 1,
        limit: 20,
      };

      currentSearchRef.current = { type: 'brands', params };

      const response = await discoveryService.searchBrands(searchTerm, location);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          brands: response.data.brands,
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoading, clearError, setError]);

  const searchClasses = useCallback(async (
    searchTerm: string,
    filters?: {
      category?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      brandId?: string;
      location?: { city?: string; state?: string };
    }
  ) => {
    setLoading(true);
    clearError();

    try {
      const params: ClassQueryParams = {
        search: searchTerm,
        category: filters?.category,
        difficulty: filters?.difficulty,
        brand: filters?.brandId,
        city: filters?.location?.city,
        state: filters?.location?.state,
        page: 1,
        limit: 20,
      };

      currentSearchRef.current = { type: 'classes', params };

      const response = await discoveryService.searchClasses(searchTerm, filters);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          classes: response.data.classes,
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoading, clearError, setError]);

  const getAvailableSessions = useCallback(async (filters?: {
    brandId?: string;
    classId?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    startDate?: Date;
    endDate?: Date;
    location?: { city?: string; state?: string };
  }) => {
    setLoading(true);
    clearError();

    try {
      const params: SessionQueryParams = {
        brand: filters?.brandId,
        class: filters?.classId,
        category: filters?.category,
        difficulty: filters?.difficulty,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
        availableOnly: true,
        city: filters?.location?.city,
        state: filters?.location?.state,
        page: 1,
        limit: 20,
        sortBy: 'dateTime',
        sortOrder: 'asc',
      };

      currentSearchRef.current = { type: 'sessions', params };

      const response = await discoveryService.getAvailableSessions(filters);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          sessions: response.data.sessions,
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoading, clearError, setError]);

  const loadMoreBrands = useCallback(async () => {
    if (!currentSearchRef.current || currentSearchRef.current.type !== 'brands' || state.isLoading || !state.hasMore) {
      return;
    }

    setLoading(true);

    try {
      const nextPage = state.currentPage + 1;
      const params = { ...currentSearchRef.current.params, page: nextPage };
      
      const response = await discoveryService.getBrands(params);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          brands: [...prev.brands, ...response.data.brands],
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [state.isLoading, state.hasMore, state.currentPage, setLoading, setError]);

  const loadMoreClasses = useCallback(async () => {
    if (!currentSearchRef.current || currentSearchRef.current.type !== 'classes' || state.isLoading || !state.hasMore) {
      return;
    }

    setLoading(true);

    try {
      const nextPage = state.currentPage + 1;
      const params = { ...currentSearchRef.current.params, page: nextPage };
      
      const response = await discoveryService.getClasses(params);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          classes: [...prev.classes, ...response.data.classes],
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [state.isLoading, state.hasMore, state.currentPage, setLoading, setError]);

  const loadMoreSessions = useCallback(async () => {
    if (!currentSearchRef.current || currentSearchRef.current.type !== 'sessions' || state.isLoading || !state.hasMore) {
      return;
    }

    setLoading(true);

    try {
      const nextPage = state.currentPage + 1;
      const params = { ...currentSearchRef.current.params, page: nextPage };
      
      const response = await discoveryService.getSessions(params);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          sessions: [...prev.sessions, ...response.data.sessions],
          isLoading: false,
          hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [state.isLoading, state.hasMore, state.currentPage, setLoading, setError]);

  return {
    ...state,
    searchBrands,
    searchClasses,
    getAvailableSessions,
    loadMoreBrands,
    loadMoreClasses,
    loadMoreSessions,
    clearResults,
    clearError,
  };
};
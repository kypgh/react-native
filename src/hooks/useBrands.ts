import { useState, useCallback } from 'react';
import {
  Brand,
  BrandDetailsResponse,
  BrandsResponse,
  BrandQueryParams,
  ApiError,
  SubscriptionPlansResponse,
  CreditPlansResponse,
} from '../types/api';
import { discoveryService } from '../services/api/discoveryService';

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

interface UseBrandsActions {
  getBrands: (params?: BrandQueryParams) => Promise<void>;
  getBrandDetails: (brandId: string) => Promise<void>;
  getSubscriptionPlans: (brandId: string) => Promise<void>;
  getCreditPlans: (brandId: string) => Promise<void>;
  searchBrands: (searchTerm: string, location?: { city?: string; state?: string }) => Promise<void>;
  loadMoreBrands: (params?: BrandQueryParams) => Promise<void>;
  selectBrand: (brand: Brand | null) => void;
  clearBrands: () => void;
  clearBrandDetails: () => void;
  clearPlans: () => void;
  clearError: () => void;
}

interface UseBrandsReturn extends UseBrandsState, UseBrandsActions {}

/**
 * Custom hook for brand management
 * Provides functionality for browsing brands, getting details, and managing plans
 */
export const useBrands = (): UseBrandsReturn => {
  const [state, setState] = useState<UseBrandsState>({
    brands: [],
    selectedBrand: null,
    brandDetails: null,
    subscriptionPlans: null,
    creditPlans: null,
    isLoading: false,
    isLoadingDetails: false,
    isLoadingPlans: false,
    error: null,
    hasMore: true,
    currentPage: 1,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setLoadingDetails = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoadingDetails: loading }));
  }, []);

  const setLoadingPlans = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoadingPlans: loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({ 
      ...prev, 
      error, 
      isLoading: false, 
      isLoadingDetails: false,
      isLoadingPlans: false 
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearBrands = useCallback(() => {
    setState(prev => ({
      ...prev,
      brands: [],
      hasMore: true,
      currentPage: 1,
      error: null,
    }));
  }, []);

  const clearBrandDetails = useCallback(() => {
    setState(prev => ({
      ...prev,
      brandDetails: null,
      selectedBrand: null,
      error: null,
    }));
  }, []);

  const clearPlans = useCallback(() => {
    setState(prev => ({
      ...prev,
      subscriptionPlans: null,
      creditPlans: null,
      error: null,
    }));
  }, []);

  const selectBrand = useCallback((brand: Brand | null) => {
    setState(prev => ({ ...prev, selectedBrand: brand }));
  }, []);

  const getBrands = useCallback(async (params?: BrandQueryParams) => {
    setLoading(true);
    clearError();

    try {
      const queryParams: BrandQueryParams = {
        status: 'active',
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        ...params,
      };

      const response = await discoveryService.getBrands(queryParams);
      
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

  const getBrandDetails = useCallback(async (brandId: string) => {
    setLoadingDetails(true);
    clearError();

    try {
      const response = await discoveryService.getBrandDetails(brandId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          brandDetails: response.data,
          isLoadingDetails: false,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoadingDetails, clearError, setError]);

  const getSubscriptionPlans = useCallback(async (brandId: string) => {
    setLoadingPlans(true);
    clearError();

    try {
      const response = await discoveryService.getSubscriptionPlans(brandId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          subscriptionPlans: response.data,
          isLoadingPlans: false,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoadingPlans, clearError, setError]);

  const getCreditPlans = useCallback(async (brandId: string) => {
    setLoadingPlans(true);
    clearError();

    try {
      const response = await discoveryService.getCreditPlans(brandId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          creditPlans: response.data,
          isLoadingPlans: false,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoadingPlans, clearError, setError]);

  const searchBrands = useCallback(async (
    searchTerm: string,
    location?: { city?: string; state?: string }
  ) => {
    setLoading(true);
    clearError();

    try {
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

  const loadMoreBrands = useCallback(async (params?: BrandQueryParams) => {
    if (state.isLoading || !state.hasMore) {
      return;
    }

    setLoading(true);

    try {
      const nextPage = state.currentPage + 1;
      const queryParams: BrandQueryParams = {
        status: 'active',
        page: nextPage,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        ...params,
      };

      const response = await discoveryService.getBrands(queryParams);
      
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

  return {
    ...state,
    getBrands,
    getBrandDetails,
    getSubscriptionPlans,
    getCreditPlans,
    searchBrands,
    loadMoreBrands,
    selectBrand,
    clearBrands,
    clearBrandDetails,
    clearPlans,
    clearError,
  };
};
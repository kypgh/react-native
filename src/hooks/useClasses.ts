import { useState, useCallback } from 'react';
import {
  ClassInfo,
  ClassesResponse,
  Session,
  SessionsResponse,
  ClassQueryParams,
  SessionQueryParams,
  ApiError,
} from '../types/api';
import { discoveryService } from '../services/api/discoveryService';

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

interface UseClassesActions {
  getClasses: (params?: ClassQueryParams) => Promise<void>;
  getClassesByBrand: (brandId: string) => Promise<void>;
  getSessionsByClass: (classId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    availableOnly?: boolean;
  }) => Promise<void>;
  searchClasses: (
    searchTerm: string,
    filters?: {
      category?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      brandId?: string;
      location?: { city?: string; state?: string };
    }
  ) => Promise<void>;
  loadMoreClasses: (params?: ClassQueryParams) => Promise<void>;
  loadMoreSessions: (classId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    availableOnly?: boolean;
  }) => Promise<void>;
  selectClass: (classInfo: ClassInfo | null) => void;
  clearClasses: () => void;
  clearSessions: () => void;
  clearError: () => void;
}

interface UseClassesReturn extends UseClassesState, UseClassesActions {}

/**
 * Custom hook for class management
 * Provides functionality for browsing classes, getting sessions, and filtering
 */
export const useClasses = (): UseClassesReturn => {
  const [state, setState] = useState<UseClassesState>({
    classes: [],
    selectedClass: null,
    classSessions: [],
    isLoading: false,
    isLoadingSessions: false,
    error: null,
    hasMore: true,
    hasMoreSessions: true,
    currentPage: 1,
    currentSessionsPage: 1,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setLoadingSessions = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoadingSessions: loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({ 
      ...prev, 
      error, 
      isLoading: false,
      isLoadingSessions: false 
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearClasses = useCallback(() => {
    setState(prev => ({
      ...prev,
      classes: [],
      selectedClass: null,
      hasMore: true,
      currentPage: 1,
      error: null,
    }));
  }, []);

  const clearSessions = useCallback(() => {
    setState(prev => ({
      ...prev,
      classSessions: [],
      hasMoreSessions: true,
      currentSessionsPage: 1,
      error: null,
    }));
  }, []);

  const selectClass = useCallback((classInfo: ClassInfo | null) => {
    setState(prev => ({ ...prev, selectedClass: classInfo }));
  }, []);

  const getClasses = useCallback(async (params?: ClassQueryParams) => {
    setLoading(true);
    clearError();

    try {
      const queryParams: ClassQueryParams = {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        ...params,
      };

      const response = await discoveryService.getClasses(queryParams);
      
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

  const getClassesByBrand = useCallback(async (brandId: string) => {
    setLoading(true);
    clearError();

    try {
      const response = await discoveryService.getClassesByBrand(brandId);
      
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

  const getSessionsByClass = useCallback(async (
    classId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      availableOnly?: boolean;
    }
  ) => {
    setLoadingSessions(true);
    clearError();

    try {
      const response = await discoveryService.getSessionsByClass(classId, filters);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          classSessions: response.data.sessions,
          isLoadingSessions: false,
          hasMoreSessions: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentSessionsPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [setLoadingSessions, clearError, setError]);

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

  const loadMoreClasses = useCallback(async (params?: ClassQueryParams) => {
    if (state.isLoading || !state.hasMore) {
      return;
    }

    setLoading(true);

    try {
      const nextPage = state.currentPage + 1;
      const queryParams: ClassQueryParams = {
        page: nextPage,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        ...params,
      };

      const response = await discoveryService.getClasses(queryParams);
      
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

  const loadMoreSessions = useCallback(async (
    classId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      availableOnly?: boolean;
    }
  ) => {
    if (state.isLoadingSessions || !state.hasMoreSessions) {
      return;
    }

    setLoadingSessions(true);

    try {
      const nextPage = state.currentSessionsPage + 1;
      const params: SessionQueryParams = {
        class: classId,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
        availableOnly: filters?.availableOnly,
        page: nextPage,
        limit: 20,
        sortBy: 'dateTime',
        sortOrder: 'asc',
      };

      const response = await discoveryService.getSessions(params);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          classSessions: [...prev.classSessions, ...response.data.sessions],
          isLoadingSessions: false,
          hasMoreSessions: response.data.pagination.currentPage < response.data.pagination.totalPages,
          currentSessionsPage: response.data.pagination.currentPage,
        }));
      } else {
        setError(response.error || null);
      }
    } catch (error) {
      setError(error as ApiError);
    }
  }, [state.isLoadingSessions, state.hasMoreSessions, state.currentSessionsPage, setLoadingSessions, setError]);

  return {
    ...state,
    getClasses,
    getClassesByBrand,
    getSessionsByClass,
    searchClasses,
    loadMoreClasses,
    loadMoreSessions,
    selectClass,
    clearClasses,
    clearSessions,
    clearError,
  };
};
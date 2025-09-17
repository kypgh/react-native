import { useState, useEffect, useCallback, useMemo } from 'react';
import { Session, Brand, ClassInfo, ApiError } from '../types/api';
import { discoveryService } from '../services/api/discoveryService';
import { useErrorHandling } from './useErrorHandling';
import { useBrandId } from '../contexts/BrandContext';
import { isSameDay, addDays, startOfDay } from 'date-fns';

interface HomeDataState {
  brands: Brand[];
  sessions: Session[];
  categories: string[];
  selectedDate: Date;
  selectedCategory: string;
  isLoading: boolean;
  error: ApiError | null;
  isRefreshing: boolean;
}

interface HomeDataActions {
  setSelectedDate: (date: Date) => void;
  setSelectedCategory: (category: string) => void;
  refreshData: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  retryWithDelay: (delayMs?: number) => Promise<void>;
}

interface UseHomeDataReturn extends HomeDataState, HomeDataActions {
  filteredSessions: Session[];
  availableCategories: string[];
  availableDates: Date[];
  hasData: boolean;
  hasAnySessions: boolean;
}

/**
 * Custom hook for managing home screen data
 * Handles discovery data fetching, filtering, and state management
 */
export const useHomeData = (): UseHomeDataReturn => {
  const [state, setState] = useState<HomeDataState>({
    brands: [],
    sessions: [],
    categories: [],
    selectedDate: new Date(),
    selectedCategory: 'All Classes',
    isLoading: false,
    error: null,
    isRefreshing: false,
  });

  const brandId = useBrandId();
  const errorHandler = useErrorHandling('homeData');

  /**
   * Load initial data for the home screen
   */
  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get date range for the next 7 days
      const startDate = startOfDay(new Date());
      const endDate = addDays(startDate, 6);

      // Fetch available sessions for the selected brand
      const sessionsResponse = await discoveryService.getSessionsByDateRange(
        startDate,
        endDate,
        { 
          availableOnly: true,
          brandId: brandId || undefined // Use selected brand ID
        }
      );

      if (!sessionsResponse.success) {
        throw sessionsResponse.error || new Error('Failed to load sessions');
      }

      // Parse sessions from nested response structure
      let sessions: Session[] = [];
      if (Array.isArray(sessionsResponse.data?.data?.sessions)) {
        sessions = sessionsResponse.data.data.sessions;
      } else if (Array.isArray(sessionsResponse.data?.sessions)) {
        sessions = sessionsResponse.data.sessions;
      }

      console.log(`📅 Loaded ${sessions.length} sessions for brand`);

      // Extract unique brands and categories from sessions
      const uniqueBrands = new Map<string, Brand>();
      const uniqueCategories = new Set<string>();

      sessions.forEach(session => {
        // Add brand
        if (session.brand) {
          uniqueBrands.set(session.brand._id, {
            _id: session.brand._id,
            name: session.brand.name,
            logo: session.brand.logo,
            description: '',
            address: {
              street: '',
              city: session.brand.city || '',
              state: session.brand.state || '',
              zipCode: '',
              country: '',
            },
            contact: {},
            businessHours: [],
          });
        }

        // Add category
        if (session.class?.category) {
          uniqueCategories.add(session.class.category);
        }
      });

      const brands = Array.from(uniqueBrands.values());
      const categories = ['All Classes', ...Array.from(uniqueCategories).sort()];

      // Find the best default date (today or closest day with sessions)
      const today = startOfDay(new Date());
      const datesWithSessions = [...new Set(sessions.map(session => 
        startOfDay(new Date(session.dateTime)).getTime()
      ))].sort();
      
      let defaultDate = today;
      if (datesWithSessions.length > 0) {
        const todayTime = today.getTime();
        const hasSessionsToday = datesWithSessions.includes(todayTime);
        
        if (!hasSessionsToday) {
          // Find closest future date with sessions
          const futureDates = datesWithSessions.filter(date => date >= todayTime);
          if (futureDates.length > 0) {
            defaultDate = new Date(futureDates[0]);
          } else {
            // If no future dates, use the last available date
            defaultDate = new Date(datesWithSessions[datesWithSessions.length - 1]);
          }
        }
      }

      setState(prev => ({
        ...prev,
        brands,
        sessions: sessions,
        categories,
        selectedDate: defaultDate, // Set the smart default date
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('❌ Failed to load home data:', error);
      
      // Handle rate limit specifically
      if (error.statusCode === 429 || error.code === 'RATE_LIMIT') {
        setState(prev => ({
          ...prev,
          error: {
            type: 'RATE_LIMIT' as any,
            message: 'Too many requests. Please wait a moment and try again.',
            originalError: error,
          },
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: {
            type: 'SERVER_ERROR' as any,
            message: error.message || 'Failed to load data',
            originalError: error,
          },
          isLoading: false,
        }));
      }
    }
  }, []); // Remove all dependencies to prevent infinite loop

  /**
   * Refresh data (for pull-to-refresh)
   */
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      await loadInitialData();
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [loadInitialData]);

  /**
   * Retry with delay for rate limit errors
   */
  const retryWithDelay = useCallback(async (delayMs: number = 5000) => {
    console.log(`⏳ Waiting ${delayMs / 1000} seconds before retrying...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await loadInitialData();
  }, [loadInitialData]);

  /**
   * Set selected date and optionally fetch more data if needed
   */
  const setSelectedDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  /**
   * Set selected category filter
   */
  const setSelectedCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  /**
   * Filter sessions based on selected date and category
   * Always show sessions for the selected date, regardless of category availability
   */
  const filteredSessions = useMemo(() => {
    let filtered = state.sessions;

    // Filter by selected date
    filtered = filtered.filter(session => 
      isSameDay(new Date(session.dateTime), state.selectedDate)
    );

    // Filter by selected category (but don't hide categories)
    if (state.selectedCategory !== 'All Classes') {
      filtered = filtered.filter(session => 
        session.class?.category === state.selectedCategory
      );
    }

    // Sort by date/time
    filtered.sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    return filtered;
  }, [state.sessions, state.selectedDate, state.selectedCategory]);

  /**
   * Get all available categories (always show all categories, don't filter by date)
   */
  const availableCategories = useMemo(() => {
    return state.categories;
  }, [state.categories]);

  /**
   * Get dates that have available sessions
   */
  const availableDates = useMemo(() => {
    const datesWithSessions = new Set<number>();
    state.sessions.forEach(session => {
      const sessionDate = startOfDay(new Date(session.dateTime));
      datesWithSessions.add(sessionDate.getTime());
    });
    
    return Array.from(datesWithSessions).map(timestamp => new Date(timestamp));
  }, [state.sessions]);

  /**
   * Check if we have any data loaded
   */
  const hasData = useMemo(() => {
    return state.sessions.length > 0;
  }, [state.sessions]);

  /**
   * Check if we have any sessions at all
   */
  const hasAnySessions = useMemo(() => {
    return state.sessions.length > 0;
  }, [state.sessions]);

  // Load initial data on mount and when brand changes
  useEffect(() => {
    if (brandId) {
      // Add a longer delay to ensure auth is stable
      const timer = setTimeout(() => {
        loadInitialData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [brandId]); // Reload when brand changes

  return {
    ...state,
    filteredSessions,
    availableCategories,
    availableDates,
    hasData,
    hasAnySessions,
    setSelectedDate,
    setSelectedCategory,
    refreshData,
    loadInitialData,
    retryWithDelay,
  };
};
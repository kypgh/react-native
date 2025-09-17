import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/api/profileService';
import {
  ClientProfile,
  ProfileUpdateData,
  ApiResponse,
  ProfileResponse,
} from '../types/api';

interface UseProfileState {
  profile: ClientProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseProfileActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

interface UseProfileReturn extends UseProfileState, UseProfileActions {}

/**
 * Custom hook for profile state management
 * Provides profile data and actions with loading states and error handling
 */
export const useProfile = (): UseProfileReturn => {
  const [state, setState] = useState<UseProfileState>({
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    lastUpdated: null,
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<UseProfileState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle API response and update state
   */
  const handleApiResponse = useCallback(<T>(
    response: ApiResponse<T>,
    onSuccess?: (data: T) => void,
    context?: string
  ): boolean => {
    if (response.success) {
      onSuccess?.(response.data);
      updateState({ error: null });
      return true;
    } else {
      const errorMessage = response.error?.message || 'An error occurred';
      updateState({ error: errorMessage });
      
      if (__DEV__) {
        console.error(`Profile API Error (${context}):`, response.error);
      }
      
      return false;
    }
  }, [updateState]);

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async (): Promise<void> => {
    updateState({ isLoading: true, error: null });
    
    try {
      const response = await profileService.getProfile();
      
      handleApiResponse(
        response,
        (data: ProfileResponse) => {
          
          updateState({
            profile: data.data.client,
            lastUpdated: new Date(),
          });
        },
        'fetchProfile'
      );
    } catch (error) {
      updateState({ error: 'Failed to fetch profile' });
      
      if (__DEV__) {
        console.error('Profile fetch error:', error);
      }
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Update profile information
   */
  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updateProfile(data);
      
      const success = handleApiResponse(
        response,
        (responseData: ProfileResponse) => {
          updateState({
            profile: responseData.data.client,
            lastUpdated: new Date(),
          });
        },
        'updateProfile'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update profile' });
      
      if (__DEV__) {
        console.error('Profile update error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);



  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Refresh profile data (alias for fetchProfile)
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    await fetchProfile();
  }, [fetchProfile]);

  /**
   * Auto-fetch profile on mount
   */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    // State
    profile: state.profile,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    fetchProfile,
    updateProfile,
    clearError,
    refreshProfile,
  };
};

export default useProfile;
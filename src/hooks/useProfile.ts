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
  isUploadingPhoto: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseProfileActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  updatePreferences: (preferences: ClientProfile['preferences']) => Promise<boolean>;
  uploadProfilePhoto: (photoUri: string) => Promise<boolean>;
  deleteProfilePhoto: () => Promise<boolean>;
  updateNotificationPreferences: (notifications: ClientProfile['preferences']['notifications']) => Promise<boolean>;
  updateFavoriteCategories: (categories: string[]) => Promise<boolean>;
  updatePreferredDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => Promise<boolean>;
  updateTimezone: (timezone: string) => Promise<boolean>;
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
    isUploadingPhoto: false,
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
            profile: data.client,
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
            profile: responseData.client,
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
   * Update user preferences
   */
  const updatePreferences = useCallback(async (preferences: ClientProfile['preferences']): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updatePreferences(preferences);
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'updatePreferences'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update preferences' });
      
      if (__DEV__) {
        console.error('Preferences update error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Upload profile photo
   */
  const uploadProfilePhoto = useCallback(async (photoUri: string): Promise<boolean> => {
    updateState({ isUploadingPhoto: true, error: null });
    
    try {
      const response = await profileService.uploadProfilePhoto(photoUri);
      
      const success = handleApiResponse(
        response,
        (data: { profilePhoto: string }) => {
          // Update profile with new photo URL
          if (state.profile) {
            updateState({
              profile: {
                ...state.profile,
                profilePhoto: data.profilePhoto,
              },
              lastUpdated: new Date(),
            });
          }
        },
        'uploadProfilePhoto'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to upload profile photo' });
      
      if (__DEV__) {
        console.error('Photo upload error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUploadingPhoto: false });
    }
  }, [state.profile, updateState, handleApiResponse]);

  /**
   * Delete profile photo
   */
  const deleteProfilePhoto = useCallback(async (): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.deleteProfilePhoto();
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'deleteProfilePhoto'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to delete profile photo' });
      
      if (__DEV__) {
        console.error('Photo delete error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(async (
    notifications: ClientProfile['preferences']['notifications']
  ): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updateNotificationPreferences(notifications);
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'updateNotificationPreferences'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update notification preferences' });
      
      if (__DEV__) {
        console.error('Notification preferences update error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Update favorite categories
   */
  const updateFavoriteCategories = useCallback(async (categories: string[]): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updateFavoriteCategories(categories);
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'updateFavoriteCategories'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update favorite categories' });
      
      if (__DEV__) {
        console.error('Favorite categories update error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Update preferred difficulty
   */
  const updatePreferredDifficulty = useCallback(async (
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updatePreferredDifficulty(difficulty);
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'updatePreferredDifficulty'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update preferred difficulty' });
      
      if (__DEV__) {
        console.error('Preferred difficulty update error:', error);
      }
      
      return false;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, handleApiResponse]);

  /**
   * Update timezone preference
   */
  const updateTimezone = useCallback(async (timezone: string): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    try {
      const response = await profileService.updateTimezone(timezone);
      
      const success = handleApiResponse(
        response,
        (data: ProfileResponse) => {
          updateState({
            profile: data.client,
            lastUpdated: new Date(),
          });
        },
        'updateTimezone'
      );
      
      return success;
    } catch (error) {
      updateState({ error: 'Failed to update timezone' });
      
      if (__DEV__) {
        console.error('Timezone update error:', error);
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
    isUploadingPhoto: state.isUploadingPhoto,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    fetchProfile,
    updateProfile,
    updatePreferences,
    uploadProfilePhoto,
    deleteProfilePhoto,
    updateNotificationPreferences,
    updateFavoriteCategories,
    updatePreferredDifficulty,
    updateTimezone,
    clearError,
    refreshProfile,
  };
};

export default useProfile;
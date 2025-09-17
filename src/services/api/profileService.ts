import { BaseService } from '../baseService';
import {
  ApiResponse,
  ClientProfile,
  ProfileResponse,
  ProfileUpdateData,
} from '../../types/api';
import { createImageFormData, validateProfileImage, ImagePickerResult } from '../../utils/imageUtils';

/**
 * Profile Service for user data CRUD operations
 * Handles profile management, preferences, and photo uploads
 */
export class ProfileService extends BaseService {
  private readonly basePath = '/client/profile';

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.get<ProfileResponse>(this.basePath, 'ProfileService.getProfile');
  }

  /**
   * Update user profile information
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<ApiResponse<ProfileResponse>> {
    return this.put<ProfileResponse>(
      this.basePath,
      profileData,
      'ProfileService.updateProfile'
    );
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: ClientProfile['preferences']): Promise<ApiResponse<ProfileResponse>> {
    return this.patch<ProfileResponse>(
      `${this.basePath}/preferences`,
      { preferences },
      'ProfileService.updatePreferences'
    );
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(photoUri: string): Promise<ApiResponse<{ profilePhoto: string }>> {
    try {
      // Create image object for validation
      const imageData: ImagePickerResult = {
        uri: photoUri,
        type: 'image/jpeg', // Default type, could be enhanced to detect actual type
        name: 'profile-photo.jpg',
      };

      // Validate image
      const validation = validateProfileImage(imageData);
      if (!validation.isValid) {
        return {
          success: false,
          data: { profilePhoto: '' },
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: validation.error || 'Invalid image file',
            code: 'INVALID_IMAGE',
          },
        };
      }

      // Create FormData for file upload
      const formData = createImageFormData(photoUri, 'profilePhoto', 'profile-photo.jpg');

      // Use the httpClient directly for file upload with different content type
      const response = await this.httpClient.post<{ profilePhoto: string }>(
        `${this.basePath}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error) {
      return {
        success: false,
        data: { profilePhoto: '' },
        error: {
          type: 'SERVER_ERROR' as any,
          message: 'Failed to upload profile photo',
          code: 'PHOTO_UPLOAD_FAILED',
        },
      };
    }
  }

  /**
   * Delete profile photo
   */
  async deleteProfilePhoto(): Promise<ApiResponse<ProfileResponse>> {
    return this.delete<ProfileResponse>(
      `${this.basePath}/photo`,
      'ProfileService.deleteProfilePhoto'
    );
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    notifications: ClientProfile['preferences']['notifications']
  ): Promise<ApiResponse<ProfileResponse>> {
    return this.patch<ProfileResponse>(
      `${this.basePath}/preferences/notifications`,
      { notifications },
      'ProfileService.updateNotificationPreferences'
    );
  }

  /**
   * Update favorite categories
   */
  async updateFavoriteCategories(categories: string[]): Promise<ApiResponse<ProfileResponse>> {
    return this.patch<ProfileResponse>(
      `${this.basePath}/preferences/categories`,
      { favoriteCategories: categories },
      'ProfileService.updateFavoriteCategories'
    );
  }

  /**
   * Update preferred difficulty
   */
  async updatePreferredDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ApiResponse<ProfileResponse>> {
    return this.patch<ProfileResponse>(
      `${this.basePath}/preferences/difficulty`,
      { preferredDifficulty: difficulty },
      'ProfileService.updatePreferredDifficulty'
    );
  }

  /**
   * Update timezone preference
   */
  async updateTimezone(timezone: string): Promise<ApiResponse<ProfileResponse>> {
    return this.patch<ProfileResponse>(
      `${this.basePath}/preferences/timezone`,
      { timezone },
      'ProfileService.updateTimezone'
    );
  }

  /**
   * Validate profile data before sending to API
   */
  protected validateRequest<T>(data: T): boolean {
    if (data && typeof data === 'object') {
      const profileData = data as any;
      
      // Validate email format if provided
      if (profileData.email && !this.isValidEmail(profileData.email)) {
        return false;
      }
      
      // Validate phone format if provided
      if (profileData.phone && !this.isValidPhone(profileData.phone)) {
        return false;
      }
      
      // Validate difficulty level if provided
      if (profileData.preferences?.preferredDifficulty) {
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(profileData.preferences.preferredDifficulty)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Transform profile data before sending to API
   */
  protected transformRequest<T>(data: T): T {
    if (data && typeof data === 'object') {
      const profileData = { ...data } as any;
      
      // Trim string fields
      if (profileData.firstName) {
        profileData.firstName = profileData.firstName.trim();
      }
      if (profileData.lastName) {
        profileData.lastName = profileData.lastName.trim();
      }
      if (profileData.email) {
        profileData.email = profileData.email.trim().toLowerCase();
      }
      if (profileData.phone) {
        profileData.phone = profileData.phone.trim();
      }
      
      // Clean up preferences
      if (profileData.preferences) {
        if (profileData.preferences.favoriteCategories) {
          profileData.preferences.favoriteCategories = profileData.preferences.favoriteCategories
            .filter((category: string) => category && category.trim())
            .map((category: string) => category.trim());
        }
      }
      
      return profileData as T;
    }
    
    return data;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (basic validation)
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
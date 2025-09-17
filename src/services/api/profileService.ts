import { BaseService } from '../baseService';
import {
  ApiResponse,
  ClientProfile,
  ProfileResponse,
  ProfileUpdateData,
} from '../../types/api';

/**
 * Profile Service for user data operations
 * Handles profile management according to available API endpoints
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
   * Note: This is the only update endpoint available in the API
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<ApiResponse<ProfileResponse>> {
    return this.put<ProfileResponse>(
      this.basePath,
      profileData,
      'ProfileService.updateProfile'
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
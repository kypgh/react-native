import { BaseService } from '../baseService';
import {
  ApiResponse,
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
  SubscriptionPlansResponse,
  CreditPlansResponse,
} from '../../types/api';

/**
 * Discovery Service for browsing brands, classes, and sessions
 * Handles all discovery-related API calls with search and filtering
 */
export class DiscoveryService extends BaseService {
  private readonly basePath = '/client/discovery';

  /**
   * Browse all brands with filtering and search
   */
  async getBrands(params?: BrandQueryParams): Promise<ApiResponse<BrandsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/brands${queryString}`;
    
    return this.get<BrandsResponse>(url, 'DiscoveryService.getBrands');
  }

  /**
   * Get brand details with class information
   */
  async getBrandDetails(brandId: string): Promise<ApiResponse<BrandDetailsResponse>> {
    const url = `${this.basePath}/brands/${brandId}`;
    
    return this.get<BrandDetailsResponse>(url, `DiscoveryService.getBrandDetails(${brandId})`);
  }

  /**
   * Browse classes with filtering
   */
  async getClasses(params?: ClassQueryParams): Promise<ApiResponse<ClassesResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/classes${queryString}`;
    
    return this.get<ClassesResponse>(url, 'DiscoveryService.getClasses');
  }

  /**
   * Browse sessions with date and availability filtering
   */
  async getSessions(params?: SessionQueryParams): Promise<ApiResponse<SessionsResponse>> {
    const queryString = this.buildQueryString(params);
    const url = `${this.basePath}/sessions${queryString}`;
    
    return this.get<SessionsResponse>(url, 'DiscoveryService.getSessions');
  }

  /**
   * Get available subscription plans for a brand
   */
  async getSubscriptionPlans(brandId: string): Promise<ApiResponse<SubscriptionPlansResponse>> {
    const url = `${this.basePath}/brands/${brandId}/subscription-plans`;
    
    return this.get<SubscriptionPlansResponse>(url, `DiscoveryService.getSubscriptionPlans(${brandId})`);
  }

  /**
   * Get available credit plans for a brand
   */
  async getCreditPlans(brandId: string): Promise<ApiResponse<CreditPlansResponse>> {
    const url = `${this.basePath}/brands/${brandId}/credit-plans`;
    
    return this.get<CreditPlansResponse>(url, `DiscoveryService.getCreditPlans(${brandId})`);
  }

  /**
   * Search brands by name or location
   */
  async searchBrands(searchTerm: string, location?: { city?: string; state?: string }): Promise<ApiResponse<BrandsResponse>> {
    const params: BrandQueryParams = {
      search: searchTerm,
      ...location,
      status: 'active',
    };
    
    return this.getBrands(params);
  }

  /**
   * Search classes by name, category, or difficulty
   */
  async searchClasses(
    searchTerm: string,
    filters?: {
      category?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      brandId?: string;
      location?: { city?: string; state?: string };
    }
  ): Promise<ApiResponse<ClassesResponse>> {
    const params: ClassQueryParams = {
      search: searchTerm,
      category: filters?.category,
      difficulty: filters?.difficulty,
      brand: filters?.brandId,
      city: filters?.location?.city,
      state: filters?.location?.state,
    };
    
    return this.getClasses(params);
  }

  /**
   * Get sessions with availability checking
   */
  async getAvailableSessions(
    filters?: {
      brandId?: string;
      classId?: string;
      category?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      startDate?: Date;
      endDate?: Date;
      location?: { city?: string; state?: string };
    }
  ): Promise<ApiResponse<SessionsResponse>> {
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
      sortBy: 'dateTime',
      sortOrder: 'asc',
    };
    
    return this.getSessions(params);
  }

  /**
   * Get sessions for a specific date range
   */
  async getSessionsByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: {
      brandId?: string;
      classId?: string;
      availableOnly?: boolean;
    }
  ): Promise<ApiResponse<SessionsResponse>> {
    const params: SessionQueryParams = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      brand: filters?.brandId,
      class: filters?.classId,
      availableOnly: filters?.availableOnly,
      sortBy: 'dateTime',
      sortOrder: 'asc',
    };
    
    return this.getSessions(params);
  }

  /**
   * Get classes for a specific brand
   */
  async getClassesByBrand(brandId: string): Promise<ApiResponse<ClassesResponse>> {
    const params: ClassQueryParams = {
      brand: brandId,
      sortBy: 'name',
      sortOrder: 'asc',
    };
    
    return this.getClasses(params);
  }

  /**
   * Get sessions for a specific class
   */
  async getSessionsByClass(
    classId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      availableOnly?: boolean;
    }
  ): Promise<ApiResponse<SessionsResponse>> {
    const params: SessionQueryParams = {
      class: classId,
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
      availableOnly: filters?.availableOnly,
      sortBy: 'dateTime',
      sortOrder: 'asc',
    };
    
    return this.getSessions(params);
  }

  /**
   * Build query string from parameters object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return filteredParams ? `?${filteredParams}` : '';
  }
}

// Export singleton instance
export const discoveryService = new DiscoveryService();
export default discoveryService;
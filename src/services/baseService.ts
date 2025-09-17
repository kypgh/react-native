import { ApiResponse, ApiError, ApiErrorType } from '../types/api';
import httpClient from './apiConfig';
import { getRetryDelay, isRetryableError, logError } from './errorHandler';

export abstract class BaseService {
  protected httpClient = httpClient;

  /**
   * Make API request with retry logic
   */
  protected async makeRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    context?: string
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        
        if (response.success) {
          return response;
        }

        // If not successful, check if we should retry
        if (response.error && isRetryableError(response.error) && attempt < maxRetries) {
          lastError = response.error;
          const delay = getRetryDelay(attempt);
          
          if (__DEV__) {
            console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          }
          
          await this.delay(delay);
          continue;
        }

        // Not retryable or max retries reached
        if (response.error) {
          logError(response.error, context);
        }
        
        return response;
      } catch (error) {
        lastError = error as ApiError;
        
        if (isRetryableError(lastError) && attempt < maxRetries) {
          const delay = getRetryDelay(attempt);
          
          if (__DEV__) {
            console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          }
          
          await this.delay(delay);
          continue;
        }

        // Not retryable or max retries reached
        logError(lastError, context);
        break;
      }
    }

    // Return error response
    return {
      success: false,
      data: {} as T,
      error: lastError || {
        type: ApiErrorType.SERVER_ERROR,
        message: 'Request failed after maximum retries',
        code: 'MAX_RETRIES_EXCEEDED',
      },
    };
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform data before sending to API
   */
  protected transformRequest<T>(data: T): T {
    // Override in subclasses if needed
    return data;
  }

  /**
   * Transform data received from API
   */
  protected transformResponse<T>(data: T): T {
    // Override in subclasses if needed
    return data;
  }

  /**
   * Validate request data
   */
  protected validateRequest<T>(data: T): boolean {
    // Override in subclasses if needed
    return true;
  }

  /**
   * Handle common API operations with consistent error handling
   */
  protected async get<T>(url: string, context?: string): Promise<ApiResponse<T>> {
    return this.makeRequest(
      () => this.httpClient.get<T>(url),
      3,
      context || `GET ${url}`
    );
  }

  protected async post<T>(url: string, data?: any, context?: string): Promise<ApiResponse<T>> {
    const transformedData = this.transformRequest(data);
    
    return this.makeRequest(
      () => this.httpClient.post<T>(url, transformedData),
      3,
      context || `POST ${url}`
    );
  }

  protected async put<T>(url: string, data?: any, context?: string): Promise<ApiResponse<T>> {
    const transformedData = this.transformRequest(data);
    
    return this.makeRequest(
      () => this.httpClient.put<T>(url, transformedData),
      3,
      context || `PUT ${url}`
    );
  }

  protected async patch<T>(url: string, data?: any, context?: string): Promise<ApiResponse<T>> {
    const transformedData = this.transformRequest(data);
    
    return this.makeRequest(
      () => this.httpClient.patch<T>(url, transformedData),
      3,
      context || `PATCH ${url}`
    );
  }

  protected async delete<T>(url: string, context?: string): Promise<ApiResponse<T>> {
    return this.makeRequest(
      () => this.httpClient.delete<T>(url),
      3,
      context || `DELETE ${url}`
    );
  }
}

export default BaseService;
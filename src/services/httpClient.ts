import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError, ApiErrorType, ApiResponse } from '../types/api';

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;
  private authToken: string | null = null;
  private refreshInProgress: boolean = false;
  private consecutiveRefreshFailures: number = 0;
  private readonly MAX_REFRESH_FAILURES = 3;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Get fresh token from AuthManager if no token is set
        if (!this.authToken) {
          try {
            const AuthManager = (await import('./auth/authManager')).default;
            const authManager = AuthManager.getInstance();
            const token = await authManager.getAccessToken();
            if (token) {
              this.authToken = token;
            }
          } catch (error) {
            // Ignore auth errors for non-authenticated requests
          }
        }

        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(this.transformError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        if (__DEV__) {
          const status = error.response?.status || 'No Response';
          const url = error.config?.url || 'Unknown URL';
          const method = error.config?.method?.toUpperCase() || 'Unknown Method';
          console.error(`❌ API Error: ${status} ${method} ${url}`, error.response?.data || error.message);
        }

        // Handle token refresh logic for 401 errors
        if (error.response?.status === 401 && this.authToken && !this.refreshInProgress) {
          // Check if we've had too many consecutive failures
          if (this.consecutiveRefreshFailures >= this.MAX_REFRESH_FAILURES) {
            console.log('🚨 Too many consecutive refresh failures, clearing tokens');
            this.clearAuthToken();
            const AuthManager = (await import('./auth/authManager')).default;
            const authManager = AuthManager.getInstance();
            await authManager.clearTokens();
            return Promise.reject(error);
          }

          try {
            this.refreshInProgress = true;
            const AuthManager = (await import('./auth/authManager')).default;
            const authManager = AuthManager.getInstance();
            
            console.log('🔄 Attempting token refresh due to 401 error');
            
            // Try to refresh token
            const newToken = await authManager.refreshAccessToken();
            if (newToken && error.config) {
              this.authToken = newToken;
              this.consecutiveRefreshFailures = 0; // Reset failure counter on success
              
              // Retry the original request with new token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log('🔄 Retrying original request with new token');
              return this.client.request(originalRequest);
            } else {
              // Refresh failed, increment failure counter
              this.consecutiveRefreshFailures++;
              console.log(`🔐 Token refresh failed (${this.consecutiveRefreshFailures}/${this.MAX_REFRESH_FAILURES})`);
              
              if (this.consecutiveRefreshFailures >= this.MAX_REFRESH_FAILURES) {
                console.log('🚨 Max refresh failures reached, clearing all tokens');
                this.clearAuthToken();
                await authManager.clearTokens();
              }
            }
          } catch (refreshError) {
            // Refresh failed, increment failure counter
            this.consecutiveRefreshFailures++;
            console.log(`🔐 Token refresh error (${this.consecutiveRefreshFailures}/${this.MAX_REFRESH_FAILURES}):`, refreshError);
            
            if (this.consecutiveRefreshFailures >= this.MAX_REFRESH_FAILURES) {
              console.log('🚨 Max refresh failures reached, clearing all tokens');
              this.clearAuthToken();
              const AuthManager = (await import('./auth/authManager')).default;
              const authManager = AuthManager.getInstance();
              await authManager.clearTokens();
            }
          } finally {
            this.refreshInProgress = false;
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (!axiosError.response) {
        // Network error
        return {
          type: ApiErrorType.NETWORK_ERROR,
          message: 'Network connection failed. Please check your internet connection.',
          code: 'NETWORK_ERROR',
        };
      }

      const { status, data } = axiosError.response;
      
      switch (status) {
        case 400:
          return {
            type: ApiErrorType.VALIDATION_ERROR,
            message: (data as any)?.message || 'Invalid request data.',
            code: (data as any)?.code || 'VALIDATION_ERROR',
            statusCode: status,
            details: (data as any)?.details,
          };
        
        case 401:
          return {
            type: ApiErrorType.AUTHENTICATION_ERROR,
            message: 'Authentication failed. Please log in again.',
            code: 'AUTHENTICATION_ERROR',
            statusCode: status,
          };
        
        case 403:
          return {
            type: ApiErrorType.AUTHENTICATION_ERROR,
            message: 'Access denied. You do not have permission to perform this action.',
            code: 'FORBIDDEN',
            statusCode: status,
          };
        
        case 404:
          return {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'The requested resource was not found.',
            code: 'NOT_FOUND',
            statusCode: status,
          };
        
        case 429:
          return {
            type: ApiErrorType.SERVER_ERROR,
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT',
            statusCode: status,
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ApiErrorType.SERVER_ERROR,
            message: 'Server error. Please try again later.',
            code: 'SERVER_ERROR',
            statusCode: status,
          };
        
        default:
          return {
            type: ApiErrorType.SERVER_ERROR,
            message: (data as any)?.message || 'An unexpected error occurred.',
            code: (data as any)?.code || 'UNKNOWN_ERROR',
            statusCode: status,
          };
      }
    }

    if (error.code === 'ECONNABORTED') {
      return {
        type: ApiErrorType.TIMEOUT_ERROR,
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
      };
    }

    return {
      type: ApiErrorType.SERVER_ERROR,
      message: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
    };
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    // Reset failure counter when setting a new token (successful auth)
    this.consecutiveRefreshFailures = 0;
  }

  public clearAuthToken(): void {
    this.authToken = null;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error as ApiError,
      };
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error as ApiError,
      };
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error as ApiError,
      };
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error as ApiError,
      };
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error as ApiError,
      };
    }
  }
}

export default HttpClient;
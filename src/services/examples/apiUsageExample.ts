/**
 * Example usage of the API infrastructure
 * This file demonstrates how to use the HTTP client and error handling
 */

import { httpClient, API_ENDPOINTS, getErrorMessage, logError } from '../index';
import { ApiResponse, User, LoginCredentials } from '../../types/api';

// Example: Making a simple API call
export async function exampleApiCall(): Promise<void> {
  try {
    // Example GET request
    const response: ApiResponse<User[]> = await httpClient.get<User[]>(API_ENDPOINTS.DISCOVERY.BRANDS);
    
    if (response.success) {
      console.log('✅ API call successful:', response.data);
    } else {
      // Handle error with user-friendly message
      const errorMessage = getErrorMessage(response.error!);
      console.error('❌ API call failed:', errorMessage);
      
      // Log detailed error for debugging
      logError(response.error!, 'Example API Call');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Example: Making a POST request with data
export async function exampleLoginCall(credentials: LoginCredentials): Promise<ApiResponse<User>> {
  const response = await httpClient.post<User>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials
  );
  
  if (!response.success && response.error) {
    // Log error for debugging
    logError(response.error, 'Login Attempt');
  }
  
  return response;
}

// Example: Setting authentication token
export function setAuthenticationToken(token: string): void {
  httpClient.setAuthToken(token);
}

// Example: Clearing authentication
export function clearAuthentication(): void {
  httpClient.clearAuthToken();
}

export default {
  exampleApiCall,
  exampleLoginCall,
  setAuthenticationToken,
  clearAuthentication,
};
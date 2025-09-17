import { useCallback } from 'react';
import { useError, useOperationError } from '../contexts/ErrorContext';
import { useLoading, useOperationLoading } from '../contexts/LoadingContext';
import { useNetworkState } from '../services/networkService';
import { ApiError, ApiErrorType } from '../types/api';
import { getErrorMessage, isRetryableError, getRetryDelay } from '../services/errorHandler';

/**
 * Comprehensive error handling hook that combines error state, loading state, and network awareness
 */
export const useErrorHandling = (operationKey?: string) => {
  const errorContext = useError();
  const loadingContext = useLoading();
  const networkState = useNetworkState();

  // Operation-specific hooks if key is provided
  const operationError = operationKey ? useOperationError(operationKey) : null;
  const operationLoading = operationKey ? useOperationLoading(operationKey) : null;

  /**
   * Execute an async operation with comprehensive error and loading handling
   */
  const executeWithHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationKey?: string;
      loadingMessage?: string;
      retryAttempts?: number;
      retryDelay?: number;
      onSuccess?: (result: T) => void;
      onError?: (error: ApiError) => void;
      onRetry?: (attempt: number) => void;
      suppressGlobalError?: boolean;
    } = {}
  ): Promise<T | null> => {
    const {
      operationKey: opKey = operationKey,
      loadingMessage = 'Loading...',
      retryAttempts = 3,
      retryDelay = 1000,
      onSuccess,
      onError,
      onRetry,
      suppressGlobalError = false,
    } = options;

    if (!opKey) {
      throw new Error('Operation key is required for executeWithHandling');
    }

    let attempt = 0;
    const maxAttempts = retryAttempts + 1; // Initial attempt + retries

    const executeAttempt = async (): Promise<T | null> => {
      attempt++;
      
      try {
        // Start loading
        loadingContext.startLoading(opKey, loadingMessage);
        
        // Clear any previous errors
        errorContext.clearError(opKey);

        // Check network connectivity
        if (!networkState.isConnected) {
          throw errorContext.createNetworkError('No internet connection');
        }

        // Execute the operation
        const result = await operation();

        // Success callback
        if (onSuccess) {
          onSuccess(result);
        }

        return result;

      } catch (error: any) {
        // Handle the error
        errorContext.handleApiError(opKey, error);
        const apiError = errorContext.getError(opKey);

        if (apiError) {
          // Check if we should retry
          const shouldRetry = attempt < maxAttempts && 
                             isRetryableError(apiError) && 
                             networkState.isConnected;

          if (shouldRetry) {
            // Increment retry count
            errorContext.incrementRetry(opKey);
            
            // Retry callback
            if (onRetry) {
              onRetry(attempt);
            }

            // Wait before retry
            const delay = getRetryDelay(attempt - 1, retryDelay);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Update loading message for retry
            loadingContext.updateLoadingMessage(
              opKey, 
              `Retrying... (${attempt}/${maxAttempts - 1})`
            );

            // Recursive retry
            return executeAttempt();
          } else {
            // No more retries, handle final error
            if (onError) {
              onError(apiError);
            }

            // Set global error if it's critical and not suppressed
            if (!suppressGlobalError && shouldSetGlobalError(apiError)) {
              errorContext.setGlobalError(apiError);
            }
          }
        }

        return null;
      } finally {
        // Stop loading
        loadingContext.stopLoading(opKey);
      }
    };

    return executeAttempt();
  }, [
    operationKey,
    errorContext,
    loadingContext,
    networkState,
  ]);

  /**
   * Retry a failed operation
   */
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationKey?: string;
      loadingMessage?: string;
    } = {}
  ): Promise<T | null> => {
    const opKey = options.operationKey || operationKey;
    if (!opKey) {
      throw new Error('Operation key is required for retryOperation');
    }

    // Clear the error and increment retry count
    errorContext.clearError(opKey);
    errorContext.incrementRetry(opKey);

    return executeWithHandling(operation, {
      ...options,
      operationKey: opKey,
      retryAttempts: 0, // No additional retries for manual retry
    });
  }, [operationKey, errorContext, executeWithHandling]);

  /**
   * Clear all errors and loading states for the operation
   */
  const clearOperationState = useCallback(() => {
    if (operationKey) {
      errorContext.clearError(operationKey);
      loadingContext.stopLoading(operationKey);
    }
  }, [operationKey, errorContext, loadingContext]);

  /**
   * Get comprehensive operation state
   */
  const getOperationState = useCallback(() => {
    if (!operationKey) return null;

    const error = errorContext.getError(operationKey);
    const isLoading = loadingContext.isLoading(operationKey);
    const loadingMessage = loadingContext.getLoadingMessage(operationKey);
    const retryCount = errorContext.getRetryCount(operationKey);
    const canRetry = errorContext.canRetry(operationKey);

    return {
      error,
      isLoading,
      loadingMessage,
      retryCount,
      canRetry,
      hasError: !!error,
      errorMessage: error ? getErrorMessage(error) : undefined,
      isRetryable: error ? isRetryableError(error) : false,
    };
  }, [operationKey, errorContext, loadingContext]);

  return {
    // Core functionality
    executeWithHandling,
    retryOperation,
    clearOperationState,
    getOperationState,

    // Direct access to contexts
    errorContext,
    loadingContext,
    networkState,

    // Operation-specific state (if operationKey provided)
    ...(operationError && operationLoading ? {
      error: operationError.error,
      hasError: operationError.hasError,
      errorMessage: operationError.errorMessage,
      isLoading: operationLoading.isLoading,
      loadingMessage: operationLoading.loadingMessage,
      retryCount: operationError.retryCount,
      canRetry: operationError.canRetry,
      setError: operationError.setError,
      clearError: operationError.clearError,
      startLoading: operationLoading.startLoading,
      stopLoading: operationLoading.stopLoading,
      withLoading: operationLoading.withLoading,
    } : {}),

    // Global state
    globalError: errorContext.state.globalError,
    hasGlobalError: !!errorContext.state.globalError,
    isAnyLoading: loadingContext.isAnyLoading(),
    hasAnyError: errorContext.hasAnyError(),
    
    // Network state
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    networkQuality: networkState.networkQuality,
  };
};

/**
 * Determine if an error should be set as a global error
 */
const shouldSetGlobalError = (error: ApiError): boolean => {
  // Set global error for authentication errors
  if (error.type === ApiErrorType.AUTHENTICATION_ERROR) {
    return true;
  }

  // Set global error for critical server errors
  if (error.type === ApiErrorType.SERVER_ERROR && error.statusCode && error.statusCode >= 500) {
    return true;
  }

  // Set global error for network errors that affect the entire app
  if (error.type === ApiErrorType.NETWORK_ERROR && error.code === 'NO_CONNECTION') {
    return true;
  }

  return false;
};

/**
 * Hook for handling multiple related operations
 */
export const useMultipleOperationsErrorHandling = (operationKeys: string[]) => {
  const errorContext = useError();
  const loadingContext = useLoading();
  const networkState = useNetworkState();

  const executeMultipleWithHandling = useCallback(async <T>(
    operations: Array<{
      key: string;
      operation: () => Promise<T>;
      loadingMessage?: string;
    }>,
    options: {
      parallel?: boolean;
      stopOnFirstError?: boolean;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<Array<T | null>> => {
    const { parallel = false, stopOnFirstError = false, onProgress } = options;
    const results: Array<T | null> = [];

    if (parallel) {
      // Execute all operations in parallel
      const promises = operations.map(async ({ key, operation, loadingMessage }) => {
        const handler = useErrorHandling(key);
        return handler.executeWithHandling(operation, { loadingMessage });
      });

      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[index] = result.value;
        } else {
          results[index] = null;
        }
      });
    } else {
      // Execute operations sequentially
      for (let i = 0; i < operations.length; i++) {
        const { key, operation, loadingMessage } = operations[i];
        const handler = useErrorHandling(key);
        
        try {
          const result = await handler.executeWithHandling(operation, { loadingMessage });
          results[i] = result;
          
          if (onProgress) {
            onProgress(i + 1, operations.length);
          }
        } catch (error) {
          results[i] = null;
          
          if (stopOnFirstError) {
            break;
          }
        }
      }
    }

    return results;
  }, []);

  const getMultipleOperationsState = useCallback(() => {
    return operationKeys.map(key => {
      const error = errorContext.getError(key);
      const isLoading = loadingContext.isLoading(key);
      const loadingMessage = loadingContext.getLoadingMessage(key);
      const retryCount = errorContext.getRetryCount(key);
      const canRetry = errorContext.canRetry(key);

      return {
        key,
        error,
        isLoading,
        loadingMessage,
        retryCount,
        canRetry,
        hasError: !!error,
        errorMessage: error ? getErrorMessage(error) : undefined,
      };
    });
  }, [operationKeys, errorContext, loadingContext]);

  const clearAllOperationsState = useCallback(() => {
    operationKeys.forEach(key => {
      errorContext.clearError(key);
      loadingContext.stopLoading(key);
    });
  }, [operationKeys, errorContext, loadingContext]);

  return {
    executeMultipleWithHandling,
    getMultipleOperationsState,
    clearAllOperationsState,
    operationStates: getMultipleOperationsState(),
    hasAnyError: operationKeys.some(key => errorContext.hasError(key)),
    isAnyLoading: operationKeys.some(key => loadingContext.isLoading(key)),
  };
};

export default useErrorHandling;
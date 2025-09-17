import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { ApiError, ApiErrorType } from '../types/api';
import { getErrorMessage, isRetryableError, requiresAuthentication, logError } from '../services/errorHandler';
import { networkService, NetworkService } from '../services/networkService';

// Error state interface
export interface ErrorState {
  errors: Record<string, ApiError>;
  globalError: ApiError | null;
  isShowingError: boolean;
  retryAttempts: Record<string, number>;
}

// Error actions
type ErrorAction =
  | { type: 'SET_ERROR'; payload: { key: string; error: ApiError } }
  | { type: 'CLEAR_ERROR'; payload: { key: string } }
  | { type: 'SET_GLOBAL_ERROR'; payload: { error: ApiError } }
  | { type: 'CLEAR_GLOBAL_ERROR' }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'INCREMENT_RETRY'; payload: { key: string } }
  | { type: 'RESET_RETRY'; payload: { key: string } }
  | { type: 'SHOW_ERROR'; payload: { show: boolean } };

// Error context interface
interface ErrorContextType {
  state: ErrorState;
  setError: (key: string, error: ApiError) => void;
  clearError: (key: string) => void;
  setGlobalError: (error: ApiError) => void;
  clearGlobalError: () => void;
  clearAllErrors: () => void;
  getError: (key: string) => ApiError | undefined;
  hasError: (key: string) => boolean;
  hasAnyError: () => boolean;
  getRetryCount: (key: string) => number;
  incrementRetry: (key: string) => void;
  resetRetry: (key: string) => void;
  canRetry: (key: string, maxRetries?: number) => boolean;
  showError: (show: boolean) => void;
  handleApiError: (key: string, error: any, context?: string) => void;
  createNetworkError: (message?: string) => ApiError;
}

// Initial state
const initialState: ErrorState = {
  errors: {},
  globalError: null,
  isShowingError: false,
  retryAttempts: {},
};

// Error reducer
const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };

    case 'CLEAR_ERROR':
      const { [action.payload.key]: removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload.error,
        isShowingError: true,
      };

    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null,
        isShowingError: false,
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {},
        globalError: null,
        isShowingError: false,
        retryAttempts: {},
      };

    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryAttempts: {
          ...state.retryAttempts,
          [action.payload.key]: (state.retryAttempts[action.payload.key] || 0) + 1,
        },
      };

    case 'RESET_RETRY':
      const { [action.payload.key]: removedRetry, ...remainingRetries } = state.retryAttempts;
      return {
        ...state,
        retryAttempts: remainingRetries,
      };

    case 'SHOW_ERROR':
      return {
        ...state,
        isShowingError: action.payload.show,
      };

    default:
      return state;
  }
};

// Create context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Error provider component
interface ErrorProviderProps {
  children: ReactNode;
  maxRetries?: number;
  autoRetryDelay?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxRetries = 3,
  autoRetryDelay = 1000,
}) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Set error for a specific key
  const setError = useCallback((key: string, error: ApiError) => {
    logError(error, key);
    dispatch({ type: 'SET_ERROR', payload: { key, error } });
  }, []);

  // Clear error for a specific key
  const clearError = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: { key } });
    dispatch({ type: 'RESET_RETRY', payload: { key } });
  }, []);

  // Set global error
  const setGlobalError = useCallback((error: ApiError) => {
    logError(error, 'GLOBAL');
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: { error } });
  }, []);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  // Get error by key
  const getError = useCallback((key: string): ApiError | undefined => {
    return state.errors[key];
  }, [state.errors]);

  // Check if error exists for key
  const hasError = useCallback((key: string): boolean => {
    return key in state.errors;
  }, [state.errors]);

  // Check if any error exists
  const hasAnyError = useCallback((): boolean => {
    return Object.keys(state.errors).length > 0 || state.globalError !== null;
  }, [state.errors, state.globalError]);

  // Get retry count for key
  const getRetryCount = useCallback((key: string): number => {
    return state.retryAttempts[key] || 0;
  }, [state.retryAttempts]);

  // Increment retry count
  const incrementRetry = useCallback((key: string) => {
    dispatch({ type: 'INCREMENT_RETRY', payload: { key } });
  }, []);

  // Reset retry count
  const resetRetry = useCallback((key: string) => {
    dispatch({ type: 'RESET_RETRY', payload: { key } });
  }, []);

  // Check if can retry
  const canRetry = useCallback((key: string, maxRetriesOverride?: number): boolean => {
    const error = getError(key);
    if (!error || !isRetryableError(error)) return false;
    
    const retryCount = getRetryCount(key);
    const maxRetriesLimit = maxRetriesOverride ?? maxRetries;
    return retryCount < maxRetriesLimit;
  }, [getError, getRetryCount, maxRetries]);

  // Show/hide error
  const showError = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_ERROR', payload: { show } });
  }, []);

  // Create network error
  const createNetworkError = useCallback((message?: string): ApiError => {
    return networkService.createNetworkError(message);
  }, []);

  // Handle API error with automatic processing
  const handleApiError = useCallback((key: string, error: any, context?: string) => {
    let apiError: ApiError;

    // Transform various error types to ApiError
    if (error && typeof error === 'object') {
      if (error.type && Object.values(ApiErrorType).includes(error.type)) {
        // Already an ApiError
        apiError = error as ApiError;
      } else if (error.response) {
        // Axios error
        const status = error.response.status;
        const data = error.response.data;
        
        apiError = {
          type: status >= 500 ? ApiErrorType.SERVER_ERROR : 
                status === 401 ? ApiErrorType.AUTHENTICATION_ERROR :
                status >= 400 ? ApiErrorType.VALIDATION_ERROR : 
                ApiErrorType.SERVER_ERROR,
          message: data?.message || error.message || 'Request failed',
          code: data?.code || error.code,
          statusCode: status,
          details: data?.details || { originalError: error },
        };
      } else if (NetworkService.isNetworkError(error)) {
        // Network error
        apiError = createNetworkError(error.message);
      } else {
        // Generic error
        apiError = {
          type: ApiErrorType.SERVER_ERROR,
          message: error.message || 'An unexpected error occurred',
          code: error.code || 'UNKNOWN_ERROR',
          details: { originalError: error },
        };
      }
    } else {
      // String or other primitive error
      apiError = {
        type: ApiErrorType.SERVER_ERROR,
        message: typeof error === 'string' ? error : 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }

    // Set the error
    setError(key, apiError);

    // Handle authentication errors
    if (requiresAuthentication(apiError)) {
      setGlobalError({
        ...apiError,
        message: 'Your session has expired. Please log in again.',
      });
    }

    // Log error with context
    if (context) {
      logError(apiError, context);
    }
  }, [setError, setGlobalError, createNetworkError]);

  const contextValue: ErrorContextType = {
    state,
    setError,
    clearError,
    setGlobalError,
    clearGlobalError,
    clearAllErrors,
    getError,
    hasError,
    hasAnyError,
    getRetryCount,
    incrementRetry,
    resetRetry,
    canRetry,
    showError,
    handleApiError,
    createNetworkError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook for handling specific operation errors
export const useOperationError = (operationKey: string) => {
  const errorContext = useError();

  const setOperationError = useCallback((error: any, context?: string) => {
    errorContext.handleApiError(operationKey, error, context);
  }, [errorContext, operationKey]);

  const clearOperationError = useCallback(() => {
    errorContext.clearError(operationKey);
  }, [errorContext, operationKey]);

  const retryOperation = useCallback(() => {
    errorContext.incrementRetry(operationKey);
  }, [errorContext, operationKey]);

  return {
    error: errorContext.getError(operationKey),
    hasError: errorContext.hasError(operationKey),
    setError: setOperationError,
    clearError: clearOperationError,
    retryCount: errorContext.getRetryCount(operationKey),
    canRetry: errorContext.canRetry(operationKey),
    retry: retryOperation,
    errorMessage: errorContext.getError(operationKey) 
      ? getErrorMessage(errorContext.getError(operationKey)!) 
      : undefined,
  };
};

export default ErrorContext;
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// Loading state interface
export interface LoadingState {
  operations: Record<string, boolean>;
  globalLoading: boolean;
  loadingMessages: Record<string, string>;
}

// Loading actions
type LoadingAction =
  | { type: 'START_LOADING'; payload: { key: string; message?: string } }
  | { type: 'STOP_LOADING'; payload: { key: string } }
  | { type: 'SET_GLOBAL_LOADING'; payload: { loading: boolean; message?: string } }
  | { type: 'CLEAR_ALL_LOADING' }
  | { type: 'UPDATE_MESSAGE'; payload: { key: string; message: string } };

// Loading context interface
interface LoadingContextType {
  state: LoadingState;
  startLoading: (key: string, message?: string) => void;
  stopLoading: (key: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  clearAllLoading: () => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  getLoadingMessage: (key: string) => string | undefined;
  updateLoadingMessage: (key: string, message: string) => void;
  withLoading: <T>(key: string, operation: () => Promise<T>, message?: string) => Promise<T>;
}

// Initial state
const initialState: LoadingState = {
  operations: {},
  globalLoading: false,
  loadingMessages: {},
};

// Loading reducer
const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        operations: {
          ...state.operations,
          [action.payload.key]: true,
        },
        loadingMessages: action.payload.message
          ? {
              ...state.loadingMessages,
              [action.payload.key]: action.payload.message,
            }
          : state.loadingMessages,
      };

    case 'STOP_LOADING':
      const { [action.payload.key]: removedOperation, ...remainingOperations } = state.operations;
      const { [action.payload.key]: removedMessage, ...remainingMessages } = state.loadingMessages;
      return {
        ...state,
        operations: remainingOperations,
        loadingMessages: remainingMessages,
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload.loading,
        loadingMessages: action.payload.message
          ? {
              ...state.loadingMessages,
              global: action.payload.message,
            }
          : state.loadingMessages,
      };

    case 'CLEAR_ALL_LOADING':
      return {
        ...state,
        operations: {},
        globalLoading: false,
        loadingMessages: {},
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        loadingMessages: {
          ...state.loadingMessages,
          [action.payload.key]: action.payload.message,
        },
      };

    default:
      return state;
  }
};

// Create context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Loading provider component
interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  // Start loading for a specific operation
  const startLoading = useCallback((key: string, message?: string) => {
    dispatch({ type: 'START_LOADING', payload: { key, message } });
  }, []);

  // Stop loading for a specific operation
  const stopLoading = useCallback((key: string) => {
    dispatch({ type: 'STOP_LOADING', payload: { key } });
  }, []);

  // Set global loading state
  const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: { loading, message } });
  }, []);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  }, []);

  // Check if specific operation is loading
  const isLoading = useCallback((key: string): boolean => {
    return state.operations[key] || false;
  }, [state.operations]);

  // Check if any operation is loading
  const isAnyLoading = useCallback((): boolean => {
    return state.globalLoading || Object.values(state.operations).some(loading => loading);
  }, [state.globalLoading, state.operations]);

  // Get loading message for specific operation
  const getLoadingMessage = useCallback((key: string): string | undefined => {
    return state.loadingMessages[key];
  }, [state.loadingMessages]);

  // Update loading message
  const updateLoadingMessage = useCallback((key: string, message: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { key, message } });
  }, []);

  // Wrapper function to handle loading state for async operations
  const withLoading = useCallback(async <T,>(
    key: string,
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(key, message);
      const result = await operation();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const contextValue: LoadingContextType = {
    state,
    startLoading,
    stopLoading,
    setGlobalLoading,
    clearAllLoading,
    isLoading,
    isAnyLoading,
    getLoadingMessage,
    updateLoadingMessage,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook to use loading context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for handling specific operation loading
export const useOperationLoading = (operationKey: string) => {
  const loadingContext = useLoading();

  const startOperationLoading = useCallback((message?: string) => {
    loadingContext.startLoading(operationKey, message);
  }, [loadingContext, operationKey]);

  const stopOperationLoading = useCallback(() => {
    loadingContext.stopLoading(operationKey);
  }, [loadingContext, operationKey]);

  const updateOperationMessage = useCallback((message: string) => {
    loadingContext.updateLoadingMessage(operationKey, message);
  }, [loadingContext, operationKey]);

  const withOperationLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    return loadingContext.withLoading(operationKey, operation, message);
  }, [loadingContext, operationKey]);

  return {
    isLoading: loadingContext.isLoading(operationKey),
    loadingMessage: loadingContext.getLoadingMessage(operationKey),
    startLoading: startOperationLoading,
    stopLoading: stopOperationLoading,
    updateMessage: updateOperationMessage,
    withLoading: withOperationLoading,
  };
};

// Hook for managing multiple related operations
export const useMultipleOperationsLoading = (operationKeys: string[]) => {
  const loadingContext = useLoading();

  const isAnyOperationLoading = useCallback((): boolean => {
    return operationKeys.some(key => loadingContext.isLoading(key));
  }, [loadingContext, operationKeys]);

  const areAllOperationsLoading = useCallback((): boolean => {
    return operationKeys.every(key => loadingContext.isLoading(key));
  }, [loadingContext, operationKeys]);

  const startAllOperations = useCallback((messages?: Record<string, string>) => {
    operationKeys.forEach(key => {
      const message = messages?.[key];
      loadingContext.startLoading(key, message);
    });
  }, [loadingContext, operationKeys]);

  const stopAllOperations = useCallback(() => {
    operationKeys.forEach(key => {
      loadingContext.stopLoading(key);
    });
  }, [loadingContext, operationKeys]);

  const getOperationStates = useCallback(() => {
    return operationKeys.reduce((acc, key) => {
      acc[key] = {
        isLoading: loadingContext.isLoading(key),
        message: loadingContext.getLoadingMessage(key),
      };
      return acc;
    }, {} as Record<string, { isLoading: boolean; message?: string }>);
  }, [loadingContext, operationKeys]);

  return {
    isAnyLoading: isAnyOperationLoading,
    areAllLoading: areAllOperationsLoading,
    startAll: startAllOperations,
    stopAll: stopAllOperations,
    operationStates: getOperationStates(),
  };
};

export default LoadingContext;
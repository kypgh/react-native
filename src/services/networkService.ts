import React from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { ApiError, ApiErrorType } from '../types/api';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetInfoStateType;
  isWifiEnabled?: boolean;
  strength?: number;
}

export interface NetworkServiceConfig {
  checkInterval?: number;
  timeoutDuration?: number;
  retryAttempts?: number;
}

/**
 * Network connectivity service for monitoring and handling network state
 */
export class NetworkService {
  private static instance: NetworkService;
  private currentState: NetworkState | null = null;
  private listeners: ((state: NetworkState) => void)[] = [];
  private unsubscribe: (() => void) | null = null;
  private config: NetworkServiceConfig;

  private constructor(config: NetworkServiceConfig = {}) {
    this.config = {
      checkInterval: 5000, // 5 seconds
      timeoutDuration: 10000, // 10 seconds
      retryAttempts: 3,
      ...config,
    };
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: NetworkServiceConfig): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService(config);
    }
    return NetworkService.instance;
  }

  /**
   * Initialize network monitoring
   */
  private initialize(): void {
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifiEnabled: state.isWifiEnabled,
      };

      // Add connection strength for cellular connections
      if (state.type === 'cellular' && state.details) {
        networkState.strength = (state.details as any).strength;
      }

      this.currentState = networkState;
      this.notifyListeners(networkState);
    });
  }

  /**
   * Get current network state
   */
  public getCurrentState(): NetworkState | null {
    return this.currentState;
  }

  /**
   * Check if device is connected to internet
   */
  public isConnected(): boolean {
    return this.currentState?.isConnected ?? false;
  }

  /**
   * Check if internet is reachable
   */
  public isInternetReachable(): boolean {
    return this.currentState?.isInternetReachable ?? false;
  }

  /**
   * Get connection type
   */
  public getConnectionType(): NetInfoStateType {
    return this.currentState?.type ?? NetInfoStateType.unknown;
  }

  /**
   * Check if connection is strong enough for API calls
   */
  public isConnectionStrong(): boolean {
    if (!this.isConnected()) return false;

    const state = this.currentState;
    if (!state) return false;

    // For WiFi, assume strong connection
    if (state.type === NetInfoStateType.wifi) {
      return true;
    }

    // For cellular, check signal strength if available
    if (state.type === NetInfoStateType.cellular) {
      if (state.strength !== undefined) {
        return state.strength > 2; // Assuming scale of 0-4
      }
      return true; // Assume good if no strength info
    }

    // For other types, assume good if connected
    return true;
  }

  /**
   * Add network state listener
   */
  public addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state if available
    if (this.currentState) {
      listener(this.currentState);
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.listeners = [];
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(state: NetworkState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in network state listener:', error);
      }
    });
  }

  /**
   * Refresh network state manually
   */
  public async refreshState(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifiEnabled: state.isWifiEnabled,
      };

      if (state.type === 'cellular' && state.details) {
        networkState.strength = (state.details as any).strength;
      }

      this.currentState = networkState;
      this.notifyListeners(networkState);
      return networkState;
    } catch (error) {
      console.error('Error refreshing network state:', error);
      throw error;
    }
  }

  /**
   * Wait for network connection
   */
  public async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((state) => {
        if (state.isConnected) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Create network error
   */
  public createNetworkError(message?: string): ApiError {
    const state = this.getCurrentState();
    
    if (!state?.isConnected) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: message || 'No internet connection. Please check your network settings.',
        code: 'NO_CONNECTION',
        details: { networkState: state },
      };
    }

    if (!state.isInternetReachable) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: message || 'Internet is not reachable. Please check your connection.',
        code: 'NO_INTERNET',
        details: { networkState: state },
      };
    }

    return {
      type: ApiErrorType.NETWORK_ERROR,
      message: message || 'Network error occurred.',
      code: 'NETWORK_ERROR',
      details: { networkState: state },
    };
  }

  /**
   * Check if error is network-related
   */
  public static isNetworkError(error: any): boolean {
    if (!error) return false;

    // Check for common network error indicators
    const networkErrorCodes = [
      'NETWORK_REQUEST_FAILED',
      'NETWORK_ERROR',
      'NO_CONNECTION',
      'NO_INTERNET',
      'TIMEOUT',
      'CONNECTION_TIMEOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
    ];

    const networkErrorMessages = [
      'network request failed',
      'network error',
      'no internet connection',
      'connection timeout',
      'request timeout',
      'unable to connect',
    ];

    // Check error code
    if (error.code && networkErrorCodes.some(code => 
      error.code.toUpperCase().includes(code))) {
      return true;
    }

    // Check error message
    if (error.message && networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg))) {
      return true;
    }

    // Check error type
    if (error.type === ApiErrorType.NETWORK_ERROR || 
        error.type === ApiErrorType.TIMEOUT_ERROR) {
      return true;
    }

    return false;
  }

  /**
   * Get network quality description
   */
  public getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    const state = this.getCurrentState();
    
    if (!state?.isConnected) return 'offline';
    if (!state.isInternetReachable) return 'poor';

    switch (state.type) {
      case NetInfoStateType.wifi:
        return 'excellent';
      
      case NetInfoStateType.cellular:
        if (state.strength !== undefined) {
          if (state.strength >= 4) return 'excellent';
          if (state.strength >= 3) return 'good';
          if (state.strength >= 2) return 'fair';
          return 'poor';
        }
        return 'good'; // Assume good if no strength info
      
      case NetInfoStateType.ethernet:
        return 'excellent';
      
      default:
        return 'fair';
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.removeAllListeners();
    this.currentState = null;
  }
}

// Export singleton instance
export const networkService = NetworkService.getInstance();

// Export hook for React components
export const useNetworkState = () => {
  const [networkState, setNetworkState] = React.useState<NetworkState | null>(
    networkService.getCurrentState()
  );

  React.useEffect(() => {
    const unsubscribe = networkService.addListener(setNetworkState);
    return unsubscribe;
  }, []);

  return {
    networkState,
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? false,
    connectionType: networkState?.type ?? NetInfoStateType.unknown,
    isConnectionStrong: networkService.isConnectionStrong(),
    networkQuality: networkService.getNetworkQuality(),
    refreshState: networkService.refreshState.bind(networkService),
    waitForConnection: networkService.waitForConnection.bind(networkService),
  };
};

export default NetworkService;
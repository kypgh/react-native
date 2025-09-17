import React, { Component, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { theme, spacing } from "../theme";
import { networkService, NetworkService } from "../services/networkService";
import { ApiError, ApiErrorType } from "../types/api";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  isNetworkError: boolean;
  networkState: any;
}

export class ErrorBoundary extends Component<Props, State> {
  private networkUnsubscribe?: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isNetworkError: false,
      networkState: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isNetworkError = NetworkService.isNetworkError(error);
    const networkState = networkService.getCurrentState();

    return {
      hasError: true,
      error,
      isNetworkError,
      networkState,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    this.logError(error, errorInfo);

    // Set up network monitoring if it's a network error
    if (this.state.isNetworkError) {
      this.setupNetworkMonitoring();
    }
  }

  componentWillUnmount() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (__DEV__) {
      console.group("🚨 Error Boundary - Unhandled Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.error("Network State:", this.state.networkState);
      console.groupEnd();
    }
  };

  private setupNetworkMonitoring = () => {
    this.networkUnsubscribe = networkService.addListener((networkState) => {
      // Auto-retry when network comes back online
      if (
        networkState.isConnected &&
        this.state.hasError &&
        this.state.isNetworkError
      ) {
        setTimeout(() => {
          this.handleRetry();
        }, 1000); // Wait 1 second after connection is restored
      }
    });
  };

  private getErrorMessage = (): string => {
    const { error, isNetworkError, networkState } = this.state;

    if (isNetworkError) {
      if (!networkState?.isConnected) {
        return "No internet connection. Please check your network settings and try again.";
      }
      if (!networkState?.isInternetReachable) {
        return "Internet is not reachable. Please check your connection and try again.";
      }
      return "Network error occurred. Please check your connection and try again.";
    }

    // Check if it's an API error
    if (error && "type" in error) {
      const apiError = error as ApiError;
      switch (apiError.type) {
        case ApiErrorType.AUTHENTICATION_ERROR:
          return "Authentication failed. Please log in again.";
        case ApiErrorType.VALIDATION_ERROR:
          return "Invalid data provided. Please check your input and try again.";
        case ApiErrorType.SERVER_ERROR:
          return "Server error occurred. Please try again later.";
        case ApiErrorType.TIMEOUT_ERROR:
          return "Request timed out. Please check your connection and try again.";
        default:
          return apiError.message || "An unexpected error occurred.";
      }
    }

    return "An unexpected error occurred. Please try again.";
  };

  private getErrorTitle = (): string => {
    const { isNetworkError } = this.state;

    if (isNetworkError) {
      return "Connection Problem";
    }

    return "Oops! Something went wrong";
  };

  private canRetry = (): boolean => {
    const { enableRetry = true, maxRetries = 3 } = this.props;
    return enableRetry && this.state.retryCount < maxRetries;
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      isNetworkError: false,
      networkState: null,
    }));

    // Clean up network monitoring
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      isNetworkError: false,
      networkState: null,
    });

    // Clean up network monitoring
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }
  };

  private renderNetworkStatus = () => {
    const { networkState } = this.state;

    if (!networkState) return null;

    const getStatusColor = () => {
      if (!networkState.isConnected) return theme.colors.error;
      if (!networkState.isInternetReachable) return theme.colors.warning;
      return theme.colors.success;
    };

    const getStatusText = () => {
      if (!networkState.isConnected) return "Offline";
      if (!networkState.isInternetReachable) return "No Internet";
      return "Connected";
    };

    return (
      <View style={styles.networkStatus}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      return (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.errorContainer}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>

            {/* Error Title */}
            <Text style={styles.title}>{this.getErrorTitle()}</Text>

            {/* Error Message */}
            <Text style={styles.message}>{this.getErrorMessage()}</Text>

            {/* Network Status */}
            {this.state.isNetworkError && this.renderNetworkStatus()}

            {/* Retry Information */}
            {this.state.retryCount > 0 && (
              <Text style={styles.retryInfo}>
                Retry attempt: {this.state.retryCount} of{" "}
                {this.props.maxRetries || 3}
              </Text>
            )}

            {/* Development Error Details */}
            {__DEV__ && this.state.error && (
              <View style={styles.devSection}>
                <Text style={styles.devTitle}>Development Info:</Text>
                <ScrollView style={styles.errorDetailsContainer}>
                  <Text style={styles.errorDetails}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text style={styles.errorDetails}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {this.canRetry() && (
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={this.handleRetry}
                >
                  <Text style={styles.buttonText}>
                    {this.state.isNetworkError
                      ? "Retry Connection"
                      : "Try Again"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={this.handleReset}
              >
                <Text style={styles.buttonText}>Reset App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorContainer: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  networkStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  retryInfo: {
    fontSize: 14,
    color: theme.colors.grey3,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  devSection: {
    width: "100%",
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.greyOutline,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  errorDetailsContainer: {
    maxHeight: 200,
  },
  errorDetails: {
    fontSize: 12,
    color: theme.colors.grey3,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.md,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
  },
  resetButton: {
    backgroundColor: theme.colors.grey2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

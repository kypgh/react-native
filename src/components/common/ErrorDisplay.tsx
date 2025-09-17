import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { Button } from 'react-native-elements'; // Removed to avoid style conflicts
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { ApiError, ApiErrorType } from '../../types/api';
import { getErrorMessage, isRetryableError } from '../../services/errorHandler';
import { useNetworkState } from '../../services/networkService';

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  style?: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isConnected, networkQuality } = useNetworkState();

  const getErrorIcon = () => {
    switch (error.type) {
      case ApiErrorType.NETWORK_ERROR:
        return '🌐';
      case ApiErrorType.AUTHENTICATION_ERROR:
        return '🔐';
      case ApiErrorType.VALIDATION_ERROR:
        return '⚠️';
      case ApiErrorType.SERVER_ERROR:
        return '🔧';
      case ApiErrorType.TIMEOUT_ERROR:
        return '⏱️';
      default:
        return '❌';
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case ApiErrorType.NETWORK_ERROR:
        return colors.status.pending;
      case ApiErrorType.AUTHENTICATION_ERROR:
        return colors.status.error;
      case ApiErrorType.VALIDATION_ERROR:
        return colors.status.pending;
      case ApiErrorType.SERVER_ERROR:
        return colors.status.error;
      case ApiErrorType.TIMEOUT_ERROR:
        return colors.status.pending;
      default:
        return colors.status.error;
    }
  };

  const canRetry = isRetryableError(error);
  const errorMessage = getErrorMessage(error);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }, style]}>
        <View style={styles.compactContent}>
          <Text style={styles.compactIcon}>{getErrorIcon()}</Text>
          <Text style={[styles.compactMessage, { color: colors.text.primary }]} numberOfLines={2}>
            {errorMessage}
          </Text>
          {canRetry && onRetry && (
            <TouchableOpacity
              style={[styles.compactRetryButton, { borderColor: getErrorColor() }]}
              onPress={onRetry}
            >
              <Text style={[styles.compactRetryText, { color: getErrorColor() }]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={[styles.dismissText, { color: colors.text.secondary }]}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Error Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>{getErrorIcon()}</Text>
          <Text style={[styles.title, { color: getErrorColor() }]}>
            {getErrorTitle(error)}
          </Text>
        </View>

        {/* Error Message */}
        <Text style={[styles.message, { color: colors.text.primary }]}>
          {errorMessage}
        </Text>

        {/* Network Status for Network Errors */}
        {error.type === ApiErrorType.NETWORK_ERROR && (
          <View style={[styles.networkInfo, { backgroundColor: colors.background }]}>
            <Text style={[styles.networkTitle, { color: colors.text.primary }]}>
              Connection Status
            </Text>
            <Text style={[styles.networkDetail, { color: colors.text.secondary }]}>
              Connected: {isConnected ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.networkDetail, { color: colors.text.secondary }]}>
              Quality: {networkQuality}
            </Text>
          </View>
        )}

        {/* Error Details (Development) */}
        {showDetails && __DEV__ && (
          <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.detailsTitle, { color: colors.text.primary }]}>
              Error Details (Development)
            </Text>
            <Text style={[styles.detailsText, { color: colors.text.secondary }]}>
              Type: {error.type}
            </Text>
            {error.code && (
              <Text style={[styles.detailsText, { color: colors.text.secondary }]}>
                Code: {error.code}
              </Text>
            )}
            {error.statusCode && (
              <Text style={[styles.detailsText, { color: colors.text.secondary }]}>
                Status: {error.statusCode}
              </Text>
            )}
            {error.details && (
              <Text style={[styles.detailsText, { color: colors.text.secondary }]}>
                Details: {JSON.stringify(error.details, null, 2)}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Special handling for rate limit errors */}
          {error.code === 'RATE_LIMIT' && onRetry && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.status.pending }]}
              onPress={() => {
                // Add a delay for rate limit retries
                setTimeout(onRetry, 5000);
              }}
            >
              <Text style={styles.buttonText}>Wait & Retry (5s)</Text>
            </TouchableOpacity>
          )}
          {/* Normal retry for other retryable errors */}
          {canRetry && error.code !== 'RATE_LIMIT' && onRetry && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: getErrorColor() }]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity
              style={[styles.dismissActionButton, { backgroundColor: colors.text.muted }]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Inline error message component
export const InlineError: React.FC<{
  error?: ApiError | string;
  style?: any;
}> = ({ error, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : getErrorMessage(error);

  return (
    <View style={[styles.inlineContainer, style]}>
      <Text style={styles.inlineIcon}>⚠️</Text>
      <Text style={[styles.inlineMessage, { color: colors.status.error }]}>
        {errorMessage}
      </Text>
    </View>
  );
};

// Error banner component (for top of screen)
export const ErrorBanner: React.FC<{
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getErrorIcon = (error: ApiError) => {
    switch (error.type) {
      case ApiErrorType.NETWORK_ERROR:
        return '🌐';
      case ApiErrorType.AUTHENTICATION_ERROR:
        return '🔐';
      case ApiErrorType.VALIDATION_ERROR:
        return '⚠️';
      case ApiErrorType.SERVER_ERROR:
        return '🔧';
      case ApiErrorType.TIMEOUT_ERROR:
        return '⏱️';
      default:
        return '❌';
    }
  };

  const errorMessage = getErrorMessage(error);
  const canRetry = isRetryableError(error);

  return (
    <View style={[styles.bannerContainer, { backgroundColor: colors.status.error }]}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerIcon}>{getErrorIcon(error)}</Text>
        <Text style={[styles.bannerMessage, { color: '#FFFFFF' }]} numberOfLines={2}>
          {errorMessage}
        </Text>
        <View style={styles.bannerActions}>
          {canRetry && onRetry && (
            <TouchableOpacity
              style={[styles.bannerButton, { borderColor: '#FFFFFF' }]}
              onPress={onRetry}
            >
              <Text style={[styles.bannerButtonText, { color: '#FFFFFF' }]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity style={styles.bannerDismiss} onPress={onDismiss}>
              <Text style={[styles.bannerDismissText, { color: '#FFFFFF' }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Helper function to get error title
const getErrorTitle = (error: ApiError): string => {
  switch (error.type) {
    case ApiErrorType.NETWORK_ERROR:
      return 'Connection Problem';
    case ApiErrorType.AUTHENTICATION_ERROR:
      return 'Authentication Required';
    case ApiErrorType.VALIDATION_ERROR:
      return 'Invalid Input';
    case ApiErrorType.SERVER_ERROR:
      return 'Server Error';
    case ApiErrorType.TIMEOUT_ERROR:
      return 'Request Timeout';
    default:
      return 'Error';
  }
};

const styles = StyleSheet.create({
  // Full Error Display
  container: {
    borderRadius: 8,
    padding: spacing.lg,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  networkInfo: {
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.lg,
  },
  networkTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  networkDetail: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  detailsContainer: {
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.lg,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
  retryButton: {
    borderRadius: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissActionButton: {
    borderRadius: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Compact Error Display
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  compactRetryButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  compactRetryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: spacing.xs,
  },
  dismissText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Inline Error
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  inlineIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  inlineMessage: {
    fontSize: 14,
    flex: 1,
  },

  // Error Banner
  bannerContainer: {
    paddingTop: 44, // Account for status bar
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  bannerMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bannerDismiss: {
    padding: spacing.xs,
  },
  bannerDismissText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
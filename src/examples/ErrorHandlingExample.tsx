import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { ApiErrorType } from '../types/api';
import {
  ErrorDisplay,
  InlineError,
  ErrorBanner,
  NetworkStatus,
  NetworkStatusIndicator,
  LoadingOverlay,
  HomeScreenSkeleton,
  ProfileScreenSkeleton,
  PaymentPlansScreenSkeleton,
  BookingsScreenSkeleton,
  GenericLoadingSkeleton,
} from '../components/common';

/**
 * Example component demonstrating comprehensive error handling system
 */
export const ErrorHandlingExample: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [currentDemo, setCurrentDemo] = useState<string>('none');
  const [showBanner, setShowBanner] = useState(false);

  // Error handling for different operations
  const networkErrorHandler = useErrorHandling('network-test');
  const authErrorHandler = useErrorHandling('auth-test');
  const validationErrorHandler = useErrorHandling('validation-test');
  const serverErrorHandler = useErrorHandling('server-test');

  // Simulate different types of errors
  const simulateNetworkError = async () => {
    await networkErrorHandler.executeWithHandling(
      async () => {
        throw {
          type: ApiErrorType.NETWORK_ERROR,
          message: 'Network request failed',
          code: 'NETWORK_ERROR',
        };
      },
      {
        loadingMessage: 'Testing network connection...',
        onError: () => setShowBanner(true),
      }
    );
  };

  const simulateAuthError = async () => {
    await authErrorHandler.executeWithHandling(
      async () => {
        throw {
          type: ApiErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        };
      },
      {
        loadingMessage: 'Authenticating...',
      }
    );
  };

  const simulateValidationError = async () => {
    await validationErrorHandler.executeWithHandling(
      async () => {
        throw {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'Email is required',
          code: 'VALIDATION_ERROR',
          details: { field: 'email', value: '' },
        };
      },
      {
        loadingMessage: 'Validating input...',
      }
    );
  };

  const simulateServerError = async () => {
    await serverErrorHandler.executeWithHandling(
      async () => {
        throw {
          type: ApiErrorType.SERVER_ERROR,
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          statusCode: 500,
        };
      },
      {
        loadingMessage: 'Processing request...',
      }
    );
  };

  const simulateSuccess = async () => {
    await networkErrorHandler.executeWithHandling(
      async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, data: 'Operation completed successfully!' };
      },
      {
        loadingMessage: 'Processing...',
        onSuccess: (result) => {
          console.log('Success:', result);
        },
      }
    );
  };

  const renderSkeletonDemo = () => {
    switch (currentDemo) {
      case 'home-skeleton':
        return <HomeScreenSkeleton />;
      case 'profile-skeleton':
        return <ProfileScreenSkeleton />;
      case 'payment-skeleton':
        return <PaymentPlansScreenSkeleton />;
      case 'bookings-skeleton':
        return <BookingsScreenSkeleton />;
      case 'generic-skeleton':
        return <GenericLoadingSkeleton itemCount={5} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Network Status */}
      <NetworkStatus
        showWhenConnected={true}
        onRetry={() => console.log('Network retry requested')}
      />

      {/* Error Banner */}
      {showBanner && networkErrorHandler.error && (
        <ErrorBanner
          error={networkErrorHandler.error}
          onRetry={() => {
            networkErrorHandler.clearError();
            setShowBanner(false);
          }}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text h3 style={{ color: colors.text }}>
            Error Handling System Demo
          </Text>
          <View style={styles.networkIndicator}>
            <NetworkStatusIndicator size="medium" showText={true} />
          </View>
        </View>

        {/* Error Simulation Buttons */}
        <View style={styles.section}>
          <Text h4 style={{ color: colors.text, marginBottom: spacing.md }}>
            Error Simulation
          </Text>
          
          <View style={styles.buttonGrid}>
            <Button
              title="Network Error"
              onPress={simulateNetworkError}
              buttonStyle={[styles.button, { backgroundColor: colors.warning }]}
              loading={networkErrorHandler.isLoading}
            />
            
            <Button
              title="Auth Error"
              onPress={simulateAuthError}
              buttonStyle={[styles.button, { backgroundColor: colors.error }]}
              loading={authErrorHandler.isLoading}
            />
            
            <Button
              title="Validation Error"
              onPress={simulateValidationError}
              buttonStyle={[styles.button, { backgroundColor: colors.warning }]}
              loading={validationErrorHandler.isLoading}
            />
            
            <Button
              title="Server Error"
              onPress={simulateServerError}
              buttonStyle={[styles.button, { backgroundColor: colors.error }]}
              loading={serverErrorHandler.isLoading}
            />
            
            <Button
              title="Success"
              onPress={simulateSuccess}
              buttonStyle={[styles.button, { backgroundColor: colors.success }]}
              loading={networkErrorHandler.isLoading}
            />
          </View>
        </View>

        {/* Error Displays */}
        <View style={styles.section}>
          <Text h4 style={{ color: colors.text, marginBottom: spacing.md }}>
            Error Displays
          </Text>

          {/* Network Error */}
          {networkErrorHandler.error && (
            <ErrorDisplay
              error={networkErrorHandler.error}
              onRetry={() => networkErrorHandler.clearError()}
              onDismiss={() => networkErrorHandler.clearError()}
              showDetails={true}
            />
          )}

          {/* Auth Error */}
          {authErrorHandler.error && (
            <ErrorDisplay
              error={authErrorHandler.error}
              onRetry={() => authErrorHandler.clearError()}
              onDismiss={() => authErrorHandler.clearError()}
              compact={true}
            />
          )}

          {/* Validation Error */}
          {validationErrorHandler.error && (
            <InlineError error={validationErrorHandler.error} />
          )}

          {/* Server Error */}
          {serverErrorHandler.error && (
            <ErrorDisplay
              error={serverErrorHandler.error}
              onRetry={() => serverErrorHandler.clearError()}
              onDismiss={() => serverErrorHandler.clearError()}
            />
          )}
        </View>

        {/* Skeleton Loading Demos */}
        <View style={styles.section}>
          <Text h4 style={{ color: colors.text, marginBottom: spacing.md }}>
            Skeleton Loading States
          </Text>
          
          <View style={styles.buttonGrid}>
            <Button
              title="Home Skeleton"
              onPress={() => setCurrentDemo('home-skeleton')}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
            
            <Button
              title="Profile Skeleton"
              onPress={() => setCurrentDemo('profile-skeleton')}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
            
            <Button
              title="Payment Skeleton"
              onPress={() => setCurrentDemo('payment-skeleton')}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
            
            <Button
              title="Bookings Skeleton"
              onPress={() => setCurrentDemo('bookings-skeleton')}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
            
            <Button
              title="Generic Skeleton"
              onPress={() => setCurrentDemo('generic-skeleton')}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
            
            <Button
              title="Clear Demo"
              onPress={() => setCurrentDemo('none')}
              buttonStyle={[styles.button, { backgroundColor: colors.grey2 }]}
            />
          </View>
        </View>

        {/* Skeleton Demo Display */}
        {currentDemo !== 'none' && (
          <View style={styles.section}>
            <Text h4 style={{ color: colors.text, marginBottom: spacing.md }}>
              {currentDemo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Demo
            </Text>
            {renderSkeletonDemo()}
          </View>
        )}

        {/* Loading States */}
        <View style={styles.section}>
          <Text h4 style={{ color: colors.text, marginBottom: spacing.md }}>
            Current Loading States
          </Text>
          
          {[networkErrorHandler, authErrorHandler, validationErrorHandler, serverErrorHandler].map((handler, index) => {
            const operationNames = ['Network', 'Auth', 'Validation', 'Server'];
            return (
              <View key={index} style={styles.statusRow}>
                <Text style={{ color: colors.text }}>
                  {operationNames[index]}: {handler.isLoading ? 'Loading...' : 'Idle'}
                </Text>
                {handler.loadingMessage && (
                  <Text style={{ color: colors.grey2, fontSize: 12 }}>
                    {handler.loadingMessage}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Clear All Button */}
        <View style={styles.section}>
          <Button
            title="Clear All Errors"
            onPress={() => {
              networkErrorHandler.clearError();
              authErrorHandler.clearError();
              validationErrorHandler.clearError();
              serverErrorHandler.clearError();
              setShowBanner(false);
              setCurrentDemo('none');
            }}
            buttonStyle={[styles.button, { backgroundColor: colors.grey2 }]}
          />
        </View>
      </ScrollView>

      {/* Global Loading Overlay */}
      <LoadingOverlay
        visible={networkErrorHandler.isLoading && currentDemo === 'none'}
        message={networkErrorHandler.loadingMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Account for network status
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  networkIndicator: {
    marginTop: spacing.md,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 120,
    marginBottom: spacing.sm,
  },
  statusRow: {
    marginBottom: spacing.sm,
  },
});
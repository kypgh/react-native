import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { useNetworkState } from '../../services/networkService';

interface NetworkStatusProps {
  showWhenConnected?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onRetry?: () => void;
  style?: any;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showWhenConnected = false,
  autoHide = true,
  autoHideDelay = 3000,
  onRetry,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const {
    isConnected,
    isInternetReachable,
    connectionType,
    networkQuality,
    refreshState,
  } = useNetworkState();

  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  // Determine status
  const getStatus = () => {
    if (!isConnected) return 'offline';
    if (!isInternetReachable) return 'no-internet';
    return 'connected';
  };

  const status = getStatus();

  // Show/hide logic
  useEffect(() => {
    const shouldShow = status !== 'connected' || showWhenConnected;
    
    if (shouldShow && !isVisible) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && isVisible) {
      hideStatus();
    }
  }, [status, showWhenConnected, isVisible]);

  // Auto-hide when connected
  useEffect(() => {
    if (status === 'connected' && autoHide && isVisible) {
      const timer = setTimeout(() => {
        hideStatus();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [status, autoHide, autoHideDelay, isVisible]);

  const hideStatus = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          backgroundColor: colors.error,
          textColor: colors.white,
          icon: '📵',
          message: 'No internet connection',
          showRetry: true,
        };
      case 'no-internet':
        return {
          backgroundColor: colors.warning,
          textColor: colors.white,
          icon: '⚠️',
          message: 'Internet not reachable',
          showRetry: true,
        };
      case 'connected':
        return {
          backgroundColor: colors.success,
          textColor: colors.white,
          icon: '✅',
          message: `Connected via ${connectionType} (${networkQuality})`,
          showRetry: false,
        };
      default:
        return {
          backgroundColor: colors.grey3,
          textColor: colors.white,
          icon: '❓',
          message: 'Unknown connection status',
          showRetry: true,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleRetry = async () => {
    try {
      await refreshState();
      if (onRetry) {
        onRetry();
      }
    } catch (error) {
      console.error('Failed to refresh network state:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: statusConfig.backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{statusConfig.icon}</Text>
        <Text style={[styles.message, { color: statusConfig.textColor }]}>
          {statusConfig.message}
        </Text>
        {statusConfig.showRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: statusConfig.textColor }]}
            onPress={handleRetry}
          >
            <Text style={[styles.retryText, { color: statusConfig.textColor }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Inline network status indicator (for use in headers, etc.)
export const NetworkStatusIndicator: React.FC<{
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}> = ({ size = 'medium', showText = false }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isConnected, isInternetReachable, networkQuality } = useNetworkState();

  const getIndicatorSize = () => {
    switch (size) {
      case 'small': return 8;
      case 'medium': return 12;
      case 'large': return 16;
      default: return 12;
    }
  };

  const getIndicatorColor = () => {
    if (!isConnected) return colors.error;
    if (!isInternetReachable) return colors.warning;
    
    switch (networkQuality) {
      case 'excellent': return colors.success;
      case 'good': return colors.success;
      case 'fair': return colors.warning;
      case 'poor': return colors.error;
      default: return colors.grey3;
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Offline';
    if (!isInternetReachable) return 'No Internet';
    return networkQuality.charAt(0).toUpperCase() + networkQuality.slice(1);
  };

  return (
    <View style={styles.indicatorContainer}>
      <View
        style={[
          styles.indicator,
          {
            width: getIndicatorSize(),
            height: getIndicatorSize(),
            backgroundColor: getIndicatorColor(),
            borderRadius: getIndicatorSize() / 2,
          },
        ]}
      />
      {showText && (
        <Text style={[styles.indicatorText, { color: colors.text }]}>
          {getStatusText()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 44, // Account for status bar
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    // Styles applied dynamically
  },
  indicatorText: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});
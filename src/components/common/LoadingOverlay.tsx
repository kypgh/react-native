import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AnimatedLoading, FadeInView } from './AnimatedComponents';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          backgroundColor: transparent 
            ? 'transparent' 
            : colors.background + '90', // 90% opacity
          opacity: fadeAnim,
        }
      ]}
    >
      <FadeInView delay={100} style={styles.content}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <AnimatedLoading size={40} color={colors.primary} />
          {message && (
            <Text style={[styles.loadingText, { color: colors.text.primary }]}>
              {message}
            </Text>
          )}
        </View>
      </FadeInView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
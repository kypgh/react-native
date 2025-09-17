import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
  backgroundColor?: string;
  opacity?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
  backgroundColor: customBackgroundColor,
  opacity = 1,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, animated]);

  const getBackgroundColor = () => {
    if (customBackgroundColor) {
      if (animated) {
        return animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [customBackgroundColor, customBackgroundColor + '80'], // Add transparency for animation
        });
      }
      return customBackgroundColor;
    }
    
    // Default theme-based colors
    const baseColor = colors.surface;
    const animatedColor = colors.background;
    
    return animated
      ? animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [baseColor, animatedColor],
        })
      : baseColor;
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: getBackgroundColor(),
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  lineHeight = 16,
  lastLineWidth = '70%',
  style,
}) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          style={index > 0 ? { marginTop: spacing.xs } : undefined}
        />
      ))}
    </View>
  );
};

interface SkeletonCircleProps {
  size: number;
  style?: ViewStyle;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size,
  style,
}) => {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
  showImage?: boolean;
  imageHeight?: number;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDescription?: boolean;
  descriptionLines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  style,
  showImage = true,
  imageHeight = 120,
  showTitle = true,
  showSubtitle = true,
  showDescription = true,
  descriptionLines = 2,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.text.muted,
        },
        style,
      ]}
    >
      {showImage && (
        <SkeletonLoader
          height={imageHeight}
          borderRadius={8}
          style={styles.cardImage}
        />
      )}
      
      <View style={styles.cardContent}>
        {showTitle && (
          <SkeletonLoader
            height={20}
            width="80%"
            style={styles.cardTitle}
          />
        )}
        
        {showSubtitle && (
          <SkeletonLoader
            height={16}
            width="60%"
            style={styles.cardSubtitle}
          />
        )}
        
        {showDescription && (
          <SkeletonText
            lines={descriptionLines}
            lineHeight={14}
            style={styles.cardDescription}
          />
        )}
      </View>
    </View>
  );
};

interface SkeletonListProps {
  itemCount?: number;
  itemHeight?: number;
  showSeparator?: boolean;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  itemCount = 5,
  itemHeight = 60,
  showSeparator = true,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index}>
          <View style={[styles.listItem, { height: itemHeight }]}>
            <SkeletonCircle size={40} style={styles.listItemAvatar} />
            <View style={styles.listItemContent}>
              <SkeletonLoader height={16} width="70%" />
              <SkeletonLoader
                height={12}
                width="50%"
                style={{ marginTop: spacing.xs }}
              />
            </View>
          </View>
          {showSeparator && index < itemCount - 1 && (
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.text.muted },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  textContainer: {
    // No specific styles needed
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardImage: {
    marginBottom: spacing.md,
  },
  cardContent: {
    // No specific styles needed
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    marginBottom: spacing.sm,
  },
  cardDescription: {
    marginTop: spacing.xs,
  },
  list: {
    // No specific styles needed
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listItemAvatar: {
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginLeft: spacing.md + 40 + spacing.md, // Avatar width + margins
  },
});
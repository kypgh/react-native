import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { Card } from './Card';

export interface StatsCardProps {
  title: string;
  value: number;
  color: string;
  icon?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  selected?: boolean;
  filterType?: 'pending' | 'upcoming' | 'completed' | 'total';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  color,
  icon,
  style,
  size = 'medium',
  onPress,
  selected = false,
  filterType,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getCardStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        minHeight: 88,
        width: '100%',
      },
      medium: {
        minHeight: 108,
        width: '100%',
      },
      large: {
        minHeight: 128,
        width: '100%',
      },
    };

    return {
      ...sizeStyles[size],
    };
  };

  const getValueStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: color,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: spacing.xs,
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 20,
        lineHeight: 24,
      },
      medium: {
        fontSize: 28,
        lineHeight: 32,
      },
      large: {
        fontSize: 36,
        lineHeight: 40,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.text.secondary,
      textAlign: 'center',
      fontWeight: '500',
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 12,
        lineHeight: 16,
      },
      medium: {
        fontSize: 14,
        lineHeight: 18,
      },
      large: {
        fontSize: 16,
        lineHeight: 20,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getIconStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 16,
        marginBottom: spacing.xs,
      },
      medium: {
        fontSize: 20,
        marginBottom: spacing.sm,
      },
      large: {
        fontSize: 24,
        marginBottom: spacing.sm,
      },
    };

    return {
      color: color,
      textAlign: 'center',
      ...sizeStyles[size],
    };
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getAccessibilityLabel = (): string => {
    const baseLabel = `${title}: ${formatValue(value)}`;
    if (onPress) {
      const selectedText = selected ? 'selected' : 'not selected';
      return `${baseLabel}, filter button, ${selectedText}. Double tap to filter bookings.`;
    }
    return baseLabel;
  };

  return (
    <Card 
      style={StyleSheet.flatten([getCardStyle(), style])}
      padding={size === 'small' ? 'medium' : 'medium'}
      variant={onPress ? 'interactive' : 'default'}
      onPress={onPress}
      selected={selected}
      testID={filterType ? `stats-card-${filterType}` : undefined}
    >
      <View 
        style={styles.container}
        accessible={true}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityState={onPress ? { selected } : undefined}
      >
        {icon && (
          <Text style={getIconStyle()}>
            {icon}
          </Text>
        )}
        <Text style={getValueStyle()}>
          {formatValue(value)}
        </Text>
        <Text style={getTitleStyle()}>
          {title}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
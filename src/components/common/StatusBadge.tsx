import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type StatusType = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface StatusBadgeProps {
  status: StatusType;
  text: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'medium',
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getStatusColor = (status: StatusType): string => {
    const statusColors: Record<StatusType, string> = {
      pending: colors.status.pending,
      confirmed: colors.status.confirmed,
      completed: colors.status.completed,
      cancelled: colors.status.error,
    };

    return statusColors[status];
  };

  const getBadgeStyle = (): ViewStyle => {
    const statusColor = getStatusColor(status);
    
    const baseStyle: ViewStyle = {
      backgroundColor: `${statusColor}20`, // 20% opacity background
      borderWidth: 1,
      borderColor: statusColor,
      borderRadius: size === 'small' ? 12 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 24,
      },
      medium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 32,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const statusColor = getStatusColor(status);
    
    const baseTextStyle: TextStyle = {
      color: statusColor,
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size variations for text
    const sizeTextStyles: Record<string, TextStyle> = {
      small: {
        fontSize: 12,
        lineHeight: 16,
      },
      medium: {
        fontSize: 14,
        lineHeight: 18,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
    };
  };

  return (
    <View 
      style={[getBadgeStyle(), style]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || `Status: ${text}`}
    >
      <Text style={getTextStyle()}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
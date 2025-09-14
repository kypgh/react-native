import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  padding?: 'small' | 'medium' | 'large';
  shadow?: boolean;
  borderRadius?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  shadow = true,
  borderRadius = 12,
  backgroundColor,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: backgroundColor || colors.surface,
      borderRadius,
    };

    // Padding variations
    const paddingStyles: Record<string, ViewStyle> = {
      small: {
        padding: spacing.sm,
      },
      medium: {
        padding: spacing.md,
      },
      large: {
        padding: spacing.lg,
      },
    };

    // Shadow style for elevation
    const shadowStyle: ViewStyle = shadow ? {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4, // Android shadow
    } : {};

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...shadowStyle,
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
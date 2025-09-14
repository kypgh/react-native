import React from "react";
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/spacing";

export interface CardProps {
  children: React.ReactNode;
  padding?: "small" | "medium" | "large";
  elevation?: "low" | "medium" | "high";
  variant?: "default" | "interactive" | "highlighted";
  borderRadius?: number;
  backgroundColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "medium",
  elevation = "low",
  variant = "default",
  borderRadius = 12,
  backgroundColor,
  style,
  onPress,
  selected = false,
  disabled = false,
  testID,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  // Animation handlers for interactive cards
  const handlePressIn = () => {
    if (variant === "interactive" && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (variant === "interactive" && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getElevationStyle = (): ViewStyle => {
    const elevationStyles: Record<string, ViewStyle> = {
      low: {
        shadowColor: colors.text.primary,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: theme.mode === "dark" ? 0.2 : 0.08,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: colors.text.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: theme.mode === "dark" ? 0.4 : 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      high: {
        shadowColor: colors.text.primary,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: theme.mode === "dark" ? 0.5 : 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    };

    // Reduce elevation for selected interactive cards to avoid too much visual weight
    if (variant === "interactive" && selected) {
      return {
        ...elevationStyles[elevation],
        shadowOpacity: (elevationStyles[elevation].shadowOpacity as number) * 0.5,
        elevation: Math.max(1, (elevationStyles[elevation].elevation as number) - 1),
      };
    }

    return elevationStyles[elevation];
  };

  const getVariantStyle = (): ViewStyle => {
    const baseBackground = backgroundColor || colors.surface;

    switch (variant) {
      case "interactive":
        return {
          backgroundColor: baseBackground,
          borderWidth: selected ? 1.5 : 0,
          borderColor: selected ? colors.primary : "transparent",
        };
      case "highlighted":
        return {
          backgroundColor: colors.primary + "10",
          borderWidth: 1,
          borderColor: colors.primary + "30",
        };
      default:
        return {
          backgroundColor: baseBackground,
        };
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
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

    const elevationStyle = getElevationStyle();
    const variantStyle = getVariantStyle();

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...elevationStyle,
      ...variantStyle,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const cardContent = (
    <Animated.View
      style={[
        getCardStyle(),
        style,
        variant === "interactive" && { transform: [{ scale: scaleValue }] },
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={variant === "interactive" ? 1 : 0.7}
        disabled={disabled}
        style={{ borderRadius }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

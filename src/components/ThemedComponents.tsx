import React from 'react';
import { View, Text as RNText, TouchableOpacity, TextInput } from 'react-native';
import { theme, spacing, getButtonStyle, getCardStyle, getTextStyle, getShadowStyle } from '../theme';

// Example themed button component
interface ThemedButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onPress: () => void;
  disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  title, 
  variant = 'primary', 
  onPress, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        getButtonStyle(variant),
        disabled && { backgroundColor: theme.colors.disabled },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <RNText style={{
        ...getTextStyle('body'),
        color: '#FFFFFF',
        fontWeight: '600',
      }}>
        {title}
      </RNText>
    </TouchableOpacity>
  );
};

// Example themed card component
interface ThemedCardProps {
  children: React.ReactNode;
  style?: object;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ children, style }) => {
  return (
    <View style={[
      getCardStyle({
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        padding: spacing.lg,
      }),
      style,
    ]}>
      {children}
    </View>
  );
};

// Example themed text component
interface ThemedTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  style?: object;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  variant = 'body', 
  color, 
  style 
}) => {
  return (
    <RNText style={[
      getTextStyle(variant),
      color && { color },
      style,
    ]}>
      {children}
    </RNText>
  );
};

// Example themed input component
interface ThemedInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  style 
}) => {
  return (
    <TextInput
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.greyOutline,
          borderRadius: 8,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: 16,
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.grey3}
      value={value}
      onChangeText={onChangeText}
    />
  );
};
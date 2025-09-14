import { ReactNode } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { ButtonProps as RNEButtonProps } from 'react-native-elements';

// Base component props
export interface BaseComponentProps {
  style?: ViewStyle;
  testID?: string;
}

// Loading component props
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

// Error component props
export interface ErrorProps extends BaseComponentProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

// Custom button props extending React Native Elements
export interface CustomButtonProps extends Omit<RNEButtonProps, 'title'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

// Card component props
export interface CardProps extends BaseComponentProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  elevation?: 'low' | 'medium' | 'high';
  variant?: 'default' | 'interactive' | 'highlighted';
  padding?: 'small' | 'medium' | 'large';
  borderRadius?: number;
  backgroundColor?: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
}

// List item props
export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  disabled?: boolean;
}

// Input field props
export interface InputFieldProps extends BaseComponentProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

// Header component props
export interface HeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  backgroundColor?: string;
  centerComponent?: ReactNode;
}

// Avatar component props
export interface AvatarProps extends BaseComponentProps {
  source?: { uri: string } | number;
  size?: 'small' | 'medium' | 'large' | number;
  title?: string;
  onPress?: () => void;
  rounded?: boolean;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  value: string | number;
  status?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

// Screen container props
export interface ScreenContainerProps extends BaseComponentProps {
  children: ReactNode;
  padding?: boolean;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  backgroundColor?: string;
}

// Theme-related component props
export interface ThemedComponentProps {
  theme?: {
    colors: Record<string, string>;
    spacing: Record<string, number>;
    typography: Record<string, TextStyle>;
  };
}

// Form component props
export interface FormProps extends BaseComponentProps {
  children: ReactNode;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// Search component props
export interface SearchProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: (text: string) => void;
  showCancel?: boolean;
  onCancel?: () => void;
}

// Tab component props
export interface TabProps extends BaseComponentProps {
  tabs: Array<{
    key: string;
    title: string;
    icon?: string;
  }>;
  activeTab: string;
  onTabChange: (key: string) => void;
}

// Picker component props
export interface PickerProps extends BaseComponentProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: Array<{
    label: string;
    value: string;
  }>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}
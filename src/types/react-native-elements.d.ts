declare module 'react-native-elements' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface ThemeProviderProps {
    theme?: any;
    children?: React.ReactNode;
  }

  export interface CardProps {
    containerStyle?: ViewStyle;
    children?: React.ReactNode;
  }

  export interface TextProps {
    h1?: boolean;
    h2?: boolean;
    h3?: boolean;
    h4?: boolean;
    style?: TextStyle;
    children?: React.ReactNode;
  }

  export interface ButtonProps {
    title: string;
    buttonStyle?: ViewStyle;
    titleStyle?: TextStyle;
    icon?: {
      name: string;
      type?: string;
      size?: number;
      color?: string;
    };
    onPress?: () => void;
  }

  export const ThemeProvider: ComponentType<ThemeProviderProps>;
  export const Card: ComponentType<CardProps>;
  export const Text: ComponentType<TextProps>;
  export const Button: ComponentType<ButtonProps>;
}
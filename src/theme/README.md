# Fitness App Theme System

This theme system provides a comprehensive styling solution for the fitness booking app with support for dark/light theme switching.

## Features

- **Dark/Light Theme Support**: Automatic theme switching with persistence
- **Consistent Color Palette**: Purple accent (#8B5CF6) with dark navy backgrounds
- **Typography Scale**: Hierarchical text styles with proper spacing
- **Spacing System**: Consistent spacing values (xs: 4px to xxl: 48px)
- **Utility Functions**: Helper functions for shadows, borders, and styling
- **StyleSheet Utilities**: Pre-built styles for common components

## Usage

### 1. Wrap your app with ThemeProvider

```tsx
import React from 'react';
import { ThemeProvider } from './src/theme';
import App from './App';

export default function AppWithTheme() {
  return (
    <ThemeProvider initialTheme="dark">
      <App />
    </ThemeProvider>
  );
}
```

### 2. Use the theme in components

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, createStyles } from '../theme';

export const ExampleComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.h2}>Welcome to FitLife</Text>
        <Text style={styles.textSecondary}>
          Your fitness journey starts here
        </Text>
        
        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={toggleTheme}
        >
          <Text style={styles.textButton}>
            Switch to {theme.mode === 'dark' ? 'Light' : 'Dark'} Theme
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

### 3. Access theme colors directly

```tsx
import { useTheme } from '../theme';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
};
```

### 4. Use utility functions

```tsx
import { getShadowStyle, getBorderRadius, createButtonStyle } from '../theme';

const buttonStyle = createButtonStyle('#8B5CF6', '#FFFFFF', 'large');
const cardStyle = {
  backgroundColor: '#334155',
  borderRadius: getBorderRadius('large'),
  ...getShadowStyle(3),
};
```

## Theme Structure

### Colors
- **Primary**: #8B5CF6 (Purple accent)
- **Background**: #1E293B (Dark navy)
- **Surface**: #334155 (Card background)
- **Text**: Primary (#FFFFFF), Secondary (#94A3B8), Muted (#64748B)
- **Status**: Pending (#F59E0B), Confirmed (#10B981), Completed (#3B82F6), Error (#EF4444)

### Typography
- **h1**: 32px, bold, -0.5 letter spacing
- **h2**: 24px, bold, -0.25 letter spacing
- **h3**: 20px, 600 weight
- **body**: 16px, normal weight
- **caption**: 14px, normal weight
- **button**: 16px, 600 weight, 0.5 letter spacing

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

## Available Styles

The `createStyles` function provides pre-built styles:

- **Containers**: `container`, `safeContainer`
- **Cards**: `card`, `cardSmall`
- **Buttons**: `buttonPrimary`, `buttonSecondary`, `buttonGhost`
- **Text**: `textPrimary`, `textSecondary`, `textMuted`, `h1`, `h2`, `h3`
- **Layout**: `row`, `rowBetween`, `column`, `center`
- **Spacing**: `marginXs` to `marginXl`, `paddingXs` to `paddingXl`
- **Status**: `statusBadge`, `statusBadgeText`
- **Utility**: `divider`

## Theme Persistence

The theme preference is automatically saved to AsyncStorage and restored when the app restarts.
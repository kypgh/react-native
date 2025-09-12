# Theme Configuration

This directory contains the complete theme configuration for the React Native booking app, providing consistent styling across all components.

## Structure

- `index.ts` - Main theme configuration with colors, spacing, typography, and component styles
- `types.ts` - TypeScript interfaces for theme objects
- `utils.ts` - Utility functions for consistent theming
- `README.md` - This documentation file

## Usage

### Basic Theme Usage

```typescript
import { theme, spacing, typography } from '../theme';

// Use theme colors
backgroundColor: theme.colors.primary

// Use consistent spacing
padding: spacing.md

// Use typography styles
...typography.h1
```

### Using Theme Utilities

```typescript
import { getButtonStyle, getCardStyle, getTextStyle, getShadowStyle } from '../theme';

// Get consistent button styling
buttonStyle={getButtonStyle('primary')}

// Get consistent card styling
style={getCardStyle({ marginTop: spacing.lg })}

// Get consistent text styling
style={getTextStyle('h2')}

// Get consistent shadow styling
style={getShadowStyle(3)}
```

### Using Themed Components

```typescript
import { ThemedButton, ThemedCard, ThemedText, ThemedInput } from '../components';

// Use pre-styled components
<ThemedButton title="Click Me" variant="primary" onPress={handlePress} />
<ThemedCard>
  <ThemedText variant="h2">Title</ThemedText>
  <ThemedText variant="body">Content</ThemedText>
</ThemedCard>
<ThemedInput value={text} onChangeText={setText} placeholder="Enter text" />
```

## Theme Structure

### Colors
- `primary` - Main brand color (#2196F3)
- `secondary` - Secondary brand color (#FF9800)
- `success` - Success state color (#4CAF50)
- `warning` - Warning state color (#FF9800)
- `error` - Error state color (#F44336)
- `text` - Default text color (#212121)
- `background` - Default background color (#FFFFFF)
- `surface` - Surface color for cards, etc. (#F5F5F5)
- `grey0-grey5` - Grayscale palette
- `disabled` - Disabled state color
- `divider` - Divider line color

### Spacing
- `xs: 4px` - Extra small spacing
- `sm: 8px` - Small spacing
- `md: 16px` - Medium spacing (default)
- `lg: 24px` - Large spacing
- `xl: 32px` - Extra large spacing
- `xxl: 48px` - Extra extra large spacing

### Typography
- `h1` - Large heading (32px, bold)
- `h2` - Medium heading (24px, bold)
- `h3` - Small heading (20px, semi-bold)
- `body` - Body text (16px, normal)
- `caption` - Caption text (14px, normal)

## Best Practices

1. **Always use theme values** instead of hardcoded colors, spacing, or typography
2. **Use utility functions** for consistent styling patterns
3. **Leverage themed components** for common UI elements
4. **Maintain consistency** by following the established patterns
5. **Test on multiple screen sizes** to ensure responsive design

## Customization

To customize the theme:

1. Update colors in `theme.colors`
2. Adjust spacing values in `spacing`
3. Modify typography in `typography`
4. Update component styles in `componentStyles`
5. Add new utility functions in `utils.ts` as needed

The theme is designed to be easily customizable while maintaining consistency across the entire application.
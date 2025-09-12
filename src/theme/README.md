# Theme Configuration

This directory contains the theme configuration for the React Native booking app.

## Files

- `index.ts` - Main theme configuration with colors, spacing, and typography
- `types.ts` - TypeScript interfaces for theme objects
- `utils.ts` - Utility functions for consistent theming

## Usage

```typescript
import { theme, spacing, typography } from '../theme';

// Use theme colors
backgroundColor: theme.colors.primary

// Use consistent spacing
padding: spacing.md

// Use typography styles
...typography.h1
```

## Theme Structure

- **Colors**: Primary, secondary, success, warning, error, text, background, surface
- **Spacing**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), xxl (48px)
- **Typography**: h1, h2, h3, body, caption

Always use theme values instead of hardcoded colors, spacing, or typography for consistency.
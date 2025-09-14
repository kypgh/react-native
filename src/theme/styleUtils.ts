import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppTheme } from './types';
import { spacing } from './spacing';
import { typography } from './typography';
import { getShadowStyle, getBorderRadius } from './utils';

/**
 * Create consistent styles based on theme
 */
export const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,

    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.md,
    } as ViewStyle,

    // Card styles
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: getBorderRadius('large'),
      padding: spacing.md,
      ...getShadowStyle(3),
    } as ViewStyle,

    cardSmall: {
      backgroundColor: theme.colors.surface,
      borderRadius: getBorderRadius('medium'),
      padding: spacing.sm,
      ...getShadowStyle(2),
    } as ViewStyle,

    // Button styles with responsive touch targets
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      borderRadius: getBorderRadius('medium'),
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: Math.max(44, spacing.xl + spacing.md), // Ensure minimum touch target
      ...getShadowStyle(2),
    } as ViewStyle,

    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: getBorderRadius('medium'),
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: Math.max(44, spacing.xl + spacing.md), // Ensure minimum touch target
    } as ViewStyle,

    buttonGhost: {
      backgroundColor: 'transparent',
      borderRadius: getBorderRadius('medium'),
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: Math.max(36, spacing.lg + spacing.sm), // Smaller but still accessible
    } as ViewStyle,

    // Text styles
    textPrimary: {
      ...typography.body,
      color: theme.colors.text.primary,
    } as TextStyle,

    textSecondary: {
      ...typography.body,
      color: theme.colors.text.secondary,
    } as TextStyle,

    textMuted: {
      ...typography.caption,
      color: theme.colors.text.muted,
    } as TextStyle,

    textButton: {
      ...typography.button,
      color: '#FFFFFF',
    } as TextStyle,

    textButtonSecondary: {
      ...typography.button,
      color: theme.colors.primary,
    } as TextStyle,

    // Heading styles
    h1: {
      ...typography.h1,
      color: theme.colors.text.primary,
    } as TextStyle,

    h2: {
      ...typography.h2,
      color: theme.colors.text.primary,
    } as TextStyle,

    h3: {
      ...typography.h3,
      color: theme.colors.text.primary,
    } as TextStyle,

    // Layout styles
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    column: {
      flexDirection: 'column',
    } as ViewStyle,

    center: {
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Spacing styles
    marginXs: { margin: spacing.xs } as ViewStyle,
    marginSm: { margin: spacing.sm } as ViewStyle,
    marginMd: { margin: spacing.md } as ViewStyle,
    marginLg: { margin: spacing.lg } as ViewStyle,
    marginXl: { margin: spacing.xl } as ViewStyle,

    paddingXs: { padding: spacing.xs } as ViewStyle,
    paddingSm: { padding: spacing.sm } as ViewStyle,
    paddingMd: { padding: spacing.md } as ViewStyle,
    paddingLg: { padding: spacing.lg } as ViewStyle,
    paddingXl: { padding: spacing.xl } as ViewStyle,

    // Status badge styles
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: getBorderRadius('small'),
      alignSelf: 'flex-start',
    } as ViewStyle,

    statusBadgeText: {
      ...typography.caption,
      fontWeight: '600',
      color: '#FFFFFF',
    } as TextStyle,

    // Divider
    divider: {
      height: 1,
      backgroundColor: theme.colors.text.muted,
      opacity: 0.2,
      marginVertical: spacing.md,
    } as ViewStyle,

    // Responsive grid layouts
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.sm,
    } as ViewStyle,

    gridItem2: {
      width: '50%',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.md,
    } as ViewStyle,

    gridItem3: {
      width: '33.333%',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.md,
    } as ViewStyle,

    // Responsive containers
    responsiveContainer: {
      flex: 1,
      paddingHorizontal: spacing.md,
      maxWidth: 768, // Max width for tablet/desktop
      alignSelf: 'center',
      width: '100%',
    } as ViewStyle,

    // Touch targets
    touchableArea: {
      minHeight: 44,
      minWidth: 44,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Responsive spacing
    sectionSpacing: {
      marginVertical: spacing.lg,
    } as ViewStyle,

    itemSpacing: {
      marginBottom: spacing.md,
    } as ViewStyle,
  });
};

/**
 * Get status badge style based on status
 */
export const getStatusBadgeStyle = (theme: AppTheme, status: 'pending' | 'confirmed' | 'completed' | 'error') => {
  const baseStyle = {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: getBorderRadius('small'),
    alignSelf: 'flex-start' as const,
  };

  return {
    ...baseStyle,
    backgroundColor: theme.colors.status[status],
  };
};
/**
 * Component utility functions for consistent behavior
 */

/**
 * Generate consistent accessibility labels for interactive elements
 */
export const generateAccessibilityLabel = (
  type: 'button' | 'card' | 'input' | 'link',
  content: string,
  action?: string
): string => {
  const actionMap: Record<string, string> = {
    button: action || 'tap to activate',
    card: action || 'tap for details',
    input: action || 'text input field',
    link: action || 'tap to navigate',
  };

  return `${content}, ${actionMap[type]}`;
};

/**
 * Generate accessibility hints for complex interactions
 */
export const generateAccessibilityHint = (
  action: string,
  context?: string
): string => {
  const baseHint = `Double tap to ${action}`;
  return context ? `${baseHint}. ${context}` : baseHint;
};

/**
 * Check if component should be focusable for accessibility
 */
export const shouldBeFocusable = (
  isInteractive: boolean,
  isDisabled: boolean = false
): boolean => {
  return isInteractive && !isDisabled;
};

/**
 * Get consistent touch target size for accessibility
 */
export const getMinimumTouchTarget = (): { minWidth: number; minHeight: number } => {
  return {
    minWidth: 44,
    minHeight: 44,
  };
};

/**
 * Generate consistent test IDs for components
 */
export const generateTestId = (
  componentType: string,
  identifier: string,
  suffix?: string
): string => {
  const baseId = `${componentType}-${identifier}`;
  return suffix ? `${baseId}-${suffix}` : baseId;
};
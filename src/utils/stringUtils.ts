/**
 * Centralized string manipulation utilities
 */

/**
 * Get user initials from first and last name
 * Standardized format: "JD" (uppercase)
 */
export const getUserInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

/**
 * Capitalize first letter of each word
 * Examples: "john doe" -> "John Doe"
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate text with ellipsis
 * Examples: "This is a long text..." (maxLength: 20)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Convert camelCase to readable text
 * Examples: "firstName" -> "First Name"
 */
export const camelCaseToReadable = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Generate slug from text
 * Examples: "My Awesome Class" -> "my-awesome-class"
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extract domain from email
 * Examples: "user@example.com" -> "example.com"
 */
export const extractEmailDomain = (email: string): string => {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : '';
};

/**
 * Mask sensitive information
 * Examples: "1234567890" -> "******7890" (showLast: 4)
 */
export const maskString = (str: string, showLast: number = 4, maskChar: string = '*'): string => {
  if (str.length <= showLast) return str;
  const maskedPart = maskChar.repeat(str.length - showLast);
  const visiblePart = str.slice(-showLast);
  return maskedPart + visiblePart;
};

/**
 * Remove extra whitespace and normalize
 */
export const normalizeWhitespace = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Check if string contains only numbers
 */
export const isNumericString = (str: string): boolean => {
  return /^\d+$/.test(str);
};

/**
 * Format status text for display
 * Examples: "pending" -> "Pending", "confirmed" -> "Confirmed"
 */
export const formatStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed', 
    completed: 'Completed',
    cancelled: 'Cancelled',
    error: 'Error',
  };
  return statusMap[status.toLowerCase()] || capitalizeWords(status);
};

/**
 * Generate random string for IDs
 */
export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Clean and format class name for display
 */
export const formatClassName = (className: string): string => {
  return normalizeWhitespace(className).replace(/\b\w/g, l => l.toUpperCase());
};
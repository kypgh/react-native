/**
 * Centralized number and currency formatting utilities
 */

/**
 * Format currency with proper symbol and decimals
 * Standardized format: "$99.00"
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format price per credit calculation
 * Standardized format: "$4.95 per credit"
 */
export const formatPricePerCredit = (totalPrice: number, credits: number): string => {
  const pricePerCredit = totalPrice / credits;
  return `${formatCurrency(pricePerCredit)} per credit`;
};

/**
 * Format duration in minutes to readable format
 * Examples: "60 min", "90 min", "2h 30min"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Format number with proper pluralization
 * Examples: "1 spot", "5 spots", "1 credit", "10 credits"
 */
export const formatPlural = (count: number, singular: string, plural?: string): string => {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
};

/**
 * Format available spots display
 * Examples: "5/20 spots", "12/20 spots"
 */
export const formatAvailableSpots = (available: number, total: number): string => {
  return `${available}/${total} ${available === 1 ? 'spot' : 'spots'}`;
};

/**
 * Format percentage
 * Examples: "75%", "100%"
 */
export const formatPercentage = (value: number, total: number): string => {
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
};

/**
 * Format large numbers with abbreviations
 * Examples: "1K", "1.5K", "1M"
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Format file size
 * Examples: "1.5 MB", "500 KB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format phone number
 * Examples: "(555) 123-4567"
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};
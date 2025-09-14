import { ColorPalette } from './types';

// Dark theme colors (primary theme for fitness app)
export const darkColors: ColorPalette = {
  primary: '#8B5CF6',        // Purple accent
  background: '#1E293B',     // Dark navy background
  surface: '#334155',        // Card/surface background
  text: {
    primary: '#FFFFFF',      // White text
    secondary: '#94A3B8',    // Light gray text
    muted: '#64748B',        // Muted gray text
  },
  status: {
    pending: '#F59E0B',      // Yellow for pending
    confirmed: '#10B981',    // Green for confirmed
    completed: '#3B82F6',    // Blue for completed
    error: '#EF4444',        // Red for errors
  },
};

// Light theme colors (alternative theme)
export const lightColors: ColorPalette = {
  primary: '#8B5CF6',        // Same purple accent
  background: '#FFFFFF',     // White background
  surface: '#F8FAFC',        // Light surface
  text: {
    primary: '#1E293B',      // Dark text
    secondary: '#475569',    // Medium gray text
    muted: '#64748B',        // Muted gray text
  },
  status: {
    pending: '#F59E0B',      // Yellow for pending
    confirmed: '#10B981',    // Green for confirmed
    completed: '#3B82F6',    // Blue for completed
    error: '#EF4444',        // Red for errors
  },
};
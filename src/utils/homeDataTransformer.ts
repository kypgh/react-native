import { Session, Brand } from '../types/api';
import { ClassItem, GymInfo } from '../types/api';

/**
 * Transform API Session data to ClassItem format for the home screen
 */
export const transformSessionToClassItem = (session: Session): ClassItem => {
  return {
    id: session._id,
    name: session.class?.name || 'Unknown Class',
    date: new Date(session.dateTime),
    duration: session.class?.duration || 60,
    availableSpots: session.availableSpots,
    totalSpots: session.capacity,
    instructor: undefined, // API doesn't provide instructor info in session
    category: session.class?.category || 'General',
  };
};

/**
 * Transform multiple sessions to class items
 */
export const transformSessionsToClassItems = (sessions: Session[]): ClassItem[] => {
  return sessions.map(transformSessionToClassItem);
};

/**
 * Create gym info from the first available brand
 */
export const createGymInfoFromBrand = (brand?: Brand): GymInfo => {
  if (!brand) {
    return {
      name: 'FitLife Gym',
      tagline: 'A modern fitness center focused on holistic wellness',
      description: 'Transform your body and mind with our comprehensive fitness programs',
    };
  }

  return {
    name: brand.name,
    tagline: brand.description || 'Your fitness journey starts here',
    description: brand.description || 'Transform your body and mind with our comprehensive fitness programs',
  };
};

/**
 * Extract unique categories from sessions
 */
export const extractCategoriesFromSessions = (sessions: Session[]): string[] => {
  const categories = new Set<string>();
  
  sessions.forEach(session => {
    if (session.class?.category) {
      categories.add(session.class.category);
    }
  });

  return ['All Classes', ...Array.from(categories).sort()];
};

/**
 * Get sessions for a specific date
 */
export const getSessionsForDate = (sessions: Session[], date: Date): Session[] => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return sessions.filter(session => {
    const sessionDate = new Date(session.dateTime);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === targetDate.getTime();
  });
};

/**
 * Filter sessions by category
 */
export const filterSessionsByCategory = (sessions: Session[], category: string): Session[] => {
  if (category === 'All Classes') {
    return sessions;
  }

  return sessions.filter(session => session.class?.category === category);
};

/**
 * Sort sessions by date/time
 */
export const sortSessionsByDateTime = (sessions: Session[]): Session[] => {
  return [...sessions].sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );
};

/**
 * Check if a session has low availability (5 or fewer spots)
 */
export const hasLowAvailability = (session: Session): boolean => {
  return session.availableSpots <= 5;
};

/**
 * Check if a session is fully booked
 */
export const isFullyBooked = (session: Session): boolean => {
  return session.availableSpots <= 0;
};

/**
 * Get availability status text
 */
export const getAvailabilityStatus = (session: Session): string => {
  if (isFullyBooked(session)) {
    return 'Fully Booked';
  }
  
  if (hasLowAvailability(session)) {
    return 'Few Spots Left';
  }
  
  return 'Available';
};

/**
 * Format session time for display
 */
export const formatSessionTime = (session: Session): string => {
  const date = new Date(session.dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get session duration text
 */
export const getSessionDurationText = (session: Session): string => {
  const duration = session.class?.duration || 60;
  return `${duration} min`;
};

/**
 * Create a mock brand for fallback
 */
export const createMockBrand = (): Brand => {
  return {
    _id: 'mock-brand-1',
    name: 'FitLife Gym',
    description: 'A modern fitness center focused on holistic wellness',
    logo: undefined,
    address: {
      street: '123 Fitness St',
      city: 'Wellness City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'info@fitlifegym.com',
      website: 'https://fitlifegym.com',
    },
    businessHours: [
      { day: 'Monday', openTime: '06:00', closeTime: '22:00', isClosed: false },
      { day: 'Tuesday', openTime: '06:00', closeTime: '22:00', isClosed: false },
      { day: 'Wednesday', openTime: '06:00', closeTime: '22:00', isClosed: false },
      { day: 'Thursday', openTime: '06:00', closeTime: '22:00', isClosed: false },
      { day: 'Friday', openTime: '06:00', closeTime: '22:00', isClosed: false },
      { day: 'Saturday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Sunday', openTime: '08:00', closeTime: '20:00', isClosed: false },
    ],
  };
};
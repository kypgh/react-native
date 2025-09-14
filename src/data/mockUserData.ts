// Mock data for user-related information
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  membershipStatus: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface GymBrand {
  id: string;
  name: string;
  description: string;
  logo: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export const mockUser: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  dateOfBirth: '1990-05-15',
  membershipStatus: 'active',
  joinDate: new Date('2024-01-15'),
  preferences: {
    notifications: true,
    emailUpdates: true,
    theme: 'dark',
  },
};

export const mockGymBrand: GymBrand = {
  id: '1',
  name: 'FitLife Gym',
  description: 'A modern fitness center focused on holistic wellness and community building',
  logo: '🏋️',
  address: '123 Fitness Street, Wellness City, WC 12345',
  phone: '(555) 987-6543',
  email: 'info@fitlifegym.com',
  website: 'https://fitlifegym.com',
  socialMedia: {
    instagram: '@fitlifegym',
    facebook: 'FitLifeGym',
    twitter: '@fitlifegym',
  },
};
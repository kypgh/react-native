// Mock data interfaces for profile
export interface ProfileScreenData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    profilePhoto?: string;
  };
  activeBrand: {
    name: string;
    description: string;
    logo: string;
  };
}

export const mockProfileData: ProfileScreenData = {
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-05-15',
  },
  activeBrand: {
    name: 'FitLife Gym',
    description: 'A modern fitness center focused on holistic wellness and community building',
    logo: '🏋️',
  },
};
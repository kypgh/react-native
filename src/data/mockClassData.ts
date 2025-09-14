// Mock data for fitness classes
export interface ClassItem {
  id: string;
  name: string;
  date: Date;
  duration: number;
  availableSpots: number;
  totalSpots: number;
  instructor?: string;
  category: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Instructor {
  id: string;
  name: string;
  specialties: string[];
  bio?: string;
  photo?: string;
}

// Sample instructors
export const mockInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialties: ['Yoga', 'Pilates', 'Meditation'],
    bio: 'Certified yoga instructor with 8+ years of experience',
  },
  {
    id: '2',
    name: 'Mike Chen',
    specialties: ['CrossFit', 'HIIT', 'Strength Training'],
    bio: 'Former competitive athlete and certified CrossFit trainer',
  },
  {
    id: '3',
    name: 'Emma Davis',
    specialties: ['Yoga', 'Barre', 'Flexibility'],
    bio: 'Holistic wellness coach specializing in mind-body connection',
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    specialties: ['Strength Training', 'Powerlifting', 'Conditioning'],
    bio: 'Certified personal trainer with expertise in strength development',
  },
  {
    id: '5',
    name: 'Emma Wilson',
    specialties: ['Pilates', 'Core Training', 'Rehabilitation'],
    bio: 'Physical therapist and Pilates instructor',
  },
  {
    id: '6',
    name: 'David Kim',
    specialties: ['CrossFit', 'Olympic Lifting', 'Functional Movement'],
    bio: 'CrossFit Level 3 trainer and movement specialist',
  },
  {
    id: '7',
    name: 'Lisa Park',
    specialties: ['Cycling', 'Cardio', 'Endurance Training'],
    bio: 'Former professional cyclist and indoor cycling instructor',
  },
];

// Sample class categories
export const mockClassCategories = [
  'All Classes',
  'Basic Fitness',
  'CrossFit WOD',
  'Yoga & Mindfulness',
  'Strength Training',
  'Cardio & HIIT',
  'Pilates & Core',
];

// Extended class data for various screens
export const mockExtendedClasses: ClassItem[] = [
  {
    id: '1',
    name: 'Weekend Pilates Fusion',
    date: new Date('2025-09-13T10:00:00'),
    duration: 90,
    availableSpots: 12,
    totalSpots: 20,
    instructor: 'Sarah Johnson',
    category: 'Basic Fitness',
    description: 'A flowing combination of Pilates and yoga movements',
    difficulty: 'Intermediate',
  },
  {
    id: '2',
    name: 'Morning CrossFit WOD',
    date: new Date('2025-09-13T07:00:00'),
    duration: 60,
    availableSpots: 5,
    totalSpots: 15,
    instructor: 'Mike Chen',
    category: 'CrossFit WOD',
    description: 'High-intensity functional fitness workout',
    difficulty: 'Advanced',
  },
  {
    id: '3',
    name: 'Evening Yoga Flow',
    date: new Date('2025-09-13T18:30:00'),
    duration: 75,
    availableSpots: 8,
    totalSpots: 12,
    instructor: 'Emma Davis',
    category: 'Basic Fitness',
    description: 'Relaxing vinyasa flow to end your day',
    difficulty: 'Beginner',
  },
  {
    id: '4',
    name: 'Strength & Conditioning',
    date: new Date('2025-09-14T09:00:00'),
    duration: 60,
    availableSpots: 10,
    totalSpots: 16,
    instructor: 'Alex Rodriguez',
    category: 'Strength Training',
    description: 'Build strength and improve athletic performance',
    difficulty: 'Intermediate',
  },
  {
    id: '5',
    name: 'HIIT Cardio Blast',
    date: new Date('2025-09-14T18:00:00'),
    duration: 45,
    availableSpots: 15,
    totalSpots: 20,
    instructor: 'Mike Chen',
    category: 'Cardio & HIIT',
    description: 'High-intensity interval training for maximum calorie burn',
    difficulty: 'Intermediate',
  },
  {
    id: '6',
    name: 'Core Power Pilates',
    date: new Date('2025-09-15T12:00:00'),
    duration: 50,
    availableSpots: 6,
    totalSpots: 14,
    instructor: 'Emma Wilson',
    category: 'Pilates & Core',
    description: 'Focused core strengthening with Pilates principles',
    difficulty: 'Intermediate',
  },
];
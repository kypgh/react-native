import { HomeScreenData } from '../types/api';

export const mockHomeData: HomeScreenData = {
  gymInfo: {
    name: "FitLife Gym",
    tagline: "A modern fitness center focused on holistic wellness",
    description:
      "Transform your body and mind with our comprehensive fitness programs",
  },
  classFilters: ["All Classes", "Basic Fitness", "CrossFit WOD"],
  selectedWeek: {
    start: new Date("2025-09-08"),
    end: new Date("2025-09-14"),
  },
  selectedDate: new Date("2025-09-13"),
  classes: [
    {
      id: "1",
      name: "Weekend Pilates Fusion",
      date: new Date("2025-09-13T10:00:00"),
      duration: 90,
      availableSpots: 12,
      totalSpots: 20,
      instructor: "Sarah Johnson",
      category: "Basic Fitness",
    },
    {
      id: "2",
      name: "Morning CrossFit WOD",
      date: new Date("2025-09-13T07:00:00"),
      duration: 60,
      availableSpots: 5,
      totalSpots: 15,
      instructor: "Mike Chen",
      category: "CrossFit WOD",
    },
    {
      id: "3",
      name: "Evening Yoga Flow",
      date: new Date("2025-09-13T18:30:00"),
      duration: 75,
      availableSpots: 8,
      totalSpots: 12,
      instructor: "Emma Davis",
      category: "Basic Fitness",
    },
  ],
};
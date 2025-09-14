// Mock data interfaces for bookings
export interface BookingItem {
  id: string;
  className: string;
  date: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  instructor?: string;
}

export interface BookingsScreenData {
  stats: {
    pending: number;
    upcoming: number;
    completed: number;
    total: number;
  };
  bookings: BookingItem[];
  sortBy: 'date' | 'status' | 'class';
  filterBy: string[];
}

export const mockBookingsData: BookingsScreenData = {
  stats: {
    pending: 3,
    upcoming: 5,
    completed: 12,
    total: 20,
  },
  bookings: [
    {
      id: '1',
      className: 'Morning Yoga Flow',
      date: new Date('2025-09-15T08:00:00'),
      duration: 60,
      status: 'confirmed',
      instructor: 'Sarah Johnson',
    },
    {
      id: '2',
      className: 'HIIT Cardio Blast',
      date: new Date('2025-09-16T18:30:00'),
      duration: 45,
      status: 'pending',
      instructor: 'Mike Chen',
    },
    {
      id: '3',
      className: 'Strength Training',
      date: new Date('2025-09-17T07:00:00'),
      duration: 90,
      status: 'confirmed',
      instructor: 'Alex Rodriguez',
    },
    {
      id: '4',
      className: 'Pilates Core',
      date: new Date('2025-09-12T19:00:00'),
      duration: 60,
      status: 'completed',
      instructor: 'Emma Wilson',
    },
    {
      id: '5',
      className: 'CrossFit WOD',
      date: new Date('2025-09-11T17:00:00'),
      duration: 75,
      status: 'completed',
      instructor: 'David Kim',
    },
    {
      id: '6',
      className: 'Spin Class',
      date: new Date('2025-09-18T06:30:00'),
      duration: 45,
      status: 'pending',
      instructor: 'Lisa Park',
    },
  ],
  sortBy: 'date',
  filterBy: [],
};
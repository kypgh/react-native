// User data interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

// Booking related interfaces
export interface BookingClass {
  _id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  capacity: number;
  brand: {
    _id: string;
    name: string;
    logo?: string;
  };
}

export interface BookingSession {
  _id: string;
  class: BookingClass;
  dateTime: string;
  instructor?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  availableSpots: number;
  totalSpots: number;
}

export interface Booking {
  _id: string;
  session: BookingSession;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment and subscription interfaces
export interface PaymentPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isActive: boolean;
  creditsIncluded?: number;
}

export interface Subscription {
  _id: string;
  plan: PaymentPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditBalance {
  _id: string;
  userId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  expirationDate?: string;
  lastUpdated: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  error?: string;
}

// API error interface
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// App state interfaces
export interface AppState {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
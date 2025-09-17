// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | string; // Can be seconds (number) or date string
  tokenType?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: ClientProfile;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterResponse {
  user: ClientProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface UserProfile extends ClientProfile {}

// Discovery Response Types
export interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export interface BrandDetailsResponse {
  brand: Brand;
  classes: ClassInfo[];
  subscriptionPlans: SubscriptionPlan[];
  creditPlans: CreditPlan[];
}

export interface ClassesResponse {
  classes: ClassInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface CreditPlansResponse {
  plans: CreditPlan[];
}

// Query Parameter Types
export interface BrandQueryParams {
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassQueryParams {
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  brand?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SessionQueryParams {
  startDate?: string;
  endDate?: string;
  brand?: string;
  class?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  availableOnly?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhoto?: string;
  preferences: {
    favoriteCategories: string[];
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    timezone?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Legacy User interface for backward compatibility
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

// Address and Contact Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface BusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// Brand Types
export interface Brand {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  address: Address;
  contact: Contact;
  businessHours: BusinessHour[];
}

export interface BrandSummary {
  _id: string;
  name: string;
  logo?: string;
  city: string;
  state: string;
}

// Time Block Types
export interface TimeBlock {
  startTime: string;
  endTime: string;
  days: string[];
}

// Class Types
export interface ClassInfo {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slots: number;
  duration: number;
  timeBlocks: TimeBlock[];
  brand: BrandSummary;
  cancellationPolicy?: number;
}

// Session Types
export interface Session {
  _id: string;
  dateTime: string;
  capacity: number;
  availableSpots: number;
  status: string;
  class: ClassInfo;
  brand: BrandSummary;
}

// Legacy Booking interfaces for backward compatibility
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

// Subscription Plan Types
export interface FrequencyLimit {
  period: 'daily' | 'weekly' | 'monthly';
  limit: number;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  billingCycle: string;
  frequencyLimit: FrequencyLimit;
  includedClasses: ClassInfo[];
  isUnlimited: boolean;
  isUnlimitedFrequency: boolean;
}

export interface Subscription {
  _id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Credit Plan Types
export interface CreditPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  creditAmount: number;
  bonusCredits: number;
  totalCredits: number;
  validityPeriod: number;
  validityDescription: string;
  pricePerCredit: number;
  pricePerCreditFormatted: string;
  includedClasses: ClassInfo[];
  isUnlimited: boolean;
}

// Credit Balance Types
export interface CreditBalance {
  brand: BrandSummary;
  totalCredits: number;
  availableCredits: number;
  expiredCredits: number;
  expiringCredits: number;
  nextExpiryDate: string;
}

export interface CreditTransaction {
  _id: string;
  type: 'purchase' | 'usage' | 'expiry' | 'bonus';
  amount: number;
  description: string;
  createdAt: string;
  expiresAt: string;
}

export interface ExpiringCredit {
  brand: BrandSummary;
  credits: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

// Legacy PaymentPlan interface for backward compatibility
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

// Payment Types
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Payment {
  _id: string;
  type: 'subscription' | 'credit';
  amount: number;
  currency: string;
  status: string;
  brand: BrandSummary;
  plan: SubscriptionPlan | CreditPlan;
  createdAt: string;
}

// Eligibility Types
export interface BookingEligibility {
  eligible: boolean;
  reason?: string;
  remainingBookings?: number;
  nextResetDate?: string;
}

export interface CreditEligibility {
  eligible: boolean;
  availableCredits: number;
  requiredCredits: number;
  reason?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T & {
    pagination: Pagination;
  };
  message?: string;
  error?: ApiError;
}

// Specific API Response Types
export interface AuthResponse {
  client: ClientProfile;
  tokens: AuthTokens;
}

export interface BrandDetailsResponse {
  brand: Brand;
  classes: ClassInfo[];
  stats: {
    totalClasses: number;
    uniqueCategories: number;
    difficultyDistribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
  };
}

export interface SubscriptionPlansResponse {
  brand: BrandSummary;
  subscriptionPlans: SubscriptionPlan[];
}

export interface CreditPlansResponse {
  brand: BrandSummary;
  creditPlans: CreditPlan[];
}

export interface PaymentIntentResponse {
  paymentIntent: PaymentIntent;
  subscriptionPlan?: SubscriptionPlan;
  creditPlan?: CreditPlan;
}

export interface PaymentConfirmationResponse {
  payment: Payment;
  subscription?: Subscription;
  credits?: CreditBalance;
  requiresAction?: boolean;
  paymentIntent?: PaymentIntent;
}

// API error types and interfaces
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

export interface ApiError {
  type: ApiErrorType;
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

// Home Screen specific interfaces
export interface GymInfo {
  name: string;
  tagline: string;
  description?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  date: Date;
  duration: number; // in minutes
  availableSpots: number;
  totalSpots: number;
  instructor?: string;
  category: string;
}

export interface HomeScreenData {
  gymInfo: GymInfo;
  classFilters: string[];
  selectedWeek: {
    start: Date;
    end: Date;
  };
  selectedDate: Date;
  classes: ClassItem[];
}

// Authentication Request Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: {
    favoriteCategories?: string[];
    preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    timezone?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Profile Update Types
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePhoto?: string;
  preferences?: {
    favoriteCategories?: string[];
    preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    timezone?: string;
  };
}

// Purchase Request Types
export interface SubscriptionPurchaseRequest {
  subscriptionPlanId: string;
  paymentMethodId?: string;
}

export interface CreditPurchaseRequest {
  creditPlanId: string;
  paymentMethodId?: string;
}

export interface PaymentConfirmationRequest {
  paymentIntentId: string;
}

export interface SubscriptionCancellationRequest {
  reason?: string;
}

// Query Parameter Types for API Endpoints
export interface BrandQueryParams {
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassQueryParams {
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  brand?: string;
  city?: string;
  state?: string;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SessionQueryParams {
  search?: string;
  brand?: string;
  class?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  startDate?: string;
  endDate?: string;
  availableOnly?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubscriptionQueryParams {
  status?: 'active' | 'cancelled' | 'expired';
  brand?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentHistoryQueryParams {
  type?: 'subscription' | 'credit';
  status?: 'succeeded' | 'failed' | 'pending';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Extended API Response Wrapper Types
export interface BrandsResponse {
  brands: Brand[];
  pagination: Pagination;
}

export interface ClassesResponse {
  classes: ClassInfo[];
  pagination: Pagination;
}

export interface SessionsResponse {
  sessions: Session[];
  pagination: Pagination;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: Pagination;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: Pagination;
}

export interface CreditBalancesResponse {
  balances: CreditBalance[];
}

export interface CreditTransactionsResponse {
  transactions: CreditTransaction[];
}

export interface CreditTransactionsResponse {
  transactions: CreditTransaction[];
  pagination?: Pagination;
}

export interface ExpiringCreditsResponse {
  expiringCredits: ExpiringCredit[];
}

// Token Refresh Response Type
export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// Profile Response Type
export interface ProfileResponse {
  data: {
    client: ClientProfile;
  };
}

// Single Item Response Types
export interface BrandResponse {
  brand: Brand;
}

export interface ClassResponse {
  class: ClassInfo;
}

export interface SessionResponse {
  session: Session;
}

export interface SubscriptionResponse {
  subscription: Subscription;
}

export interface PaymentResponse {
  payment: Payment;
}

// Error Response Type (matches backend exactly)
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string | Record<string, any>;
  };
}
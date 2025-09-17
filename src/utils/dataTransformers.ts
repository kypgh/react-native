import {
  ClientProfile,
  User,
  Brand,
  BrandSummary,
  ClassInfo,
  Session,
  SubscriptionPlan,
  CreditPlan,
  Subscription,
  CreditBalance,
  Payment,
  PaymentPlan,
  BookingClass,
  BookingSession
} from '../types/api';

/**
 * Data transformation utilities for converting backend API responses
 * to frontend-compatible formats and vice versa
 */

// Client Profile Transformations
export const transformClientProfile = (backendClient: any): ClientProfile => {
  return {
    _id: backendClient._id,
    email: backendClient.email,
    firstName: backendClient.firstName,
    lastName: backendClient.lastName,
    phone: backendClient.phone,
    profilePhoto: backendClient.profilePhoto,
    preferences: {
      favoriteCategories: backendClient.preferences?.favoriteCategories || [],
      preferredDifficulty: backendClient.preferences?.preferredDifficulty || 'beginner',
      notifications: {
        email: backendClient.preferences?.notifications?.email ?? true,
        sms: backendClient.preferences?.notifications?.sms ?? false,
        push: backendClient.preferences?.notifications?.push ?? true,
      },
      timezone: backendClient.preferences?.timezone,
    },
    status: backendClient.status || 'active',
    createdAt: backendClient.createdAt,
    updatedAt: backendClient.updatedAt,
  };
};

// Legacy User transformation for backward compatibility
export const transformClientToUser = (client: ClientProfile): User => {
  return {
    id: client._id,
    email: client.email,
    firstName: client.firstName,
    lastName: client.lastName,
    profilePhoto: client.profilePhoto,
    phoneNumber: client.phone,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
};

// Brand Transformations
export const transformBrand = (backendBrand: any): Brand => {
  return {
    _id: backendBrand._id,
    name: backendBrand.name,
    description: backendBrand.description || '',
    logo: backendBrand.logo,
    address: {
      street: backendBrand.address?.street || '',
      city: backendBrand.address?.city || '',
      state: backendBrand.address?.state || '',
      zipCode: backendBrand.address?.zipCode || '',
      country: backendBrand.address?.country || '',
    },
    contact: {
      phone: backendBrand.contact?.phone,
      email: backendBrand.contact?.email,
      website: backendBrand.contact?.website,
    },
    businessHours: backendBrand.businessHours || [],
  };
};

export const transformBrandSummary = (backendBrand: any): BrandSummary => {
  return {
    _id: backendBrand._id,
    name: backendBrand.name,
    logo: backendBrand.logo,
    city: backendBrand.city || backendBrand.address?.city || '',
    state: backendBrand.state || backendBrand.address?.state || '',
  };
};

// Class Transformations
export const transformClass = (backendClass: any): ClassInfo => {
  return {
    _id: backendClass._id,
    name: backendClass.name,
    description: backendClass.description || '',
    category: backendClass.category,
    difficulty: backendClass.difficulty,
    slots: backendClass.slots,
    duration: backendClass.duration,
    timeBlocks: backendClass.timeBlocks || [],
    brand: transformBrandSummary(backendClass.brand),
    cancellationPolicy: backendClass.cancellationPolicy,
  };
};

// Legacy BookingClass transformation
export const transformToBookingClass = (classInfo: ClassInfo): BookingClass => {
  return {
    _id: classInfo._id,
    name: classInfo.name,
    description: classInfo.description,
    duration: classInfo.duration,
    capacity: classInfo.slots,
    brand: {
      _id: classInfo.brand._id,
      name: classInfo.brand.name,
      logo: classInfo.brand.logo,
    },
  };
};

// Session Transformations
export const transformSession = (backendSession: any): Session => {
  return {
    _id: backendSession._id,
    dateTime: backendSession.dateTime,
    capacity: backendSession.capacity,
    availableSpots: backendSession.availableSpots,
    status: backendSession.status,
    class: transformClass(backendSession.class),
    brand: transformBrandSummary(backendSession.brand),
  };
};

// Legacy BookingSession transformation
export const transformToBookingSession = (session: Session): BookingSession => {
  return {
    _id: session._id,
    class: transformToBookingClass(session.class),
    dateTime: session.dateTime,
    availableSpots: session.availableSpots,
    totalSpots: session.capacity,
  };
};

// Subscription Plan Transformations
export const transformSubscriptionPlan = (backendPlan: any): SubscriptionPlan => {
  return {
    _id: backendPlan._id,
    name: backendPlan.name,
    description: backendPlan.description || '',
    price: backendPlan.price,
    priceFormatted: backendPlan.priceFormatted || `$${backendPlan.price}`,
    billingCycle: backendPlan.billingCycle,
    frequencyLimit: backendPlan.frequencyLimit || { period: 'monthly', limit: 0 },
    includedClasses: (backendPlan.includedClasses || []).map(transformClass),
    isUnlimited: backendPlan.isUnlimited || false,
    isUnlimitedFrequency: backendPlan.isUnlimitedFrequency || false,
  };
};

// Legacy PaymentPlan transformation
export const transformToPaymentPlan = (subscriptionPlan: SubscriptionPlan): PaymentPlan => {
  return {
    _id: subscriptionPlan._id,
    name: subscriptionPlan.name,
    description: subscriptionPlan.description,
    price: subscriptionPlan.price,
    currency: 'USD',
    billingCycle: subscriptionPlan.billingCycle as 'monthly' | 'yearly' | 'one-time',
    features: [subscriptionPlan.description],
    isActive: true,
  };
};

// Credit Plan Transformations
export const transformCreditPlan = (backendPlan: any): CreditPlan => {
  return {
    _id: backendPlan._id,
    name: backendPlan.name,
    description: backendPlan.description || '',
    price: backendPlan.price,
    priceFormatted: backendPlan.priceFormatted || `$${backendPlan.price}`,
    creditAmount: backendPlan.creditAmount,
    bonusCredits: backendPlan.bonusCredits || 0,
    totalCredits: backendPlan.totalCredits || backendPlan.creditAmount,
    validityPeriod: backendPlan.validityPeriod,
    validityDescription: backendPlan.validityDescription || '',
    pricePerCredit: backendPlan.pricePerCredit,
    pricePerCreditFormatted: backendPlan.pricePerCreditFormatted || `$${backendPlan.pricePerCredit}`,
    includedClasses: (backendPlan.includedClasses || []).map(transformClass),
    isUnlimited: backendPlan.isUnlimited || false,
  };
};

// Subscription Transformations
export const transformSubscription = (backendSubscription: any): Subscription => {
  return {
    _id: backendSubscription._id,
    plan: transformSubscriptionPlan(backendSubscription.plan),
    status: backendSubscription.status,
    startDate: backendSubscription.startDate,
    endDate: backendSubscription.endDate,
    autoRenew: backendSubscription.autoRenew || false,
    nextBillingDate: backendSubscription.nextBillingDate,
    createdAt: backendSubscription.createdAt,
    updatedAt: backendSubscription.updatedAt,
  };
};

// Credit Balance Transformations
export const transformCreditBalance = (backendBalance: any): CreditBalance => {
  return {
    brand: transformBrandSummary(backendBalance.brand),
    totalCredits: backendBalance.totalCredits,
    availableCredits: backendBalance.availableCredits,
    expiredCredits: backendBalance.expiredCredits || 0,
    expiringCredits: backendBalance.expiringCredits || 0,
    nextExpiryDate: backendBalance.nextExpiryDate,
  };
};

// Payment Transformations
export const transformPayment = (backendPayment: any): Payment => {
  return {
    _id: backendPayment._id,
    type: backendPayment.type,
    amount: backendPayment.amount,
    currency: backendPayment.currency || 'USD',
    status: backendPayment.status,
    brand: transformBrandSummary(backendPayment.brand),
    plan: backendPayment.type === 'subscription' 
      ? transformSubscriptionPlan(backendPayment.plan)
      : transformCreditPlan(backendPayment.plan),
    createdAt: backendPayment.createdAt,
  };
};

// Array transformation utilities
export const transformBrandArray = (backendBrands: any[]): Brand[] => {
  return backendBrands.map(transformBrand);
};

export const transformClassArray = (backendClasses: any[]): ClassInfo[] => {
  return backendClasses.map(transformClass);
};

export const transformSessionArray = (backendSessions: any[]): Session[] => {
  return backendSessions.map(transformSession);
};

export const transformSubscriptionArray = (backendSubscriptions: any[]): Subscription[] => {
  return backendSubscriptions.map(transformSubscription);
};

export const transformCreditBalanceArray = (backendBalances: any[]): CreditBalance[] => {
  return backendBalances.map(transformCreditBalance);
};

export const transformPaymentArray = (backendPayments: any[]): Payment[] => {
  return backendPayments.map(transformPayment);
};

// Reverse transformations (frontend to backend)
export const transformProfileUpdateToBackend = (profileData: any) => {
  return {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    phone: profileData.phone,
    profilePhoto: profileData.profilePhoto,
    preferences: profileData.preferences,
  };
};

export const transformRegisterDataToBackend = (registerData: any) => {
  return {
    email: registerData.email,
    password: registerData.password,
    firstName: registerData.firstName,
    lastName: registerData.lastName,
    phone: registerData.phone,
    preferences: registerData.preferences || {
      favoriteCategories: [],
      preferredDifficulty: 'beginner',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    },
  };
};
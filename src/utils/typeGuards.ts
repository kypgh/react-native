import {
  ClientProfile,
  Brand,
  BrandSummary,
  ClassInfo,
  Session,
  SubscriptionPlan,
  CreditPlan,
  Subscription,
  CreditBalance,
  Payment,
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  PaymentIntent,
  BookingEligibility,
  CreditEligibility,
} from "../types/api";

/**
 * Type guards for runtime type validation
 * These functions help ensure data integrity when receiving API responses
 */

// Utility function to check if value is a non-null object
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// Utility function to check if value is a string
const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

// Utility function to check if value is a number
const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

// Utility function to check if value is a boolean
const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

// Auth Token Guards
export const isAuthTokens = (value: unknown): value is AuthTokens => {
  return (
    isObject(value) &&
    isString(value.accessToken) &&
    isString(value.refreshToken) &&
    isNumber(value.expiresIn)
  );
};

// Client Profile Guards
export const isClientProfile = (value: unknown): value is ClientProfile => {
  if (!isObject(value)) return false;

  const hasRequiredFields =
    isString(value._id) &&
    isString(value.email) &&
    isString(value.firstName) &&
    isString(value.lastName) &&
    isString(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt);

  if (!hasRequiredFields) return false;

  // Check preferences object
  if (value.preferences && isObject(value.preferences)) {
    const prefs = value.preferences;
    const hasValidPrefs =
      Array.isArray(prefs.favoriteCategories) &&
      (prefs.preferredDifficulty === undefined ||
        ["beginner", "intermediate", "advanced"].includes(
          prefs.preferredDifficulty as string
        )) &&
      (prefs.notifications === undefined || isObject(prefs.notifications));

    if (!hasValidPrefs) return false;

    // Check notifications if present
    if (prefs.notifications && isObject(prefs.notifications)) {
      const notifs = prefs.notifications;
      if (
        (notifs.email !== undefined && !isBoolean(notifs.email)) ||
        (notifs.sms !== undefined && !isBoolean(notifs.sms)) ||
        (notifs.push !== undefined && !isBoolean(notifs.push))
      ) {
        return false;
      }
    }
  }

  return true;
};

// Brand Guards
export const isBrandSummary = (value: unknown): value is BrandSummary => {
  return (
    isObject(value) &&
    isString(value._id) &&
    isString(value.name) &&
    isString(value.city) &&
    isString(value.state)
  );
};

export const isBrand = (value: unknown): value is Brand => {
  if (!isObject(value)) return false;

  const hasRequiredFields =
    isString(value._id) && isString(value.name) && isString(value.description);

  if (!hasRequiredFields) return false;

  // Check address object
  if (value.address && isObject(value.address)) {
    const addr = value.address;
    if (
      !isString(addr.street) ||
      !isString(addr.city) ||
      !isString(addr.state) ||
      !isString(addr.zipCode) ||
      !isString(addr.country)
    ) {
      return false;
    }
  }

  // Check contact object
  if (value.contact && isObject(value.contact)) {
    const contact = value.contact;
    if (
      (contact.phone !== undefined && !isString(contact.phone)) ||
      (contact.email !== undefined && !isString(contact.email)) ||
      (contact.website !== undefined && !isString(contact.website))
    ) {
      return false;
    }
  }

  // Check business hours array
  if (value.businessHours && !Array.isArray(value.businessHours)) {
    return false;
  }

  return true;
};

// Class Guards
export const isClassInfo = (value: unknown): value is ClassInfo => {
  if (!isObject(value)) return false;

  const hasRequiredFields =
    isString(value._id) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.category) &&
    ["beginner", "intermediate", "advanced"].includes(
      value.difficulty as string
    ) &&
    isNumber(value.slots) &&
    isNumber(value.duration) &&
    Array.isArray(value.timeBlocks) &&
    isBrandSummary(value.brand);

  return hasRequiredFields;
};

// Session Guards
export const isSession = (value: unknown): value is Session => {
  return (
    isObject(value) &&
    isString(value._id) &&
    isString(value.dateTime) &&
    isNumber(value.capacity) &&
    isNumber(value.availableSpots) &&
    isString(value.status) &&
    isClassInfo(value.class) &&
    isBrandSummary(value.brand)
  );
};

// Subscription Plan Guards
export const isSubscriptionPlan = (
  value: unknown
): value is SubscriptionPlan => {
  if (!isObject(value)) return false;

  const hasRequiredFields =
    isString(value._id) &&
    isString(value.name) &&
    isString(value.description) &&
    isNumber(value.price) &&
    isString(value.priceFormatted) &&
    isString(value.billingCycle) &&
    isBoolean(value.isUnlimited) &&
    isBoolean(value.isUnlimitedFrequency);

  if (!hasRequiredFields) return false;

  // Check frequency limit
  if (value.frequencyLimit && isObject(value.frequencyLimit)) {
    const freq = value.frequencyLimit;
    if (
      !["daily", "weekly", "monthly"].includes(freq.period as string) ||
      !isNumber(freq.limit)
    ) {
      return false;
    }
  }

  // Check included classes array
  if (value.includedClasses && !Array.isArray(value.includedClasses)) {
    return false;
  }

  return true;
};

// Credit Plan Guards
export const isCreditPlan = (value: unknown): value is CreditPlan => {
  return (
    isObject(value) &&
    isString(value._id) &&
    isString(value.name) &&
    isString(value.description) &&
    isNumber(value.price) &&
    isString(value.priceFormatted) &&
    isNumber(value.creditAmount) &&
    isNumber(value.bonusCredits) &&
    isNumber(value.totalCredits) &&
    isNumber(value.validityPeriod) &&
    isString(value.validityDescription) &&
    isNumber(value.pricePerCredit) &&
    isString(value.pricePerCreditFormatted) &&
    isBoolean(value.isUnlimited) &&
    Array.isArray(value.includedClasses)
  );
};

// Subscription Guards
export const isSubscription = (value: unknown): value is Subscription => {
  return (
    isObject(value) &&
    isString(value._id) &&
    isSubscriptionPlan(value.plan) &&
    ["active", "cancelled", "expired", "pending"].includes(
      value.status as string
    ) &&
    isString(value.startDate) &&
    isBoolean(value.autoRenew) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
};

// Credit Balance Guards
export const isCreditBalance = (value: unknown): value is CreditBalance => {
  return (
    isObject(value) &&
    isBrandSummary(value.brand) &&
    isNumber(value.totalCredits) &&
    isNumber(value.availableCredits) &&
    isNumber(value.expiredCredits) &&
    isNumber(value.expiringCredits) &&
    isString(value.nextExpiryDate)
  );
};

// Payment Guards
export const isPaymentIntent = (value: unknown): value is PaymentIntent => {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.clientSecret) &&
    isNumber(value.amount) &&
    isString(value.currency) &&
    isString(value.status)
  );
};

export const isPayment = (value: unknown): value is Payment => {
  return (
    isObject(value) &&
    isString(value._id) &&
    ["subscription", "credit"].includes(value.type as string) &&
    isNumber(value.amount) &&
    isString(value.currency) &&
    isString(value.status) &&
    isBrandSummary(value.brand) &&
    isString(value.createdAt)
  );
};

// Eligibility Guards
export const isBookingEligibility = (
  value: unknown
): value is BookingEligibility => {
  if (!isObject(value) || !isBoolean(value.eligible)) return false;

  // Optional fields validation
  if (value.reason !== undefined && !isString(value.reason)) return false;
  if (
    value.remainingBookings !== undefined &&
    !isNumber(value.remainingBookings)
  )
    return false;
  if (value.nextResetDate !== undefined && !isString(value.nextResetDate))
    return false;

  return true;
};

export const isCreditEligibility = (
  value: unknown
): value is CreditEligibility => {
  return (
    isObject(value) &&
    isBoolean(value.eligible) &&
    isNumber(value.availableCredits) &&
    isNumber(value.requiredCredits) &&
    (value.reason === undefined || isString(value.reason))
  );
};

// API Response Guards
export const isApiResponse = <T>(
  value: unknown,
  dataGuard: (data: unknown) => data is T
): value is ApiResponse<T> => {
  if (!isObject(value) || !isBoolean(value.success)) return false;

  // If success is true, data should be valid
  if (value.success && !dataGuard(value.data)) return false;

  // Optional fields validation
  if (value.message !== undefined && !isString(value.message)) return false;
  if (value.error !== undefined && !isObject(value.error)) return false;

  return true;
};

export const isPaginatedResponse = <T>(
  value: unknown,
  dataGuard: (data: unknown) => data is T
): value is PaginatedResponse<T> => {
  if (!isObject(value) || !isBoolean(value.success)) return false;

  if (!isObject(value.data)) return false;

  // Check pagination object
  if (!isObject(value.data.pagination)) return false;
  const pagination = value.data.pagination;
  if (
    !isNumber(pagination.currentPage) ||
    !isNumber(pagination.totalPages) ||
    !isNumber(pagination.totalItems) ||
    !isNumber(pagination.itemsPerPage)
  ) {
    return false;
  }

  // Check that data contains arrays that match the guard
  const dataKeys = Object.keys(value.data).filter(
    (key) => key !== "pagination"
  );
  for (const key of dataKeys) {
    const arrayData = (value.data as any)[key];
    if (Array.isArray(arrayData)) {
      if (!arrayData.every((item) => dataGuard(item))) {
        return false;
      }
    }
  }

  return true;
};

// Array Guards
export const isArrayOf = <T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] => {
  return Array.isArray(value) && value.every(itemGuard);
};

// Specific array guards
export const isBrandArray = (value: unknown): value is Brand[] =>
  isArrayOf(value, isBrand);

export const isClassInfoArray = (value: unknown): value is ClassInfo[] =>
  isArrayOf(value, isClassInfo);

export const isSessionArray = (value: unknown): value is Session[] =>
  isArrayOf(value, isSession);

export const isSubscriptionArray = (value: unknown): value is Subscription[] =>
  isArrayOf(value, isSubscription);

export const isCreditBalanceArray = (
  value: unknown
): value is CreditBalance[] => isArrayOf(value, isCreditBalance);

export const isPaymentArray = (value: unknown): value is Payment[] =>
  isArrayOf(value, isPayment);

// Validation helper function
export const validateApiData = <T>(
  data: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string = "Invalid data format"
): T => {
  if (!guard(data)) {
    throw new Error(`${errorMessage}: ${JSON.stringify(data)}`);
  }
  return data;
};

// Safe parsing with fallback
export const safeParseApiData = <T>(
  data: unknown,
  guard: (value: unknown) => value is T,
  fallback: T
): T => {
  try {
    return validateApiData(data, guard);
  } catch {
    return fallback;
  }
};

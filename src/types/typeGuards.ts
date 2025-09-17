import {
  ClientProfile,
  Brand,
  ClassInfo,
  Session,
  Subscription,
  CreditBalance,
  Payment,
  BrandSummary,
  TimeBlock,
  FrequencyLimit,
  SubscriptionPlan,
  CreditPlan,
  AuthTokens,
  AuthResponse,
  BrandDetailsResponse,
  SubscriptionPlansResponse,
  CreditPlansResponse,
  PaymentIntent,
  PaymentIntentResponse,
  PaymentConfirmationResponse,
  Pagination,
  ApiResponse,
  PaginatedResponse,
  BrandsResponse,
  ClassesResponse,
  SessionsResponse,
  SubscriptionsResponse,
  PaymentsResponse,
  CreditBalancesResponse,
  CreditTransactionsResponse,
  ExpiringCreditsResponse,
  CreditTransaction,
  ExpiringCredit,
  Address,
  Contact,
  BusinessHour,
  ApiError,
  ApiErrorType,
  BookingEligibility,
  CreditEligibility
} from './api';

/**
 * Type guards for runtime type validation of API responses
 */
export class TypeGuards {
  /**
   * Check if value is a string
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * Check if value is a number
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Check if value is a boolean
   */
  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  /**
   * Check if value is an object (not null or array)
   */
  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Check if value is an array
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Check if value is a valid ISO date string
   */
  static isISODateString(value: unknown): value is string {
    if (!this.isString(value)) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && value === date.toISOString();
  }

  /**
   * Check if value is a valid difficulty level
   */
  static isDifficultyLevel(value: unknown): value is 'beginner' | 'intermediate' | 'advanced' {
    return this.isString(value) && ['beginner', 'intermediate', 'advanced'].includes(value);
  }

  /**
   * Check if value is a valid subscription status
   */
  static isSubscriptionStatus(value: unknown): value is 'active' | 'cancelled' | 'expired' | 'pending' {
    return this.isString(value) && ['active', 'cancelled', 'expired', 'pending'].includes(value);
  }

  /**
   * Check if value is a valid client status
   */
  static isClientStatus(value: unknown): value is 'active' | 'inactive' {
    return this.isString(value) && ['active', 'inactive'].includes(value);
  }

  /**
   * Check if value is a valid payment type
   */
  static isPaymentType(value: unknown): value is 'subscription' | 'credit' {
    return this.isString(value) && ['subscription', 'credit'].includes(value);
  }

  /**
   * Check if value is a valid credit transaction type
   */
  static isCreditTransactionType(value: unknown): value is 'purchase' | 'usage' | 'expiry' | 'bonus' {
    return this.isString(value) && ['purchase', 'usage', 'expiry', 'bonus'].includes(value);
  }

  /**
   * Check if value is a valid frequency period
   */
  static isFrequencyPeriod(value: unknown): value is 'daily' | 'weekly' | 'monthly' {
    return this.isString(value) && ['daily', 'weekly', 'monthly'].includes(value);
  }

  /**
   * Check if value is a valid API error type
   */
  static isApiErrorType(value: unknown): value is ApiErrorType {
    return this.isString(value) && Object.values(ApiErrorType).includes(value as ApiErrorType);
  }

  /**
   * Type guard for Address
   */
  static isAddress(value: unknown): value is Address {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value.street) &&
      this.isString(value.city) &&
      this.isString(value.state) &&
      this.isString(value.zipCode) &&
      this.isString(value.country)
    );
  }

  /**
   * Type guard for Contact
   */
  static isContact(value: unknown): value is Contact {
    if (!this.isObject(value)) return false;
    return (
      (value.phone === undefined || this.isString(value.phone)) &&
      (value.email === undefined || this.isString(value.email)) &&
      (value.website === undefined || this.isString(value.website))
    );
  }

  /**
   * Type guard for BusinessHour
   */
  static isBusinessHour(value: unknown): value is BusinessHour {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value.day) &&
      this.isString(value.openTime) &&
      this.isString(value.closeTime) &&
      this.isBoolean(value.isClosed)
    );
  }

  /**
   * Type guard for TimeBlock
   */
  static isTimeBlock(value: unknown): value is TimeBlock {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value.startTime) &&
      this.isString(value.endTime) &&
      this.isArray(value.days) &&
      (value.days as unknown[]).every(day => this.isString(day))
    );
  }

  /**
   * Type guard for FrequencyLimit
   */
  static isFrequencyLimit(value: unknown): value is FrequencyLimit {
    if (!this.isObject(value)) return false;
    return (
      this.isFrequencyPeriod(value.period) &&
      this.isNumber(value.limit)
    );
  }

  /**
   * Type guard for BrandSummary
   */
  static isBrandSummary(value: unknown): value is BrandSummary {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isString(value.name) &&
      (value.logo === undefined || this.isString(value.logo)) &&
      this.isString(value.city) &&
      this.isString(value.state)
    );
  }

  /**
   * Type guard for Brand
   */
  static isBrand(value: unknown): value is Brand {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isString(value.name) &&
      this.isString(value.description) &&
      (value.logo === undefined || this.isString(value.logo)) &&
      this.isAddress(value.address) &&
      this.isContact(value.contact) &&
      this.isArray(value.businessHours) &&
      (value.businessHours as unknown[]).every(hour => this.isBusinessHour(hour))
    );
  }

  /**
   * Type guard for ClassInfo
   */
  static isClassInfo(value: unknown): value is ClassInfo {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isString(value.name) &&
      this.isString(value.description) &&
      this.isString(value.category) &&
      this.isDifficultyLevel(value.difficulty) &&
      this.isNumber(value.slots) &&
      this.isNumber(value.duration) &&
      this.isArray(value.timeBlocks) &&
      (value.timeBlocks as unknown[]).every(block => this.isTimeBlock(block)) &&
      this.isBrandSummary(value.brand) &&
      (value.cancellationPolicy === undefined || this.isNumber(value.cancellationPolicy))
    );
  }

  /**
   * Type guard for Session
   */
  static isSession(value: unknown): value is Session {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isISODateString(value.dateTime) &&
      this.isNumber(value.capacity) &&
      this.isNumber(value.availableSpots) &&
      this.isString(value.status) &&
      this.isClassInfo(value.class) &&
      this.isBrandSummary(value.brand)
    );
  }

  /**
   * Type guard for SubscriptionPlan
   */
  static isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isString(value.name) &&
      this.isString(value.description) &&
      this.isNumber(value.price) &&
      this.isString(value.priceFormatted) &&
      this.isString(value.billingCycle) &&
      this.isFrequencyLimit(value.frequencyLimit) &&
      this.isArray(value.includedClasses) &&
      (value.includedClasses as unknown[]).every(cls => this.isClassInfo(cls)) &&
      this.isBoolean(value.isUnlimited) &&
      this.isBoolean(value.isUnlimitedFrequency)
    );
  }

  /**
   * Type guard for CreditPlan
   */
  static isCreditPlan(value: unknown): value is CreditPlan {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isString(value.name) &&
      this.isString(value.description) &&
      this.isNumber(value.price) &&
      this.isString(value.priceFormatted) &&
      this.isNumber(value.creditAmount) &&
      this.isNumber(value.bonusCredits) &&
      this.isNumber(value.totalCredits) &&
      this.isNumber(value.validityPeriod) &&
      this.isString(value.validityDescription) &&
      this.isNumber(value.pricePerCredit) &&
      this.isString(value.pricePerCreditFormatted) &&
      this.isArray(value.includedClasses) &&
      (value.includedClasses as unknown[]).every(cls => this.isClassInfo(cls)) &&
      this.isBoolean(value.isUnlimited)
    );
  }

  /**
   * Type guard for Subscription
   */
  static isSubscription(value: unknown): value is Subscription {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isSubscriptionPlan(value.plan) &&
      this.isSubscriptionStatus(value.status) &&
      this.isISODateString(value.startDate) &&
      (value.endDate === undefined || this.isISODateString(value.endDate)) &&
      this.isBoolean(value.autoRenew) &&
      (value.nextBillingDate === undefined || this.isISODateString(value.nextBillingDate)) &&
      this.isISODateString(value.createdAt) &&
      this.isISODateString(value.updatedAt)
    );
  }

  /**
   * Type guard for CreditBalance
   */
  static isCreditBalance(value: unknown): value is CreditBalance {
    if (!this.isObject(value)) return false;
    return (
      this.isBrandSummary(value.brand) &&
      this.isNumber(value.totalCredits) &&
      this.isNumber(value.availableCredits) &&
      this.isNumber(value.expiredCredits) &&
      this.isNumber(value.expiringCredits) &&
      this.isISODateString(value.nextExpiryDate)
    );
  }

  /**
   * Type guard for CreditTransaction
   */
  static isCreditTransaction(value: unknown): value is CreditTransaction {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isCreditTransactionType(value.type) &&
      this.isNumber(value.amount) &&
      this.isString(value.description) &&
      this.isISODateString(value.createdAt) &&
      this.isISODateString(value.expiresAt)
    );
  }

  /**
   * Type guard for ExpiringCredit
   */
  static isExpiringCredit(value: unknown): value is ExpiringCredit {
    if (!this.isObject(value)) return false;
    return (
      this.isBrandSummary(value.brand) &&
      this.isNumber(value.credits) &&
      this.isISODateString(value.expiryDate) &&
      this.isNumber(value.daysUntilExpiry)
    );
  }

  /**
   * Type guard for Payment
   */
  static isPayment(value: unknown): value is Payment {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value._id) &&
      this.isPaymentType(value.type) &&
      this.isNumber(value.amount) &&
      this.isString(value.currency) &&
      this.isString(value.status) &&
      this.isBrandSummary(value.brand) &&
      (this.isSubscriptionPlan(value.plan) || this.isCreditPlan(value.plan)) &&
      this.isISODateString(value.createdAt)
    );
  }

  /**
   * Type guard for PaymentIntent
   */
  static isPaymentIntent(value: unknown): value is PaymentIntent {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value.id) &&
      this.isString(value.clientSecret) &&
      this.isNumber(value.amount) &&
      this.isString(value.currency) &&
      this.isString(value.status)
    );
  }

  /**
   * Type guard for AuthTokens
   */
  static isAuthTokens(value: unknown): value is AuthTokens {
    if (!this.isObject(value)) return false;
    return (
      this.isString(value.accessToken) &&
      this.isString(value.refreshToken) &&
      this.isNumber(value.expiresIn)
    );
  }

  /**
   * Type guard for ClientProfile
   */
  static isClientProfile(value: unknown): value is ClientProfile {
    if (!this.isObject(value)) return false;
    const preferences = value.preferences;
    if (!this.isObject(preferences)) return false;
    const notifications = preferences.notifications;
    if (!this.isObject(notifications)) return false;

    return (
      this.isString(value._id) &&
      this.isString(value.email) &&
      this.isString(value.firstName) &&
      this.isString(value.lastName) &&
      (value.phone === undefined || this.isString(value.phone)) &&
      (value.profilePhoto === undefined || this.isString(value.profilePhoto)) &&
      this.isArray(preferences.favoriteCategories) &&
      (preferences.favoriteCategories as unknown[]).every(cat => this.isString(cat)) &&
      this.isDifficultyLevel(preferences.preferredDifficulty) &&
      this.isBoolean(notifications.email) &&
      this.isBoolean(notifications.sms) &&
      this.isBoolean(notifications.push) &&
      (preferences.timezone === undefined || this.isString(preferences.timezone)) &&
      this.isClientStatus(value.status) &&
      this.isISODateString(value.createdAt) &&
      this.isISODateString(value.updatedAt)
    );
  }

  /**
   * Type guard for Pagination
   */
  static isPagination(value: unknown): value is Pagination {
    if (!this.isObject(value)) return false;
    return (
      this.isNumber(value.currentPage) &&
      this.isNumber(value.totalPages) &&
      this.isNumber(value.totalItems) &&
      this.isNumber(value.itemsPerPage)
    );
  }

  /**
   * Type guard for ApiError
   */
  static isApiError(value: unknown): value is ApiError {
    if (!this.isObject(value)) return false;
    return (
      this.isApiErrorType(value.type) &&
      this.isString(value.message) &&
      (value.code === undefined || this.isString(value.code)) &&
      (value.statusCode === undefined || this.isNumber(value.statusCode)) &&
      (value.details === undefined || this.isObject(value.details))
    );
  }

  /**
   * Type guard for BookingEligibility
   */
  static isBookingEligibility(value: unknown): value is BookingEligibility {
    if (!this.isObject(value)) return false;
    return (
      this.isBoolean(value.eligible) &&
      (value.reason === undefined || this.isString(value.reason)) &&
      (value.remainingBookings === undefined || this.isNumber(value.remainingBookings)) &&
      (value.nextResetDate === undefined || this.isISODateString(value.nextResetDate))
    );
  }

  /**
   * Type guard for CreditEligibility
   */
  static isCreditEligibility(value: unknown): value is CreditEligibility {
    if (!this.isObject(value)) return false;
    return (
      this.isBoolean(value.eligible) &&
      this.isNumber(value.availableCredits) &&
      this.isNumber(value.requiredCredits) &&
      (value.reason === undefined || this.isString(value.reason))
    );
  }

  /**
   * Generic type guard for ApiResponse
   */
  static isApiResponse<T>(
    value: unknown,
    dataGuard: (data: unknown) => data is T
  ): value is ApiResponse<T> {
    if (!this.isObject(value)) return false;
    return (
      this.isBoolean(value.success) &&
      dataGuard(value.data) &&
      (value.message === undefined || this.isString(value.message)) &&
      (value.error === undefined || this.isApiError(value.error))
    );
  }

  /**
   * Generic type guard for PaginatedResponse
   */
  static isPaginatedResponse<T>(
    value: unknown,
    dataGuard: (data: unknown) => data is T
  ): value is PaginatedResponse<T> {
    if (!this.isObject(value)) return false;
    if (!this.isBoolean(value.success)) return false;
    if (!this.isObject(value.data)) return false;
    
    const data = value.data as Record<string, unknown>;
    if (!this.isPagination(data.pagination)) return false;
    
    // Create a copy of data without pagination for validation
    const { pagination, ...dataWithoutPagination } = data;
    return dataGuard(dataWithoutPagination);
  }

  /**
   * Type guard for AuthResponse
   */
  static isAuthResponse(value: unknown): value is AuthResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isClientProfile(value.client) &&
      this.isAuthTokens(value.tokens)
    );
  }

  /**
   * Type guard for BrandDetailsResponse
   */
  static isBrandDetailsResponse(value: unknown): value is BrandDetailsResponse {
    if (!this.isObject(value)) return false;
    const stats = value.stats;
    if (!this.isObject(stats)) return false;
    const difficultyDistribution = stats.difficultyDistribution;
    if (!this.isObject(difficultyDistribution)) return false;

    return (
      this.isBrand(value.brand) &&
      this.isArray(value.classes) &&
      (value.classes as unknown[]).every(cls => this.isClassInfo(cls)) &&
      this.isNumber(stats.totalClasses) &&
      this.isNumber(stats.uniqueCategories) &&
      this.isNumber(difficultyDistribution.beginner) &&
      this.isNumber(difficultyDistribution.intermediate) &&
      this.isNumber(difficultyDistribution.advanced)
    );
  }

  /**
   * Type guard for SubscriptionPlansResponse
   */
  static isSubscriptionPlansResponse(value: unknown): value is SubscriptionPlansResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isBrandSummary(value.brand) &&
      this.isArray(value.subscriptionPlans) &&
      (value.subscriptionPlans as unknown[]).every(plan => this.isSubscriptionPlan(plan))
    );
  }

  /**
   * Type guard for CreditPlansResponse
   */
  static isCreditPlansResponse(value: unknown): value is CreditPlansResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isBrandSummary(value.brand) &&
      this.isArray(value.creditPlans) &&
      (value.creditPlans as unknown[]).every(plan => this.isCreditPlan(plan))
    );
  }

  /**
   * Type guard for PaymentIntentResponse
   */
  static isPaymentIntentResponse(value: unknown): value is PaymentIntentResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isPaymentIntent(value.paymentIntent) &&
      (value.subscriptionPlan === undefined || this.isSubscriptionPlan(value.subscriptionPlan)) &&
      (value.creditPlan === undefined || this.isCreditPlan(value.creditPlan))
    );
  }

  /**
   * Type guard for PaymentConfirmationResponse
   */
  static isPaymentConfirmationResponse(value: unknown): value is PaymentConfirmationResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isPayment(value.payment) &&
      (value.subscription === undefined || this.isSubscription(value.subscription)) &&
      (value.credits === undefined || this.isCreditBalance(value.credits))
    );
  }

  // Paginated response type guards
  static isBrandsResponse(value: unknown): value is BrandsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.brands) &&
      (value.brands as unknown[]).every(brand => this.isBrand(brand)) &&
      this.isPagination(value.pagination)
    );
  }

  static isClassesResponse(value: unknown): value is ClassesResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.classes) &&
      (value.classes as unknown[]).every(cls => this.isClassInfo(cls)) &&
      this.isPagination(value.pagination)
    );
  }

  static isSessionsResponse(value: unknown): value is SessionsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.sessions) &&
      (value.sessions as unknown[]).every(session => this.isSession(session)) &&
      this.isPagination(value.pagination)
    );
  }

  static isSubscriptionsResponse(value: unknown): value is SubscriptionsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.subscriptions) &&
      (value.subscriptions as unknown[]).every(sub => this.isSubscription(sub)) &&
      this.isPagination(value.pagination)
    );
  }

  static isPaymentsResponse(value: unknown): value is PaymentsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.payments) &&
      (value.payments as unknown[]).every(payment => this.isPayment(payment)) &&
      this.isPagination(value.pagination)
    );
  }

  static isCreditBalancesResponse(value: unknown): value is CreditBalancesResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.balances) &&
      (value.balances as unknown[]).every(balance => this.isCreditBalance(balance))
    );
  }

  static isCreditTransactionsResponse(value: unknown): value is CreditTransactionsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.transactions) &&
      (value.transactions as unknown[]).every(transaction => this.isCreditTransaction(transaction))
    );
  }

  static isExpiringCreditsResponse(value: unknown): value is ExpiringCreditsResponse {
    if (!this.isObject(value)) return false;
    return (
      this.isArray(value.expiringCredits) &&
      (value.expiringCredits as unknown[]).every(credit => this.isExpiringCredit(credit))
    );
  }
}
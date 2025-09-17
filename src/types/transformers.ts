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
  BusinessHour
} from './api';

/**
 * Data transformation utilities for converting backend API responses
 * to frontend-compatible formats
 */
export class DataTransformer {
  /**
   * Transform backend client profile to frontend ClientProfile
   */
  static transformClientProfile(backendClient: any): ClientProfile {
    return {
      _id: backendClient._id,
      email: backendClient.email,
      firstName: backendClient.firstName,
      lastName: backendClient.lastName,
      phone: backendClient.phone || undefined,
      profilePhoto: backendClient.profilePhoto || undefined,
      preferences: {
        favoriteCategories: backendClient.preferences?.favoriteCategories || [],
        preferredDifficulty: backendClient.preferences?.preferredDifficulty || 'beginner',
        notifications: {
          email: backendClient.preferences?.notifications?.email ?? true,
          sms: backendClient.preferences?.notifications?.sms ?? false,
          push: backendClient.preferences?.notifications?.push ?? true,
        },
        timezone: backendClient.preferences?.timezone || undefined,
      },
      status: backendClient.status || 'active',
      createdAt: backendClient.createdAt,
      updatedAt: backendClient.updatedAt,
    };
  }

  /**
   * Transform backend brand to frontend Brand
   */
  static transformBrand(backendBrand: any): Brand {
    return {
      _id: backendBrand._id,
      name: backendBrand.name,
      description: backendBrand.description,
      logo: backendBrand.logo || undefined,
      address: this.transformAddress(backendBrand.address),
      contact: this.transformContact(backendBrand.contact),
      businessHours: backendBrand.businessHours?.map(this.transformBusinessHour) || [],
    };
  }

  /**
   * Transform backend brand summary to frontend BrandSummary
   */
  static transformBrandSummary(backendBrandSummary: any): BrandSummary {
    return {
      _id: backendBrandSummary._id,
      name: backendBrandSummary.name,
      logo: backendBrandSummary.logo || undefined,
      city: backendBrandSummary.city,
      state: backendBrandSummary.state,
    };
  }

  /**
   * Transform backend class to frontend ClassInfo
   */
  static transformClass(backendClass: any): ClassInfo {
    return {
      _id: backendClass._id,
      name: backendClass.name,
      description: backendClass.description,
      category: backendClass.category,
      difficulty: backendClass.difficulty,
      slots: backendClass.slots,
      duration: backendClass.duration,
      timeBlocks: backendClass.timeBlocks?.map(this.transformTimeBlock) || [],
      brand: this.transformBrandSummary(backendClass.brand),
      cancellationPolicy: backendClass.cancellationPolicy || undefined,
    };
  }

  /**
   * Transform backend session to frontend Session
   */
  static transformSession(backendSession: any): Session {
    return {
      _id: backendSession._id,
      dateTime: backendSession.dateTime,
      capacity: backendSession.capacity,
      availableSpots: backendSession.availableSpots,
      status: backendSession.status,
      class: this.transformClass(backendSession.class),
      brand: this.transformBrandSummary(backendSession.brand),
    };
  }

  /**
   * Transform backend subscription to frontend Subscription
   */
  static transformSubscription(backendSubscription: any): Subscription {
    return {
      _id: backendSubscription._id,
      plan: this.transformSubscriptionPlan(backendSubscription.plan),
      status: backendSubscription.status,
      startDate: backendSubscription.startDate,
      endDate: backendSubscription.endDate || undefined,
      autoRenew: backendSubscription.autoRenew,
      nextBillingDate: backendSubscription.nextBillingDate || undefined,
      createdAt: backendSubscription.createdAt,
      updatedAt: backendSubscription.updatedAt,
    };
  }

  /**
   * Transform backend subscription plan to frontend SubscriptionPlan
   */
  static transformSubscriptionPlan(backendPlan: any): SubscriptionPlan {
    return {
      _id: backendPlan._id,
      name: backendPlan.name,
      description: backendPlan.description,
      price: backendPlan.price,
      priceFormatted: backendPlan.priceFormatted,
      billingCycle: backendPlan.billingCycle,
      frequencyLimit: this.transformFrequencyLimit(backendPlan.frequencyLimit),
      includedClasses: backendPlan.includedClasses?.map(this.transformClass) || [],
      isUnlimited: backendPlan.isUnlimited,
      isUnlimitedFrequency: backendPlan.isUnlimitedFrequency,
    };
  }

  /**
   * Transform backend credit plan to frontend CreditPlan
   */
  static transformCreditPlan(backendPlan: any): CreditPlan {
    return {
      _id: backendPlan._id,
      name: backendPlan.name,
      description: backendPlan.description,
      price: backendPlan.price,
      priceFormatted: backendPlan.priceFormatted,
      creditAmount: backendPlan.creditAmount,
      bonusCredits: backendPlan.bonusCredits,
      totalCredits: backendPlan.totalCredits,
      validityPeriod: backendPlan.validityPeriod,
      validityDescription: backendPlan.validityDescription,
      pricePerCredit: backendPlan.pricePerCredit,
      pricePerCreditFormatted: backendPlan.pricePerCreditFormatted,
      includedClasses: backendPlan.includedClasses?.map(this.transformClass) || [],
      isUnlimited: backendPlan.isUnlimited,
    };
  }

  /**
   * Transform backend credit balance to frontend CreditBalance
   */
  static transformCreditBalance(backendBalance: any): CreditBalance {
    return {
      brand: this.transformBrandSummary(backendBalance.brand),
      totalCredits: backendBalance.totalCredits,
      availableCredits: backendBalance.availableCredits,
      expiredCredits: backendBalance.expiredCredits,
      expiringCredits: backendBalance.expiringCredits,
      nextExpiryDate: backendBalance.nextExpiryDate,
    };
  }

  /**
   * Transform backend credit transaction to frontend CreditTransaction
   */
  static transformCreditTransaction(backendTransaction: any): CreditTransaction {
    return {
      _id: backendTransaction._id,
      type: backendTransaction.type,
      amount: backendTransaction.amount,
      description: backendTransaction.description,
      createdAt: backendTransaction.createdAt,
      expiresAt: backendTransaction.expiresAt,
    };
  }

  /**
   * Transform backend expiring credit to frontend ExpiringCredit
   */
  static transformExpiringCredit(backendCredit: any): ExpiringCredit {
    return {
      brand: this.transformBrandSummary(backendCredit.brand),
      credits: backendCredit.credits,
      expiryDate: backendCredit.expiryDate,
      daysUntilExpiry: backendCredit.daysUntilExpiry,
    };
  }

  /**
   * Transform backend payment to frontend Payment
   */
  static transformPayment(backendPayment: any): Payment {
    return {
      _id: backendPayment._id,
      type: backendPayment.type,
      amount: backendPayment.amount,
      currency: backendPayment.currency,
      status: backendPayment.status,
      brand: this.transformBrandSummary(backendPayment.brand),
      plan: backendPayment.type === 'subscription' 
        ? this.transformSubscriptionPlan(backendPayment.plan)
        : this.transformCreditPlan(backendPayment.plan),
      createdAt: backendPayment.createdAt,
    };
  }

  /**
   * Transform backend payment intent to frontend PaymentIntent
   */
  static transformPaymentIntent(backendIntent: any): PaymentIntent {
    return {
      id: backendIntent.id,
      clientSecret: backendIntent.clientSecret,
      amount: backendIntent.amount,
      currency: backendIntent.currency,
      status: backendIntent.status,
    };
  }

  /**
   * Transform backend auth tokens to frontend AuthTokens
   */
  static transformAuthTokens(backendTokens: any): AuthTokens {
    return {
      accessToken: backendTokens.accessToken,
      refreshToken: backendTokens.refreshToken,
      expiresIn: backendTokens.expiresIn,
    };
  }

  /**
   * Transform backend pagination to frontend Pagination
   */
  static transformPagination(backendPagination: any): Pagination {
    return {
      currentPage: backendPagination.currentPage || backendPagination.page || 1,
      totalPages: backendPagination.totalPages,
      totalItems: backendPagination.totalItems || backendPagination.total,
      itemsPerPage: backendPagination.itemsPerPage || backendPagination.limit,
    };
  }

  // Helper transformation methods
  private static transformAddress(backendAddress: any): Address {
    return {
      street: backendAddress.street,
      city: backendAddress.city,
      state: backendAddress.state,
      zipCode: backendAddress.zipCode,
      country: backendAddress.country,
    };
  }

  private static transformContact(backendContact: any): Contact {
    return {
      phone: backendContact.phone || undefined,
      email: backendContact.email || undefined,
      website: backendContact.website || undefined,
    };
  }

  private static transformBusinessHour(backendHour: any): BusinessHour {
    return {
      day: backendHour.day,
      openTime: backendHour.openTime,
      closeTime: backendHour.closeTime,
      isClosed: backendHour.isClosed,
    };
  }

  private static transformTimeBlock(backendBlock: any): TimeBlock {
    return {
      startTime: backendBlock.startTime,
      endTime: backendBlock.endTime,
      days: backendBlock.days,
    };
  }

  private static transformFrequencyLimit(backendLimit: any): FrequencyLimit {
    return {
      period: backendLimit.period,
      limit: backendLimit.limit,
    };
  }

  // Complex response transformers
  static transformAuthResponse(backendResponse: any): AuthResponse {
    return {
      client: this.transformClientProfile(backendResponse.client),
      tokens: this.transformAuthTokens(backendResponse.tokens),
    };
  }

  static transformBrandDetailsResponse(backendResponse: any): BrandDetailsResponse {
    return {
      brand: this.transformBrand(backendResponse.brand),
      classes: backendResponse.classes?.map(this.transformClass) || [],
      stats: {
        totalClasses: backendResponse.stats?.totalClasses || 0,
        uniqueCategories: backendResponse.stats?.uniqueCategories || 0,
        difficultyDistribution: {
          beginner: backendResponse.stats?.difficultyDistribution?.beginner || 0,
          intermediate: backendResponse.stats?.difficultyDistribution?.intermediate || 0,
          advanced: backendResponse.stats?.difficultyDistribution?.advanced || 0,
        },
      },
    };
  }

  static transformSubscriptionPlansResponse(backendResponse: any): SubscriptionPlansResponse {
    return {
      brand: this.transformBrandSummary(backendResponse.brand),
      subscriptionPlans: backendResponse.subscriptionPlans?.map(this.transformSubscriptionPlan) || [],
    };
  }

  static transformCreditPlansResponse(backendResponse: any): CreditPlansResponse {
    return {
      brand: this.transformBrandSummary(backendResponse.brand),
      creditPlans: backendResponse.creditPlans?.map(this.transformCreditPlan) || [],
    };
  }

  static transformPaymentIntentResponse(backendResponse: any): PaymentIntentResponse {
    return {
      paymentIntent: this.transformPaymentIntent(backendResponse.paymentIntent),
      subscriptionPlan: backendResponse.subscriptionPlan 
        ? this.transformSubscriptionPlan(backendResponse.subscriptionPlan)
        : undefined,
      creditPlan: backendResponse.creditPlan 
        ? this.transformCreditPlan(backendResponse.creditPlan)
        : undefined,
    };
  }

  static transformPaymentConfirmationResponse(backendResponse: any): PaymentConfirmationResponse {
    return {
      payment: this.transformPayment(backendResponse.payment),
      subscription: backendResponse.subscription 
        ? this.transformSubscription(backendResponse.subscription)
        : undefined,
      credits: backendResponse.credits 
        ? this.transformCreditBalance(backendResponse.credits)
        : undefined,
    };
  }

  // Paginated response transformers
  static transformBrandsResponse(backendResponse: any): BrandsResponse {
    return {
      brands: backendResponse.brands?.map(this.transformBrand) || [],
      pagination: this.transformPagination(backendResponse.pagination),
    };
  }

  static transformClassesResponse(backendResponse: any): ClassesResponse {
    return {
      classes: backendResponse.classes?.map(this.transformClass) || [],
      pagination: this.transformPagination(backendResponse.pagination),
    };
  }

  static transformSessionsResponse(backendResponse: any): SessionsResponse {
    return {
      sessions: backendResponse.sessions?.map(this.transformSession) || [],
      pagination: this.transformPagination(backendResponse.pagination),
    };
  }

  static transformSubscriptionsResponse(backendResponse: any): SubscriptionsResponse {
    return {
      subscriptions: backendResponse.subscriptions?.map(this.transformSubscription) || [],
      pagination: this.transformPagination(backendResponse.pagination),
    };
  }

  static transformPaymentsResponse(backendResponse: any): PaymentsResponse {
    return {
      payments: backendResponse.payments?.map(this.transformPayment) || [],
      pagination: this.transformPagination(backendResponse.pagination),
    };
  }

  static transformCreditBalancesResponse(backendResponse: any): CreditBalancesResponse {
    return {
      balances: backendResponse.balances?.map(this.transformCreditBalance) || [],
    };
  }

  static transformCreditTransactionsResponse(backendResponse: any): CreditTransactionsResponse {
    return {
      transactions: backendResponse.transactions?.map(this.transformCreditTransaction) || [],
    };
  }

  static transformExpiringCreditsResponse(backendResponse: any): ExpiringCreditsResponse {
    return {
      expiringCredits: backendResponse.expiringCredits?.map(this.transformExpiringCredit) || [],
    };
  }
}
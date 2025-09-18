import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { PaymentPlansScreenProps } from "../types";
import { useTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Card, Button, ErrorDisplay } from "../components/common";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useCredits } from "../hooks/useCredits";
import { subscriptionService } from "../services/api/subscriptionService";
import { creditService } from "../services/api/creditService";
import { useBrandId } from "../contexts/BrandContext";
import { usePaymentSheetFlow } from "../hooks/usePaymentSheet";
import {
  SubscriptionPlan,
  CreditPlan as ApiCreditPlan,
  Subscription,
  ApiError,
  CreditBalance,
} from "../types/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

export default function PaymentPlansScreen({}: PaymentPlansScreenProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const brandId = useBrandId();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Hooks
  const {
    activeSubscriptions,
    subscriptionPlans,
    isLoading: isLoadingSubscriptions,
    isPurchasing: isPurchasingSubscription,
    purchaseError: subscriptionPurchaseError,
    fetchActiveSubscriptions,
    fetchSubscriptionPlans,
    cancelSubscription,
    clearPurchaseError: clearSubscriptionPurchaseError,
  } = useSubscriptions();

  const {
    creditPlans,
    creditBalances,
    isLoadingPlans: isLoadingCreditPlans,
    isPurchasing: isPurchasingCredits,
    purchaseError: creditPurchaseError,
    fetchCreditPlans,
    fetchCreditBalances,
    clearPurchaseError: clearCreditPurchaseError,
  } = useCredits();

  // PaymentSheet hook
  const { processPayment, isLoading: isPaymentLoading } = usePaymentSheetFlow();

  // Load initial data when brandId is available
  useEffect(() => {
    if (brandId) {
      loadInitialData();
    }
  }, [brandId]);

  const loadInitialData = async () => {
    if (!brandId) return;

    setError(null);

    try {
      await Promise.all([
        fetchActiveSubscriptions(),
        fetchCreditBalances(),
        fetchSubscriptionPlans(brandId),
        fetchCreditPlans(brandId),
      ]);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handlePurchaseSubscription = async (plan: SubscriptionPlan) => {
    try {
      clearSubscriptionPurchaseError();

      // Step 1: Create payment intent (get clientSecret only)
      const response =
        await subscriptionService.createSubscriptionPaymentIntent(plan._id);

      console.log(
        "Subscription payment intent response:",
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data?.paymentIntent?.clientSecret) {
        // Step 2: Use PaymentSheet to collect payment
        const paymentResult = await processPayment(
          response.data.paymentIntent.clientSecret,
          "Fitness Booking App"
        );

        if (paymentResult.success) {
          Alert.alert("Success!", `You've subscribed to ${plan.name}`, [
            { text: "OK" },
          ]);
          await loadInitialData();
        } else if (
          paymentResult.error &&
          paymentResult.error !== "Payment cancelled"
        ) {
          Alert.alert("Payment Failed", paymentResult.error, [{ text: "OK" }]);
        }
      } else if (subscriptionPurchaseError) {
        Alert.alert(
          "Purchase Failed",
          subscriptionPurchaseError.message || "Please try again",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const handlePurchaseCredits = async (plan: ApiCreditPlan) => {
    try {
      clearCreditPurchaseError();

      // Step 1: Create payment intent (get clientSecret only)
      const response = await creditService.createCreditPaymentIntent(plan._id);

      console.log(
        "Credit payment intent response:",
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data?.paymentIntent?.clientSecret) {
        // Step 2: Use PaymentSheet to collect payment
        const paymentResult = await processPayment(
          response.data.paymentIntent.clientSecret,
          "Fitness Booking App"
        );

        if (paymentResult.success) {
          Alert.alert(
            "Success!",
            `You've purchased ${plan.totalCredits} credits`,
            [{ text: "OK" }]
          );
          await loadInitialData();
        } else if (
          paymentResult.error &&
          paymentResult.error !== "Payment cancelled"
        ) {
          Alert.alert("Payment Failed", paymentResult.error, [{ text: "OK" }]);
        }
      } else if (creditPurchaseError) {
        Alert.alert(
          "Purchase Failed",
          creditPurchaseError.message || "Please try again",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    Alert.alert("Cancel Subscription", `Cancel ${subscription.plan.name}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          const success = await cancelSubscription(
            subscription._id,
            "User requested cancellation"
          );
          if (success) {
            Alert.alert("Cancelled", "Your subscription has been cancelled.", [
              { text: "OK" },
            ]);
          } else {
            Alert.alert("Error", "Failed to cancel subscription.", [
              { text: "OK" },
            ]);
          }
        },
      },
    ]);
  };

  const isLoading = isLoadingSubscriptions || isLoadingCreditPlans;

  // Show loading state if no brandId or if loading
  if (!brandId || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading plans...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <ErrorDisplay
          error={error}
          onRetry={loadInitialData}
          style={styles.errorContainer}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status Overview */}
        <View style={styles.statusOverview}>
          <View style={styles.statusRow}>
            {/* Active Subscriptions Summary */}
            <View
              style={[styles.statusCard, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[styles.statusLabel, { color: colors.text.secondary }]}
              >
                Active Plans
              </Text>
              <Text style={[styles.statusValue, { color: colors.primary }]}>
                {activeSubscriptions.length}
              </Text>
            </View>

            {/* Total Credits Summary */}
            <View
              style={[styles.statusCard, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[styles.statusLabel, { color: colors.text.secondary }]}
              >
                Total Credits
              </Text>
              <Text
                style={[styles.statusValue, { color: colors.status.confirmed }]}
              >
                {creditBalances.reduce(
                  (total, balance) => total + balance.availableCredits,
                  0
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* My Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Active Subscriptions
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {activeSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription._id}
                  subscription={subscription}
                  onCancel={handleCancelSubscription}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Credit Balance */}
        {creditBalances.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Credit Balance
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {creditBalances.map((balance) => (
                <CreditBalanceCard key={balance.brand._id} balance={balance} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Subscription Plans */}
        {subscriptionPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Subscription Plans
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {subscriptionPlans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan._id}
                  plan={plan}
                  onPurchase={handlePurchaseSubscription}
                  isPurchasing={isPurchasingSubscription || isPaymentLoading}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Credit Plans */}
        {creditPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Credit Plans
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {creditPlans.map((plan) => (
                <CreditPlanCard
                  key={plan._id}
                  plan={plan}
                  onPurchase={handlePurchaseCredits}
                  isPurchasing={isPurchasingCredits || isPaymentLoading}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Subscription Card Component
interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: (subscription: Subscription) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.status.confirmed;
      case "cancelled":
        return colors.status.error;
      case "expired":
        return colors.text.muted;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilBilling = () => {
    if (!subscription.nextBillingDate) return null;
    const now = new Date();
    const billingDate = new Date(subscription.nextBillingDate);
    const diffTime = billingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilBilling = getDaysUntilBilling();

  return (
    <Card
      style={{ ...styles.card, ...styles.subscriptionCard }}
      padding="large"
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {subscription.plan.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(subscription.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {subscription.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.subscriptionPricing}>
        <Text style={[styles.price, { color: colors.primary }]}>
          {subscription.plan.priceFormatted}
        </Text>
        <Text style={[styles.billingCycle, { color: colors.text.secondary }]}>
          per {subscription.plan.billingCycle}
        </Text>
      </View>

      <View style={styles.subscriptionInfo}>
        {subscription.plan.isUnlimited ? (
          <View style={styles.planFeature}>
            <Text
              style={[styles.featureIcon, { color: colors.status.confirmed }]}
            >
              ∞
            </Text>
            <Text
              style={[styles.featureText, { color: colors.text.secondary }]}
            >
              Unlimited classes
            </Text>
          </View>
        ) : (
          <View style={styles.planFeature}>
            <Text style={[styles.featureIcon, { color: colors.primary }]}>
              {subscription.plan.frequencyLimit?.limit || "N/A"}
            </Text>
            <Text
              style={[styles.featureText, { color: colors.text.secondary }]}
            >
              classes per {subscription.plan.frequencyLimit?.period || "period"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.subscriptionDates}>
        <Text style={[styles.dateText, { color: colors.text.secondary }]}>
          Started {formatDate(subscription.startDate)}
        </Text>
        {subscription.nextBillingDate && daysUntilBilling !== null && (
          <Text
            style={[
              styles.dateText,
              {
                color:
                  daysUntilBilling <= 7
                    ? colors.status.pending
                    : colors.text.secondary,
              },
            ]}
          >
            {daysUntilBilling <= 0
              ? "Billing today"
              : daysUntilBilling === 1
              ? "Billing tomorrow"
              : daysUntilBilling <= 7
              ? `Billing in ${daysUntilBilling} days`
              : `Next billing ${formatDate(subscription.nextBillingDate)}`}
          </Text>
        )}
      </View>

      {subscription.status === "active" && (
        <Button
          variant="outline"
          onPress={() => onCancel(subscription)}
          style={{ ...styles.cardButton, borderColor: colors.status.error }}
          textStyle={{ color: colors.status.error, fontSize: 14 }}
        >
          Cancel Plan
        </Button>
      )}
    </Card>
  );
};

// Credit Balance Card Component
interface CreditBalanceCardProps {
  balance: CreditBalance;
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({ balance }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const formatExpiryDate = (date: string) => {
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} days`;
    } else if (diffDays <= 30) {
      return `${Math.ceil(diffDays / 7)} weeks`;
    } else {
      return expiryDate.toLocaleDateString();
    }
  };

  return (
    <Card style={{ ...styles.card, ...styles.creditCard }} padding="large">
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {balance.brand.name}
        </Text>
        {balance.expiringCredits > 0 && (
          <View
            style={[
              styles.warningBadge,
              { backgroundColor: colors.status.pending },
            ]}
          >
            <Text style={styles.warningText}>!</Text>
          </View>
        )}
      </View>

      <View style={styles.creditsMainDisplay}>
        <Text
          style={[
            styles.creditsLargeNumber,
            { color: colors.status.confirmed },
          ]}
        >
          {balance.availableCredits}
        </Text>
        <Text
          style={[styles.creditsMainLabel, { color: colors.text.secondary }]}
        >
          Available Credits
        </Text>
      </View>

      <View style={styles.creditStats}>
        <View style={styles.creditStat}>
          <Text
            style={[styles.creditStatNumber, { color: colors.text.primary }]}
          >
            {balance.totalCredits}
          </Text>
          <Text
            style={[styles.creditStatLabel, { color: colors.text.secondary }]}
          >
            Total
          </Text>
        </View>

        {balance.expiringCredits > 0 && (
          <View style={styles.creditStat}>
            <Text
              style={[
                styles.creditStatNumber,
                { color: colors.status.pending },
              ]}
            >
              {balance.expiringCredits}
            </Text>
            <Text
              style={[styles.creditStatLabel, { color: colors.text.secondary }]}
            >
              Expiring
            </Text>
          </View>
        )}
      </View>

      {balance.nextExpiryDate && (
        <Text style={[styles.expiryText, { color: colors.text.secondary }]}>
          Next expiry: {formatExpiryDate(balance.nextExpiryDate)}
        </Text>
      )}
    </Card>
  );
};

// Subscription Plan Card Component
interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onPurchase: (plan: SubscriptionPlan) => void;
  isPurchasing: boolean;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onPurchase,
  isPurchasing,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Card style={{ ...styles.card, ...styles.planCard }} padding="large">
      <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
        {plan.name}
      </Text>

      <Text style={[styles.price, { color: colors.primary }]}>
        {plan.priceFormatted}
      </Text>
      <Text style={[styles.billingCycle, { color: colors.text.secondary }]}>
        per {plan.billingCycle}
      </Text>

      <View style={styles.features}>
        {plan.isUnlimited ? (
          <View style={styles.feature}>
            <Text
              style={[styles.checkmark, { color: colors.status.confirmed }]}
            >
              ✓
            </Text>
            <Text
              style={[styles.featureText, { color: colors.text.secondary }]}
            >
              Unlimited classes
            </Text>
          </View>
        ) : (
          <View style={styles.feature}>
            <Text
              style={[styles.checkmark, { color: colors.status.confirmed }]}
            >
              ✓
            </Text>
            <Text
              style={[styles.featureText, { color: colors.text.secondary }]}
            >
              {plan.frequencyLimit.limit} classes per{" "}
              {plan.frequencyLimit.period}
            </Text>
          </View>
        )}
      </View>

      <Button
        variant="primary"
        disabled={isPurchasing}
        onPress={() => onPurchase(plan)}
        style={styles.cardButton}
        textStyle={{ fontSize: 14 }}
      >
        {isPurchasing ? "Processing..." : "Subscribe"}
      </Button>
    </Card>
  );
};

// Credit Plan Card Component
interface CreditPlanCardProps {
  plan: ApiCreditPlan;
  onPurchase: (plan: ApiCreditPlan) => void;
  isPurchasing: boolean;
}

const CreditPlanCard: React.FC<CreditPlanCardProps> = ({
  plan,
  onPurchase,
  isPurchasing,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Card style={{ ...styles.card, ...styles.planCard }} padding="large">
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {plan.name}
        </Text>
        <View style={styles.creditsDisplay}>
          <Text style={[styles.creditsNumber, { color: colors.primary }]}>
            {plan.totalCredits}
          </Text>
          <Text style={[styles.creditsLabel, { color: colors.text.secondary }]}>
            Credits
          </Text>
        </View>
      </View>

      <Text style={[styles.price, { color: colors.primary }]}>
        {plan.priceFormatted}
      </Text>
      <Text style={[styles.billingCycle, { color: colors.text.secondary }]}>
        Valid {plan.validityPeriod} days
      </Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={[styles.checkmark, { color: colors.status.confirmed }]}>
            ✓
          </Text>
          <Text style={[styles.featureText, { color: colors.text.secondary }]}>
            {plan.creditAmount} base credits
          </Text>
        </View>
        {plan.bonusCredits > 0 && (
          <View style={styles.feature}>
            <Text
              style={[styles.checkmark, { color: colors.status.confirmed }]}
            >
              ✓
            </Text>
            <Text
              style={[styles.featureText, { color: colors.text.secondary }]}
            >
              {plan.bonusCredits} bonus credits
            </Text>
          </View>
        )}
      </View>

      <Button
        variant="primary"
        disabled={isPurchasing}
        onPress={() => onPurchase(plan)}
        style={styles.cardButton}
        textStyle={{ fontSize: 14 }}
      >
        {isPurchasing ? "Processing..." : "Purchase"}
      </Button>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  statusOverview: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statusCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  statusValue: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  horizontalScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subscriptionCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  creditCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  planCard: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  price: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  billingCycle: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  cardDetails: {
    marginBottom: spacing.md,
  },
  detailText: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  creditsDisplay: {
    alignItems: "center",
  },
  creditsNumber: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
  },
  creditsLabel: {
    ...typography.body,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  creditsMainDisplay: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  creditsLargeNumber: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
  },
  creditsMainLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  creditStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.sm,
  },
  creditStat: {
    alignItems: "center",
  },
  creditStatNumber: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "600",
  },
  creditStatLabel: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "500",
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  expiryText: {
    ...typography.body,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  features: {
    marginBottom: spacing.md,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
  },
  cardButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
  },
  subscriptionPricing: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  subscriptionInfo: {
    marginBottom: spacing.md,
  },
  planFeature: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  subscriptionDates: {
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.body,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
});

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { PaymentPlansScreenProps } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Card, Button } from '../components/common';
import { formatCurrency, formatPricePerCredit } from '../utils/formatUtils';
import { mockPlansData, CreditPlan, PlansScreenData } from '../data/mockPlansData';


export default function PaymentPlansScreen({ }: PaymentPlansScreenProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const [plansData, setPlansData] = useState<PlansScreenData>(mockPlansData);
  const [selectedDropdown, setSelectedDropdown] = useState<string | null>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleDropdown = (section: string) => {
    setSelectedDropdown(selectedDropdown === section ? null : section);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* My Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              My Plans
            </Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => toggleDropdown('myPlans')}
            >
              <Text style={[styles.dropdownText, { color: colors.text.secondary }]}>
                {plansData.myPlans.count} Active Plans
              </Text>
              <Text style={[styles.dropdownIcon, { color: colors.text.secondary }]}>
                {selectedDropdown === 'myPlans' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedDropdown === 'myPlans' && (
            <View style={styles.plansList}>
              {plansData.myPlans.plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </View>
          )}
        </View>

        {/* Credit Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Credit Plans
            </Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => toggleDropdown('creditPlans')}
            >
              <Text style={[styles.dropdownText, { color: colors.text.secondary }]}>
                Available Plans
              </Text>
              <Text style={[styles.dropdownIcon, { color: colors.text.secondary }]}>
                {selectedDropdown === 'creditPlans' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedDropdown === 'creditPlans' && (
            <View style={styles.plansList}>
              {plansData.availablePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Plan Card Component
interface PlanCardProps {
  plan: CreditPlan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Card style={styles.planCard} padding="large" shadow={true}>
      {/* Plan Header with Name and Credits */}
      <View style={styles.planHeader}>
        <View style={styles.planTitleContainer}>
          <Text style={[styles.planName, { color: colors.text.primary }]}>
            {plan.name}
          </Text>
          {plan.purchased && (
            <View style={[styles.purchasedBadge, { backgroundColor: colors.status.confirmed }]}>
              <Text style={styles.purchasedBadgeText}>Purchased</Text>
            </View>
          )}
        </View>
        <View style={styles.creditsContainer}>
          <Text style={[styles.creditsNumber, { color: colors.primary }]}>
            {plan.credits}
          </Text>
          <Text style={[styles.creditsLabel, { color: colors.text.secondary }]}>
            Credits
          </Text>
        </View>
      </View>

      {/* Pricing Information */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceSymbol, { color: colors.text.secondary }]}>$</Text>
          <Text style={[styles.price, { color: colors.text.primary }]}>
            {plan.price}
          </Text>
        </View>
        <Text style={[styles.validity, { color: colors.text.secondary }]}>
          Valid for {plan.validityDays} days
        </Text>
        <Text style={[styles.pricePerCredit, { color: colors.text.muted }]}>
          {formatPricePerCredit(plan.price, plan.credits)}
        </Text>
      </View>

      {/* Features List with Checkmarks */}
      <View style={styles.featuresContainer}>
        <Text style={[styles.featuresTitle, { color: colors.text.primary }]}>
          What's included:
        </Text>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={[styles.checkmarkContainer, { backgroundColor: colors.status.confirmed }]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.text.secondary }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Purchase Button */}
      <Button
        variant={plan.purchased ? 'outline' : 'primary'}
        disabled={plan.purchased}
        onPress={() => {
          // Handle purchase logic
          console.log('Purchase plan:', plan.id);
        }}
        style={
          plan.purchased 
            ? {
                ...styles.purchaseButton,
                borderColor: colors.text.muted,
                backgroundColor: 'transparent'
              }
            : styles.purchaseButton
        }
        textStyle={plan.purchased ? { color: colors.text.muted } : undefined}
      >
        {plan.purchased ? 'Already Purchased' : `Purchase for ${formatCurrency(plan.price)}`}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dropdownText: {
    ...typography.body,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  plansList: {
    gap: spacing.md,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  planTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  planName: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  purchasedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
  },
  purchasedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  creditsContainer: {
    alignItems: 'center',
    marginLeft: spacing.md,
    minWidth: 60,
  },
  creditsNumber: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  creditsLabel: {
    ...typography.caption,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceContainer: {
    marginBottom: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  priceSymbol: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    marginRight: 2,
  },
  price: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  validity: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  pricePerCredit: {
    ...typography.caption,
    fontSize: 12,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingRight: spacing.sm,
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 1,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  purchaseButton: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
});
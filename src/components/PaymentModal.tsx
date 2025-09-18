import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './common';
import { SubscriptionPlan, CreditPlan } from '../types/api';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlan | CreditPlan;
  planType: 'subscription' | 'credit';
  clientSecret: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  plan,
  planType,
  clientSecret,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { confirmPayment } = useConfirmPayment();
  
  const [cardComplete, setCardComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete your card information');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment Failed', error.message, [{ text: 'OK' }]);
      } else if (paymentIntent) {
        console.log('Payment succeeded:', paymentIntent);
        Alert.alert('Success!', 'Payment completed successfully!', [
          { text: 'OK', onPress: () => { onSuccess(); onClose(); } }
        ]);
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Failed', 'Something went wrong. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Complete Payment
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Plan Info */}
          <View style={[styles.planInfo, { backgroundColor: colors.surface }]}>
            <Text style={[styles.planName, { color: colors.text.primary }]}>
              {plan.name}
            </Text>
            <Text style={[styles.planPrice, { color: colors.primary }]}>
              {plan.priceFormatted}
            </Text>
            {planType === 'subscription' && (
              <Text style={[styles.planDetails, { color: colors.text.secondary }]}>
                per {(plan as SubscriptionPlan).billingCycle}
              </Text>
            )}
            {planType === 'credit' && (
              <Text style={[styles.planDetails, { color: colors.text.secondary }]}>
                {(plan as CreditPlan).totalCredits} credits • Valid {(plan as CreditPlan).validityPeriod} days
              </Text>
            )}
          </View>

          {/* Card Section */}
          <View style={styles.cardSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Card Information
            </Text>
            <CardField
              postalCodeEnabled={false}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>

          {/* Processing State */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.text.primary }]}>
                Processing your payment...
              </Text>
            </View>
          )}

          {/* Footer */}
          {!isProcessing && (
            <View style={styles.footer}>
              <Button
                variant="primary"
                onPress={handlePayment}
                disabled={!cardComplete}
                style={styles.payButton}
              >
                Pay {plan.priceFormatted}
              </Button>
              
              <Button
                variant="outline"
                onPress={onClose}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  planInfo: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  planName: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  planPrice: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planDetails: {
    ...typography.body,
    fontSize: 14,
  },
  cardSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  cardField: {
    height: 50,
    marginVertical: spacing.md,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  processingText: {
    ...typography.body,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  payButton: {
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
});

export default PaymentModal;
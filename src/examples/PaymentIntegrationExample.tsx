import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { usePayments } from '../hooks/usePayments';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useCredits } from '../hooks/useCredits';
import { useStripePayment } from '../utils/stripeUtils';
import { PaymentErrorHandler } from '../utils/paymentErrorHandler';
import { SubscriptionPlan, CreditPlan } from '../types/api';

interface PaymentIntegrationExampleProps {
  subscriptionPlan?: SubscriptionPlan;
  creditPlan?: CreditPlan;
}

/**
 * Example component demonstrating payment integration
 * Shows how to use PaymentService with Stripe for subscription and credit purchases
 */
export const PaymentIntegrationExample: React.FC<PaymentIntegrationExampleProps> = ({
  subscriptionPlan,
  creditPlan,
}) => {
  const { state: paymentState, processSubscriptionPurchase, processCreditPurchase, confirmPayment } = usePayments();
  const subscriptions = useSubscriptions();
  const credits = useCredits();
  const { confirmPaymentIntent, createPaymentMethod, isStripeReady } = useStripePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  useEffect(() => {
    if (!isStripeReady) {
      console.warn('Stripe is not ready. Make sure StripeProvider is properly configured.');
    }
  }, [isStripeReady]);

  /**
   * Handle subscription purchase with full payment flow
   */
  const handleSubscriptionPurchase = async () => {
    if (!subscriptionPlan) {
      Alert.alert('Error', 'No subscription plan selected');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Process subscription purchase (creates payment intent)
      const response = await processSubscriptionPurchase(
        subscriptionPlan._id,
        paymentMethodId || undefined
      );

      if (response.success) {
        // Payment succeeded immediately
        Alert.alert(
          'Success',
          'Subscription purchased successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh subscription data would be handled here
                console.log('Subscription purchased successfully');
              },
            },
          ]
        );
      } else if (response.error?.code === 'REQUIRES_ACTION' && response.data.paymentIntent) {
        // Step 2: Handle payment that requires additional authentication
        const confirmResult = await confirmPaymentIntent(
          response.data.paymentIntent.clientSecret,
          paymentMethodId || undefined
        );

        if (confirmResult.success && confirmResult.paymentIntent) {
          // Step 3: Confirm payment with backend after successful authentication
          const confirmResponse = await confirmPayment(confirmResult.paymentIntent.id);

          if (confirmResponse.success) {
            Alert.alert(
              'Success',
              'Subscription purchased successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('Subscription confirmed successfully');
                  },
                },
              ]
            );
          } else {
            const error = PaymentErrorHandler.transformError(confirmResponse.error);
            Alert.alert('Payment Failed', PaymentErrorHandler.getErrorMessage(error));
          }
        } else {
          const error = PaymentErrorHandler.transformError(confirmResult.error);
          Alert.alert('Payment Failed', PaymentErrorHandler.getErrorMessage(error));
        }
      } else {
        // Payment failed
        const error = PaymentErrorHandler.transformError(response.error);
        const errorMessage = PaymentErrorHandler.getErrorMessage(error);
        const suggestedActions = PaymentErrorHandler.getSuggestedActions(error);

        Alert.alert(
          'Payment Failed',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'cancel',
            },
            ...(error.retryable
              ? [
                  {
                    text: 'Retry',
                    onPress: () => handleSubscriptionPurchase(),
                  },
                ]
              : []),
          ]
        );

        // Log suggested actions for debugging
        console.log('Suggested actions:', suggestedActions);
      }
    } catch (error) {
      const paymentError = PaymentErrorHandler.transformError(error);
      Alert.alert('Error', PaymentErrorHandler.getErrorMessage(paymentError));
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle credit purchase with full payment flow
   */
  const handleCreditPurchase = async () => {
    if (!creditPlan) {
      Alert.alert('Error', 'No credit plan selected');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Process credit purchase (creates payment intent)
      const response = await processCreditPurchase(
        creditPlan._id,
        paymentMethodId || undefined
      );

      if (response.success) {
        // Payment succeeded immediately
        Alert.alert(
          'Success',
          `${creditPlan.totalCredits} credits purchased successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh credit data would be handled here
                console.log('Credits purchased successfully');
              },
            },
          ]
        );
      } else if (response.error?.code === 'REQUIRES_ACTION' && response.data.paymentIntent) {
        // Step 2: Handle payment that requires additional authentication
        const confirmResult = await confirmPaymentIntent(
          response.data.paymentIntent.clientSecret,
          paymentMethodId || undefined
        );

        if (confirmResult.success && confirmResult.paymentIntent) {
          // Step 3: Confirm payment with backend after successful authentication
          const confirmResponse = await confirmPayment(confirmResult.paymentIntent.id);

          if (confirmResponse.success) {
            Alert.alert(
              'Success',
              `${creditPlan.totalCredits} credits purchased successfully!`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('Credits confirmed successfully');
                  },
                },
              ]
            );
          } else {
            const error = PaymentErrorHandler.transformError(confirmResponse.error);
            Alert.alert('Payment Failed', PaymentErrorHandler.getErrorMessage(error));
          }
        } else {
          const error = PaymentErrorHandler.transformError(confirmResult.error);
          Alert.alert('Payment Failed', PaymentErrorHandler.getErrorMessage(error));
        }
      } else {
        // Payment failed
        const error = PaymentErrorHandler.transformError(response.error);
        const errorMessage = PaymentErrorHandler.getErrorMessage(error);

        Alert.alert(
          'Payment Failed',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'cancel',
            },
            ...(error.retryable
              ? [
                  {
                    text: 'Retry',
                    onPress: () => handleCreditPurchase(),
                  },
                ]
              : []),
          ]
        );
      }
    } catch (error) {
      const paymentError = PaymentErrorHandler.transformError(error);
      Alert.alert('Error', PaymentErrorHandler.getErrorMessage(paymentError));
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Create a new payment method (example with test card)
   */
  const handleCreatePaymentMethod = async () => {
    if (!isStripeReady) {
      Alert.alert('Error', 'Stripe is not ready');
      return;
    }

    try {
      // Example with test card data (in real app, this would come from user input)
      const result = await createPaymentMethod({
        number: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvc: '123',
      });

      if (result.success && result.paymentMethod) {
        setPaymentMethodId(result.paymentMethod.id);
        Alert.alert(
          'Success',
          `Payment method created: **** **** **** ${result.paymentMethod.card?.last4}`
        );
      } else {
        const error = PaymentErrorHandler.transformError(result.error);
        Alert.alert('Error', PaymentErrorHandler.getErrorMessage(error));
      }
    } catch (error) {
      const paymentError = PaymentErrorHandler.transformError(error);
      Alert.alert('Error', PaymentErrorHandler.getErrorMessage(paymentError));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Integration Example</Text>

      {paymentState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{paymentState.error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stripe Status</Text>
        <Text style={styles.statusText}>
          Stripe Ready: {isStripeReady ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Payment Method: {paymentMethodId ? `****${paymentMethodId.slice(-4)}` : 'None'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <Button
          title="Create Test Payment Method"
          onPress={(!isStripeReady || isProcessing) ? undefined : handleCreatePaymentMethod}
          buttonStyle={(!isStripeReady || isProcessing) ? styles.disabledButton : styles.button}
        />
      </View>

      {subscriptionPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Purchase</Text>
          <Text style={styles.planText}>
            {subscriptionPlan.name} - {subscriptionPlan.priceFormatted}
          </Text>
          <Button
            title="Purchase Subscription"
            onPress={(!isStripeReady || isProcessing || paymentState.isLoading) ? undefined : handleSubscriptionPurchase}
            loading={isProcessing || paymentState.isLoading}
            buttonStyle={(!isStripeReady || isProcessing || paymentState.isLoading) ? styles.disabledButton : styles.button}
          />
        </View>
      )}

      {creditPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credit Purchase</Text>
          <Text style={styles.planText}>
            {creditPlan.name} - {creditPlan.priceFormatted} ({creditPlan.totalCredits} credits)
          </Text>
          <Button
            title="Purchase Credits"
            onPress={(!isStripeReady || isProcessing || paymentState.isLoading) ? undefined : handleCreditPurchase}
            loading={isProcessing || paymentState.isLoading}
            buttonStyle={(!isStripeReady || isProcessing || paymentState.isLoading) ? styles.disabledButton : styles.button}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.debugText}>
          Payment State Loading: {paymentState.isLoading ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.debugText}>
          Processing: {isProcessing ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  planText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
});

export default PaymentIntegrationExample;
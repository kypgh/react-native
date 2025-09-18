import { useState } from 'react';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

export interface PaymentSheetResult {
  success: boolean;
  error?: string;
}

export const usePaymentSheetFlow = () => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [isLoading, setIsLoading] = useState(false);

  const processPayment = async (
    clientSecret: string,
    merchantDisplayName: string = 'Fitness Booking App'
  ): Promise<PaymentSheetResult> => {
    setIsLoading(true);

    try {
      // Step 1: Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName,
        allowsDelayedPaymentMethods: false,
        returnURL: 'your-app://stripe-redirect', // Add return URL for manual confirmation
      });

      if (initError) {
        console.error('Payment sheet init error:', initError);
        return { success: false, error: initError.message };
      }

      // Step 2: Present the payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or error occurred
        if (presentError.code === 'Canceled') {
          return { success: false, error: 'Payment cancelled' };
        }
        console.error('Payment sheet present error:', presentError);
        return { success: false, error: presentError.message };
      }

      // Payment succeeded
      return { success: true };

    } catch (error: any) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message || 'Payment failed' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processPayment,
    isLoading,
  };
};

export default usePaymentSheetFlow;
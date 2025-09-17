import React from 'react';
import { StripeProvider as StripeReactNativeProvider } from '@stripe/stripe-react-native';
import { DEFAULT_STRIPE_CONFIG, StripeUtils } from '../utils/stripeUtils';

interface StripeProviderProps {
  children: React.ReactElement | React.ReactElement[];
  publishableKey?: string;
  merchantIdentifier?: string;
  urlScheme?: string;
}

/**
 * Stripe Provider Component
 * Wraps the app with Stripe context and initializes Stripe utilities
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  publishableKey = DEFAULT_STRIPE_CONFIG.publishableKey,
  merchantIdentifier = DEFAULT_STRIPE_CONFIG.merchantIdentifier,
  urlScheme = DEFAULT_STRIPE_CONFIG.urlScheme,
}) => {
  // Initialize Stripe utilities with configuration
  React.useEffect(() => {
    StripeUtils.getInstance({
      publishableKey,
      merchantIdentifier,
      urlScheme,
    });
  }, [publishableKey, merchantIdentifier, urlScheme]);

  return (
    <StripeReactNativeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
      urlScheme={urlScheme}
    >
      {children}
    </StripeReactNativeProvider>
  );
};

export default StripeProvider;
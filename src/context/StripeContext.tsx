import React, { createContext, useContext, ReactNode } from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';

// Stripe publishable key for test mode
// In production, use environment variable: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
// For testing, we use a test mode key that won't charge real money
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51QbPCyAQz...'; // Test mode key - replace with actual test key

interface StripeContextType {
  publishableKey: string;
}

const StripeContext = createContext<StripeContextType>({
  publishableKey: STRIPE_PUBLISHABLE_KEY,
});

export const useStripeContext = () => useContext(StripeContext);

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <StripeContext.Provider value={{ publishableKey: STRIPE_PUBLISHABLE_KEY }}>
      <StripeProviderNative publishableKey={STRIPE_PUBLISHABLE_KEY}>
        {children as any}
      </StripeProviderNative>
    </StripeContext.Provider>
  );
}

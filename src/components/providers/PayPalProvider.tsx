"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode, useEffect } from "react";
import { PAYPAL_ENV, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";

export function PayPalProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`🔧 PayPal: ${PAYPAL_ENV.environment}`);
    }
  }, []);

  return (
    <PayPalScriptProvider 
      options={{ 
        clientId: PAYPAL_CREDENTIALS.clientId,
        vault: true,
        intent: "subscription",
        currency: "USD",
        ...(PAYPAL_ENV.isSandbox && { 
          "buyer-country": "US",
          "data-environment": "sandbox" 
        })
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
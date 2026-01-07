// src/components/providers/PayPalProvider.tsx
"use client"; // <--- INI KUNCINYA

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children }: { children: ReactNode }) {
  return (
    <PayPalScriptProvider options={{ 
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      vault: true,
      intent: "subscription",
      currency: "USD"
    }}>
      {children}
    </PayPalScriptProvider>
  );
}
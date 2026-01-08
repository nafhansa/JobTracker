// src/components/SubscriptionBanner.tsx
"use client";

import { Sparkles, CheckCircle2, Zap } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { PAYPAL_PLANS, PAYPAL_ENV, PAYPAL_CREDENTIALS } from "@/lib/paypal-config"; // ✅ Import from config
import { useState } from "react";

export function SubscriptionBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-6 md:p-10 text-center shadow-2xl">
      
      {/* Banner Sandbox Mode */}
      {PAYPAL_ENV.isSandbox && (
        <div className="mb-4 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 text-xs">
          🧪 SANDBOX MODE - Testing with fake money
        </div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C1007] to-transparent opacity-50"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4] text-xs font-bold tracking-wider uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          Premium Access Required
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FFF0C4] mb-4">
          Choose Your Plan
        </h2>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mt-8">
          
          {/* MONTHLY PLAN */}
          <div className="flex flex-col rounded-xl border border-[#FFF0C4]/10 bg-[#1a0201]/60 p-6 backdrop-blur-sm text-left">
            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Monthly Plan</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">$2.99/month subscription</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Track Unlimited Applications</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Smart Filters & Reminders</span>
               </div>
            </div>

            <div className="relative z-20">
              <PayPalScriptProvider
                options={{
                  clientId: PAYPAL_CREDENTIALS.clientId,
                  intent: "subscription",
                  vault: true,
                  currency: "USD",
                  components: "buttons",
                  ...(PAYPAL_ENV.isSandbox && {
                    "buyer-country": "US",
                    "data-environment": "sandbox",
                  }),
                }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' }}
                  createSubscription={(data, actions) => {
                    console.log('Creating subscription with Plan ID:', PAYPAL_PLANS.monthly);
                    return actions.subscription.create({
                      plan_id: PAYPAL_PLANS.monthly, // ✅ Auto-select correct plan
                      custom_id: user?.uid
                    });
                  }}
                  onApprove={async (data) => {
                    console.log("✅ Subscription Success:", data.subscriptionID);
                    setSuccessMessage("Monthly subscription activated!");
                    setErrorMessage(null);
                    setTimeout(() => {
                      router.refresh();
                    }, 1200);
                  }}
                  onError={(err) => {
                    console.error("❌ PayPal Error:", err);
                    setErrorMessage("Payment failed. Please try again.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>

          {/* LIFETIME PLAN */}
          <div className="relative flex flex-col rounded-xl border border-[#8C1007] bg-[#3E0703]/40 p-6 backdrop-blur-sm shadow-lg text-left transform md:scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8C1007] text-[#FFF0C4] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
               <Zap className="w-3 h-3 inline mr-1" /> Best Value
            </div>

            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Lifetime Access</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">$17.99 one-time payment</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Pay Once, Own Forever</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Future Features Included</span>
               </div>
            </div>

            <div className="relative z-20">
              <PayPalScriptProvider
                options={{
                  clientId: PAYPAL_CREDENTIALS.clientId,
                  intent: "capture", // one-time payment
                  vault: false,
                  currency: "USD",
                  components: "buttons",
                  ...(PAYPAL_ENV.isSandbox && {
                    "buyer-country": "US",
                    "data-environment": "sandbox",
                  }),
                }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
                  createOrder={(data, actions) => {
                    console.log('Creating lifetime order');
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{
                        amount: {
                          value: "17.99",
                          currency_code: "USD"
                        },
                        description: "JobTracker Lifetime Pro Access",
                        custom_id: user?.uid
                      }],
                      application_context: {
                        shipping_preference: "NO_SHIPPING"
                      }
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      const details = await actions.order.capture();
                      console.log("✅ Lifetime purchase:", details);
                      setSuccessMessage("Lifetime purchase successful!");
                      setErrorMessage(null);
                      setTimeout(() => {
                        router.refresh();
                      }, 2000);
                    }
                  }}
                  onError={(err) => {
                    console.error("❌ PayPal Error:", err);
                    setErrorMessage("Payment failed. Please try again.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </div>

        {(successMessage || errorMessage) && (
          <div className="mt-6 w-full max-w-2xl">
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
                successMessage
                  ? "bg-green-500/10 text-green-200 border border-green-500/30"
                  : "bg-red-500/10 text-red-200 border border-red-500/30"
              }`}
            >
              <span>{successMessage || errorMessage}</span>
              <button
                onClick={() => {
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="text-xs uppercase tracking-wide opacity-80 hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
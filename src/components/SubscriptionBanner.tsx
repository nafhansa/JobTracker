// src/components/SubscriptionBanner.tsx
"use client";

import { Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { PAYPAL_PLANS, PAYPAL_ENV, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";
import { useState } from "react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

type PlanType = "monthly" | "lifetime" | null;

interface SubscriptionBannerProps {
  isLimitReached?: boolean;
  currentJobCount?: number;
}

export function SubscriptionBanner({ isLimitReached = false, currentJobCount = 0 }: SubscriptionBannerProps = {}) {
  const { user, subscription } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const isFreeUser = subscription?.plan === "free";
  const showLimitMessage = isFreeUser && isLimitReached;

  const handleSuccess = (msg: string) => {
    setStatusMsg({ type: 'success', text: msg });
    setTimeout(() => router.refresh(), 1500);
  };

  const handleError = (msg: string) => {
    setStatusMsg({ type: 'error', text: msg });
  };

  // PayPal options TANPA intent spesifik - biarkan buttons yang tentukan
  const paypalOptions = {
    clientId: PAYPAL_CREDENTIALS.clientId,
    vault: true,
    currency: "USD",
    components: "buttons",
    ...(PAYPAL_ENV.isSandbox && { 
      "data-environment": "sandbox" as const, 
      "buyer-country": "US" 
    }),
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-10 text-center shadow-lg">
        
        {PAYPAL_ENV.isSandbox && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
            🧪 SANDBOX MODE - Testing with fake money
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          {showLimitMessage ? "Upgrade to Add More Jobs" : "Premium Access Required"}
        </div>

        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {showLimitMessage ? "You've Reached Your Free Plan Limit" : "Choose Your Plan"}
        </h2>
        
        {showLimitMessage && (
          <p className="text-lg text-muted-foreground mb-4">
            You&apos;re currently tracking {currentJobCount}/{FREE_PLAN_JOB_LIMIT} jobs. Upgrade to Pro for unlimited job tracking!
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mt-8">
            
            {/* === MONTHLY PLAN === */}
            <div 
              className={`flex flex-col rounded-xl border transition-all duration-300 shadow-sm ${
                selectedPlan === 'monthly' 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                  : "border-border bg-card hover:border-primary/30"
              } p-6 text-left`}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">Monthly Plan</h3>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground decoration-2">
                    $2.99
                  </span>
                  <span className="text-[10px] font-semibold text-primary bg-blue-50 border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Save 33%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">$1.99/month subscription</p>
              </div>
              
              <div className="flex-1 space-y-3 mb-6">
                 <div className="flex items-center gap-3 text-foreground text-sm">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   <span>Track Unlimited Applications</span>
                 </div>
                 <div className="flex items-center gap-3 text-foreground text-sm">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   <span>Smart Filters & Reminders</span>
                 </div>
              </div>

              <div className="min-h-[55px] flex items-end">
                {selectedPlan !== 'monthly' ? (
                  <button
                    onClick={() => { setSelectedPlan('monthly'); setStatusMsg(null); }}
                    className="w-full py-3 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-border"
                  >
                    Select Monthly <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="animate-in fade-in zoom-in duration-300 w-full">
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' }}
                      createSubscription={(data, actions) => {
                        return actions.subscription.create({
                          plan_id: PAYPAL_PLANS.monthly,
                          custom_id: user?.uid
                        });
                      }}
                      onApprove={async () => {
                        handleSuccess("Monthly subscription activated!");
                      }}
                      onError={(err) => {
                        console.error("Monthly Error:", err);
                        handleError("Subscription process failed.");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* === LIFETIME PLAN === */}
            <div 
              className={`relative flex flex-col rounded-xl border transition-all duration-300 shadow-md ${
                selectedPlan === 'lifetime' 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                  : "border-primary/50 bg-card hover:border-primary"
              } p-6 text-left transform md:scale-105`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase shadow-md">
                 <Zap className="w-3 h-3 inline mr-1" /> Best Value
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">Lifetime Access</h3>
              <p className="text-sm text-muted-foreground mb-6">$9.99 one-time payment</p>
              
              <div className="flex-1 space-y-3 mb-6">
                 <div className="flex items-center gap-3 text-foreground text-sm">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   <span>Pay Once, Own Forever</span>
                 </div>
                 <div className="flex items-center gap-3 text-foreground text-sm">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   <span>Future Features Included</span>
                 </div>
              </div>

              <div className="min-h-[55px] flex items-end">
                {selectedPlan !== 'lifetime' ? (
                  <button
                    onClick={() => { setSelectedPlan('lifetime'); setStatusMsg(null); }}
                    className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    Select Lifetime <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="animate-in fade-in zoom-in duration-300 w-full">
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' }}
                      createOrder={(data, actions) => {
                        console.log("Creating Lifetime Order...");
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: { value: "9.99", currency_code: "USD" },
                            description: "JobTracker Lifetime Pro Access (Early Bird)",
                            custom_id: user?.uid
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          await actions.order.capture();
                          handleSuccess("Lifetime purchase successful!");
                        }
                      }}
                      onError={(err) => {
                        console.error("Lifetime Error:", err);
                        handleError("Payment execution failed.");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

        </div>

        {/* Tombol Cancel Selection */}
        {selectedPlan && (
           <button 
             onClick={() => { setSelectedPlan(null); setStatusMsg(null); }}
             className="mt-6 text-muted-foreground hover:text-foreground text-xs underline cursor-pointer transition-colors"
           >
             Compare plans again
           </button>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div className="mt-6 w-full max-w-2xl animate-in slide-in-from-bottom-2">
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-md border ${
                statusMsg.type === 'success' 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
              <span>{statusMsg.text}</span>
              <button 
                onClick={() => setStatusMsg(null)} 
                className="text-xs uppercase hover:opacity-100 opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
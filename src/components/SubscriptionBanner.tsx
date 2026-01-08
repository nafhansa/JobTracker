// src/components/SubscriptionBanner.tsx
"use client";

import { Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { PAYPAL_PLANS, PAYPAL_ENV, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";
import { useState } from "react";

type PlanType = "monthly" | "lifetime" | null;

export function SubscriptionBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-6 md:p-10 text-center shadow-2xl">
        
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
            
            {/* === MONTHLY PLAN === */}
            <div 
              className={`flex flex-col rounded-xl border transition-all duration-300 ${
                selectedPlan === 'monthly' 
                  ? "border-[#FFF0C4] bg-[#1a0201]/90 ring-1 ring-[#FFF0C4]/50" 
                  : "border-[#FFF0C4]/10 bg-[#1a0201]/60 hover:border-[#FFF0C4]/30"
              } p-6 backdrop-blur-sm text-left`}
            >
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

              <div className="min-h-[55px] flex items-end">
                {selectedPlan !== 'monthly' ? (
                  <button
                    onClick={() => { setSelectedPlan('monthly'); setStatusMsg(null); }}
                    className="w-full py-3 rounded-lg bg-[#FFF0C4]/10 hover:bg-[#FFF0C4]/20 text-[#FFF0C4] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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
              className={`relative flex flex-col rounded-xl border transition-all duration-300 ${
                selectedPlan === 'lifetime' 
                  ? "border-[#8C1007] bg-[#3E0703]/60 ring-1 ring-[#8C1007]" 
                  : "border-[#8C1007]/50 bg-[#3E0703]/40 hover:border-[#8C1007]"
              } p-6 backdrop-blur-sm shadow-lg text-left transform md:scale-105`}
            >
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

              <div className="min-h-[55px] flex items-end">
                {selectedPlan !== 'lifetime' ? (
                  <button
                    onClick={() => { setSelectedPlan('lifetime'); setStatusMsg(null); }}
                    className="w-full py-3 rounded-lg bg-[#8C1007] hover:bg-[#a01208] text-[#FFF0C4] text-sm font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
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
                            amount: { value: "17.99", currency_code: "USD" },
                            description: "JobTracker Lifetime Pro Access",
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
             className="mt-6 text-[#FFF0C4]/50 hover:text-[#FFF0C4] text-xs underline cursor-pointer"
           >
             Compare plans again
           </button>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div className="mt-6 w-full max-w-2xl animate-in slide-in-from-bottom-2">
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
                statusMsg.type === 'success' 
                  ? "bg-green-500/10 text-green-200 border border-green-500/30" 
                  : "bg-red-500/10 text-red-200 border border-red-500/30"
              }`}>
              <span>{statusMsg.text}</span>
              <button 
                onClick={() => setStatusMsg(null)} 
                className="text-xs uppercase hover:opacity-100 opacity-80"
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
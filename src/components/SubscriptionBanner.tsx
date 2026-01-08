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
  
  // State untuk mengontrol plan mana yang sedang dipilih user
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Opsi Monthly
  const monthlyOptions = {
    clientId: PAYPAL_CREDENTIALS.clientId,
    intent: "subscription",
    vault: true,
    currency: "USD",
    "data-namespace": "paypal_subscriber",
    ...(PAYPAL_ENV.isSandbox && {
      "buyer-country": "US",
      "data-environment": "sandbox",
    }),
  };

  // Opsi Lifetime
  const lifetimeOptions = {
    clientId: PAYPAL_CREDENTIALS.clientId,
    intent: "capture",
    currency: "USD",
    "data-namespace": "paypal_lifetime",
    ...(PAYPAL_ENV.isSandbox && {
      "buyer-country": "US",
      "data-environment": "sandbox",
    }),
  };

  return (
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

              {/* LOGIKA TOMBOL: Jika belum dipilih, tampilkan tombol biasa. Jika dipilih, load PayPal. */}
              <div className="min-h-[55px]">
                {selectedPlan !== 'monthly' ? (
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className="w-full py-3 rounded-lg bg-[#FFF0C4]/10 hover:bg-[#FFF0C4]/20 text-[#FFF0C4] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Select Monthly <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <PayPalScriptProvider options={monthlyOptions}>
                     <div className="animate-in fade-in zoom-in duration-300">
                        <PayPalButtons
                          style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' }}
                          createSubscription={(data, actions) =>
                            actions.subscription.create({
                              plan_id: PAYPAL_PLANS.monthly,
                              custom_id: user?.uid
                            })
                          }
                          onApprove={async () => {
                            setSuccessMessage("Monthly subscription activated!");
                            setTimeout(() => router.refresh(), 1200);
                          }}
                          onError={() => setErrorMessage("Payment failed. Please try again.")}
                        />
                     </div>
                  </PayPalScriptProvider>
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

              {/* LOGIKA TOMBOL LIFETIME */}
              <div className="min-h-[55px]">
                {selectedPlan !== 'lifetime' ? (
                  <button
                    onClick={() => setSelectedPlan('lifetime')}
                    className="w-full py-3 rounded-lg bg-[#8C1007] hover:bg-[#a01208] text-[#FFF0C4] text-sm font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Select Lifetime <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <PayPalScriptProvider options={lifetimeOptions}>
                     <div className="animate-in fade-in zoom-in duration-300">
                        <PayPalButtons
                          style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' }}
                          createOrder={(data, actions) =>
                            actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [{
                                amount: { value: "17.99", currency_code: "USD" },
                                description: "JobTracker Lifetime Pro Access",
                                custom_id: user?.uid
                              }]
                            })
                          }
                          onApprove={async (_data, actions) => {
                            if (actions.order) {
                              await actions.order.capture();
                              setSuccessMessage("Lifetime purchase successful!");
                              setTimeout(() => router.refresh(), 2000);
                            }
                          }}
                          onError={() => setErrorMessage("Payment failed. Please try again.")}
                        />
                     </div>
                  </PayPalScriptProvider>
                )}
              </div>
            </div>

        </div>

        {/* Tombol Cancel Selection (Optional, kalau user mau ganti pikiran) */}
        {selectedPlan && (
           <button 
             onClick={() => setSelectedPlan(null)}
             className="mt-6 text-[#FFF0C4]/50 hover:text-[#FFF0C4] text-xs underline"
           >
             Compare plans again
           </button>
        )}

        {/* Pesan Error/Sukses */}
        {(successMessage || errorMessage) && (
          <div className="mt-6 w-full max-w-2xl">
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
                successMessage ? "bg-green-500/10 text-green-200 border border-green-500/30" : "bg-red-500/10 text-red-200 border border-red-500/30"
              }`}>
              <span>{successMessage || errorMessage}</span>
              <button onClick={() => { setSuccessMessage(null); setErrorMessage(null); }} className="text-xs uppercase hover:opacity-100 opacity-80">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { Sparkles, CheckCircle2, Zap } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

export function SubscriptionBanner() {
  const { user } = useAuth();
  const router = useRouter();

  // Konfigurasi ID
  const MONTHLY_PLAN_ID = "P-53901953J46636835MM4553I";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-6 md:p-10 text-center shadow-2xl">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C1007] to-transparent opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#8C1007] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4] text-xs font-bold tracking-wider uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          Premium Access Required
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FFF0C4] mb-4 drop-shadow-md">
          Choose Your Plan
        </h2>
        
        <p className="text-[#FFF0C4]/70 text-lg mb-8 max-w-2xl">
          Unlock unlimited job tracking, analytics, and organize your search like a pro.
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* --- TOMBOL MONTHLY (SUBSCRIPTION) --- */}
          <div className="flex flex-col rounded-xl border border-[#FFF0C4]/10 bg-[#1a0201]/60 p-6 backdrop-blur-sm hover:border-[#FFF0C4]/30 transition-all text-left">
            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Monthly Plan</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">Perfect for short-term job hunting.</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Full Feature Access</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Cancel Anytime</span>
               </div>
            </div>

            <div className="relative z-20">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', color: 'silver' }}
                createSubscription={(data, actions) => {
                  if (!user) { router.push("/login"); return Promise.reject(); }
                  return actions.subscription.create({
                    plan_id: MONTHLY_PLAN_ID,
                    custom_id: user.uid
                  });
                }}
                onApprove={async (data, actions) => {
                  alert("Berhasil! Langganan bulanan Anda sedang diproses.");
                  router.push("/dashboard");
                  setTimeout(() => window.location.reload(), 2000);
                }}
              />
            </div>
          </div>

          {/* --- TOMBOL LIFETIME (ONE-TIME ORDER) --- */}
          <div className="relative flex flex-col rounded-xl border border-[#8C1007] bg-[#3E0703]/40 p-6 backdrop-blur-sm shadow-lg shadow-[#8C1007]/10 transform md:scale-105 text-left">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8C1007] text-[#FFF0C4] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#FFF0C4]/20 flex items-center gap-1">
               <Zap className="w-3 h-3 fill-current" /> Best Value
            </div>

            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Lifetime Access</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">Pay once, own it forever.</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Unlimited Everything</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>No Recurring Fees</span>
               </div>
            </div>

            <div className="relative z-20">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
                createOrder={(data, actions) => {
                  if (!user) { router.push("/login"); return Promise.reject(); }
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [{
                      amount: {
                        currency_code: "USD",
                        value: "17.99"
                      },
                      description: "Job Tracker - Lifetime Access Pro",
                      custom_id: user.uid
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    await actions.order.capture();
                    alert("Selamat! Pembayaran Lifetime berhasil.");
                    router.push("/dashboard");
                    setTimeout(() => window.location.reload(), 2000);
                  }
                }}
              />
            </div>
            <p className="mt-3 text-[10px] text-[#FFF0C4]/40 text-center w-full">Secured payment via PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
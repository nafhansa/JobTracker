"use client";

import { Sparkles, CheckCircle2, Zap } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

export function SubscriptionBanner() {
  const { user } = useAuth();
  const router = useRouter();

  // ID LIVE sesuai kirimanmu
  const LIVE_SUBSCRIPTION_PLAN_ID = "P-13B09030DE7786940NFPJG5Y"; 
  const LIVE_LIFETIME_HOSTED_ID = "UMUXPHUVRXF9G";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-6 md:p-10 text-center shadow-2xl">
      
      {/* Dekorasi Background */}
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
          
          {/* --- PAKET MONTHLY (SUBSCRIPTION) --- */}
          <div className="flex flex-col rounded-xl border border-[#FFF0C4]/10 bg-[#1a0201]/60 p-6 backdrop-blur-sm text-left">
            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Monthly Plan</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">Subscription model.</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Full Feature Access</span>
               </div>
            </div>

            <div className="relative z-20">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: LIVE_SUBSCRIPTION_PLAN_ID,
                    custom_id: user?.uid // Mengirim UID agar bisa diproses di database
                  });
                }}
                onApprove={async (data) => {
                  alert("Subscription Success ID: " + data.subscriptionID);
                  router.push("/dashboard");
                }}
              />
            </div>
          </div>

          {/* --- PAKET LIFETIME (ONE-TIME PAYMENT - REDIRECT) --- */}
<div className="relative flex flex-col rounded-xl border border-[#8C1007] bg-[#3E0703]/40 p-6 backdrop-blur-sm shadow-lg text-left transform md:scale-105">
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8C1007] text-[#FFF0C4] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
     <Zap className="w-3 h-3 inline mr-1" /> Best Value
  </div>

  <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Lifetime Access</h3>
  <p className="text-sm text-[#FFF0C4]/60 mb-6">One-time payment.</p>
  
  <div className="flex-1 space-y-3 mb-6">
     <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
       <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
       <span>Pay Once, Own Forever</span>
     </div>
  </div>

  <div className="relative z-20">
    <button
      onClick={() => {
        // Redirect ke Link Payment resmi PayPal
        // Kita tambahkan custom_id (UID) lewat parameter jika link mendukung, 
        // namun link NCP standar biasanya tidak mendukung passing UID langsung.
        const checkoutUrl = `https://www.paypal.com/ncp/payment/UMUXPHUVRXF9G`;
        window.open(checkoutUrl, "_blank");
      }}
      className="w-full py-3 px-4 bg-[#ffc439] hover:bg-[#f2ba36] text-[#111] font-bold rounded-md transition-colors flex items-center justify-center gap-2 shadow-md"
    >
      {/* Icon PayPal (Opsional) */}
      <svg className="w-20 h-5" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.4 4.5h-8.2c-.5 0-1 .4-1.1.9L2.6 27.2c-.1.3 0 .6.2.8.2.2.4.3.7.3h4.1c.5 0 1-.4 1.1-.9l1.1-7.1c.1-.5.5-.9 1-.9h2.9c5 0 8.2-2.5 8.9-7.3.4-2.8-.2-4.9-1.8-6.1-1.1-.8-2.6-1.5-4.8-1.5z" fill="#003087"/>
        <path d="M54.5 4.5h-8.2c-.5 0-1 .4-1.1.9L41.7 27.2c-.1.3 0 .6.2.8.2.2.4.3.7.3h4.1c.5 0 1-.4 1.1-.9l1.1-7.1c.1-.5.5-.9 1-.9h2.9c5 0 8.2-2.5 8.9-7.3.4-2.8-.2-4.9-1.8-6.1-1.1-.8-2.6-1.5-4.8-1.5z" fill="#003087"/>
        <path d="M84.5 4.5h-8.2c-.5 0-1 .4-1.1.9L71.7 27.2c-.1.3 0 .6.2.8.2.2.4.3.7.3h4.1c.5 0 1-.4 1.1-.9l1.1-7.1c.1-.5.5-.9 1-.9h2.9c5 0 8.2-2.5 8.9-7.3.4-2.8-.2-4.9-1.8-6.1-1.1-.8-2.6-1.5-4.8-1.5z" fill="#009cde"/>
      </svg>
      Buy Now
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { CheckCircle2, ArrowRight, Star, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PAYPAL_PLANS, PAYPAL_ENV, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";
import { useState } from "react";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] overflow-x-hidden">
      <Navbar />
      
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16">
          {/* Sandbox Banner */}
          {PAYPAL_ENV.isSandbox && (
            <div className="fixed top-20 left-0 right-0 z-50 bg-yellow-500/90 text-black py-2 px-4 text-center text-sm font-bold">
              🧪 SANDBOX MODE - Testing with Fake Money
            </div>
          )}
        <section className="text-center max-w-4xl mx-auto px-6 space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#FFF0C4]">
            Invest in Your Career
          </h1>
          <p className="text-lg md:text-xl text-[#FFF0C4]/70 max-w-2xl mx-auto">
            Stop losing track of opportunities. Choose the plan that fits your ambition.
          </p>
        </section>

        <section className="w-full max-w-5xl mx-auto px-6 mt-16">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* MONTHLY PLAN */}
            <PricingCard
              plan="Monthly"
              price="$2.99"
              period="/month"
              description="Perfect for active job seekers."
              features={[
                "Track Unlimited Applications",
                "Kanban Board & Smart Filters",
                "Auto-Deadline Reminders",
                "Priority Email Support",
              ]}
              buttonText="Start Monthly"
              planId={PAYPAL_PLANS.monthly}
              planType="subscription"
            />

            {/* LIFETIME PLAN */}
            <PricingCard
              plan="Lifetime Pro"
              price="$17.99"
              originalPrice="$24.99"
              period="one-time"
              description="Pay once, own it forever."
              features={[
                "Everything in Monthly Plan",
                "Pay Once, Own Forever",
                "Future AI Features Included",
                "Supporter Badge on Profile",
              ]}
              buttonText="Get Lifetime Access"
              isFeatured
              planId={PAYPAL_PLANS.lifetime}
              planType="lifetime"
            />
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-[#FFF0C4]/10 text-center text-sm text-[#FFF0C4]/40 relative z-10">
        <p>&copy; {new Date().getFullYear()} JobTracker.</p>
      </footer>
    </div>
  );
}

function PricingCard({
  plan,
  price,
  originalPrice,
  period,
  description,
  features,
  buttonText,
  isFeatured = false,
  planId,
  planType,
}: {
  plan: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isFeatured?: boolean;
  planId: string;
  planType: "subscription" | "lifetime";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div
      className={`group relative p-8 rounded-2xl transition-all duration-300 ${
        isFeatured 
          ? "border border-[#8C1007] bg-gradient-to-b from-[#3E0703]/90 to-[#1a0201] shadow-[0_0_40px_-10px_rgba(140,16,7,0.4)] md:-translate-y-4 z-10" 
          : "border border-[#FFF0C4]/10 bg-[#2a0401]/80 hover:border-[#8C1007]/30 hover:bg-[#3E0703]/30"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-4 right-6">
          <span className="bg-[#8C1007] text-[#FFF0C4] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Best Value
          </span>
        </div>
      )}

      <h3 className="text-2xl font-serif font-bold text-[#FFF0C4]">{plan}</h3>
      <p className="text-[#FFF0C4]/50 text-sm mt-2">{description}</p>
      
      <div className="mt-6">
        {originalPrice && (
          <div className="flex items-center gap-2 mb-1 animate-pulse">
            <span className="text-lg text-[#FFF0C4]/40 line-through decoration-[#8C1007] decoration-2 font-medium">
              {originalPrice}
            </span>
            <span className="text-[10px] font-bold text-[#8C1007] bg-[#FFF0C4] px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" /> Save 30%
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold text-[#FFF0C4]">{price}</span>
          <span className="text-[#FFF0C4]/60 font-medium">{period}</span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 p-0.5 rounded-full ${isFeatured ? "bg-[#8C1007]/20 text-[#8C1007]" : "text-[#FFF0C4]/40"}`}>
              <CheckCircle2 className={`w-5 h-5 ${isFeatured ? "text-[#FF4D4D]" : "text-[#FFF0C4]/60"}`} />
            </div>
            <span className={`text-sm ${isFeatured ? "text-[#FFF0C4] font-medium" : "text-[#FFF0C4]/80"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 relative z-20">
        {user ? (
          planType === "subscription" ? (
            // Monthly Subscription Button
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
                style={{ layout: 'vertical', shape: 'rect', color: 'silver' }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: planId,
                    custom_id: user.uid
                  });
                }}
                onApprove={async (data, actions) => {
                  console.log("Subscription approved:", data.subscriptionID);
                  setSuccessMessage("Monthly subscription activated!");
                  setErrorMessage(null);
                  setTimeout(() => {
                    router.push("/dashboard");
                  }, 1200);
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  setErrorMessage("Payment failed. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          ) : (
            // Lifetime One-Time Purchase Button
            <PayPalScriptProvider
              options={{
                clientId: PAYPAL_CREDENTIALS.clientId,
                intent: "capture",
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
                  return actions.order.create({
                    intent: "CAPTURE", // ✅ REQUIRED: Capture payment immediately
                    purchase_units: [{
                      amount: {
                        value: "17.99",
                        currency_code: "USD"
                      },
                      description: "JobTracker Lifetime Pro Access",
                      custom_id: user.uid // CRITICAL: Pass user ID for webhook
                    }],
                    application_context: {
                      shipping_preference: "NO_SHIPPING"
                    }
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const details = await actions.order.capture();
                    console.log("Order completed:", details);
                    setSuccessMessage("Lifetime purchase successful!");
                    setErrorMessage(null);
                    setTimeout(() => {
                      router.push("/dashboard");
                    }, 1200);
                  }
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  setErrorMessage("Payment failed. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          )
        ) : (
          <button
            onClick={() => router.push("/login")}
            className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-300 group-hover:scale-[1.02] ${
              isFeatured
                ? "bg-[#FFF0C4] text-[#3E0703] hover:bg-[#e6d5b0] shadow-lg"
                : "bg-transparent border border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#FFF0C4]/10"
            }`}
          >
            {buttonText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        )}
      </div>

      {(successMessage || errorMessage) && (
        <div className="mt-4">
          <div
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold shadow ${
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
              className="uppercase tracking-wide opacity-80 hover:opacity-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isFeatured && (
        <p className="text-center text-[10px] text-[#FFF0C4]/30 mt-4">
          30-day money-back guarantee
        </p>
      )}
    </div>
  );
}
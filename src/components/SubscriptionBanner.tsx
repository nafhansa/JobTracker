// src/components/SubscriptionBanner.tsx
"use client";

import { Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { PADDLE_PRICES, PADDLE_ENV } from "@/lib/paddle-config";
import { useState } from "react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { usePaddle } from "@/components/providers/PaddleProvider";

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
  const { paddle } = usePaddle();
  const isFreeUser = subscription?.plan === "free";
  const showLimitMessage = isFreeUser && isLimitReached;

  const handleSuccess = (msg: string) => {
    setStatusMsg({ type: 'success', text: msg });
    setTimeout(() => router.refresh(), 1500);
  };

  const handleError = (msg: string) => {
    setStatusMsg({ type: 'error', text: msg });
  };

  const openCheckout = (priceId: string) => {
    if (!paddle || !user) return;

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: user.email ? {
        email: user.email,
      } : undefined,
      customData: {
        userId: user.uid,
      },
      settings: {
        displayMode: "overlay",
        theme: "dark",
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 md:p-10 text-center shadow-2xl">

      {PADDLE_ENV.environment === 'sandbox' && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-700 dark:text-yellow-300 text-xs text-center">
          🧪 SANDBOX MODE - Testing with fake money
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          {showLimitMessage ? "Upgrade to Add More Jobs" : "Premium Access Required"}
        </div>

        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {showLimitMessage ? "You've Reached Your Free Plan Limit" : "Choose Your Plan"}
        </h2>

        {showLimitMessage && (
          <p className="text-lg text-muted-foreground mb-4 text-center">
            You&apos;re currently tracking {currentJobCount}/{FREE_PLAN_JOB_LIMIT} jobs. Upgrade to Pro for unlimited job tracking!
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mt-8">

          {/* === MONTHLY PLAN === */}
          <div
            className={`flex flex-col rounded-xl border transition-all duration-300 shadow-sm ${selectedPlan === 'monthly'
              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
              : "border-border bg-card hover:border-primary/50"
              } p-6 text-left`}
          >
            <h3 className="text-xl font-bold text-foreground mb-2">Monthly Plan</h3>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50 decoration-2">
                  $2.99
                </span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
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
              <button
                disabled={!paddle}
                onClick={() => {
                  setSelectedPlan('monthly');
                  setStatusMsg(null);
                  openCheckout(PADDLE_PRICES.monthly);
                }}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                Upgrade to Monthly <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* === LIFETIME PLAN === */}
          <div
            className={`relative flex flex-col rounded-xl border transition-all duration-300 shadow-md ${selectedPlan === 'lifetime'
              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
              : "border-primary/30 bg-card hover:border-primary/50"
              } p-6 text-left transform md:scale-105`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 rounded-full uppercase shadow-md">
              <Zap className="w-3 h-3 inline mr-1" /> Best Value
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">Lifetime Access</h3>
            <p className="text-sm text-muted-foreground mb-6">$7.99 one-time payment</p>

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
              <button
                disabled={!paddle}
                onClick={() => {
                  setSelectedPlan('lifetime');
                  setStatusMsg(null);
                  openCheckout(PADDLE_PRICES.lifetime);
                }}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Get Lifetime Access <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mt-6 w-full max-w-2xl animate-in slide-in-from-bottom-2">
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-md border ${statusMsg.type === 'success'
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
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
  );
}
"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditsBalance, CREDIT_PACKAGES, WEEKLY_CREDITS_BY_PLAN } from "@/lib/ai/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { isAdminUser } from "@/lib/supabase/subscriptions";

interface CreditsDisplayProps {
  credits: CreditsBalance | null;
  loading: boolean;
  plan: string;
  onPurchaseComplete: () => void;
}

function getNextMondayMidnightUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Resetting...";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function CreditsDisplay({ credits, loading, plan, onPurchaseComplete }: CreditsDisplayProps) {
  const { user } = useAuth();
  const [showPackages, setShowPackages] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSnap, setShowSnap] = useState(false);
  const [countdown, setCountdown] = useState<string>("");

  const isAdmin = isAdminUser(user?.email || "");
  const isOutOfCredits = !loading && credits && credits.total_credits <= 0 && !isAdmin;

  useEffect(() => {
    if (!isOutOfCredits) return;

    const updateCountdown = () => {
      const nextMonday = getNextMondayMidnightUTC();
      const diff = nextMonday.getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOutOfCredits]);

  if (loading || !credits) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg animate-pulse">
        <div className="w-16 h-3 bg-muted rounded" />
      </div>
    );
  }

  const weeklyAllocation = WEEKLY_CREDITS_BY_PLAN[plan] ?? 1;

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setPurchasing(pkg.id);
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/ai/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: pkg.id,
          currency: "IDR",
          customerDetails: {
            firstName: user?.displayName || "JobTracker",
            lastName: "User",
            email: user?.email || "",
            phone: "",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Purchase failed", { description: data.error || "Something went wrong." });
        return;
      }

      if (data.token && typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: () => {
            setShowSnap(false);
            toast.success("Credits added!", { description: "Your credits have been updated." });
            onPurchaseComplete();
          },
          onClose: () => {
            setShowSnap(false);
          },
        });
        setShowSnap(true);
      } else {
        toast.info("Payment initialized", { description: "Credits will be added after payment is confirmed." });
        onPurchaseComplete();
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Purchase failed", { description: "Something went wrong. Please try again." });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPackages(!showPackages)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg hover:bg-primary/15 transition-colors ${
              isOutOfCredits
                ? "border-amber-500/30 bg-amber-50 dark:bg-amber-900/10"
                : "border-primary/20 bg-primary/10"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isOutOfCredits ? "text-amber-500" : "text-primary"}`} />
            <span className={`text-sm font-semibold ${isOutOfCredits ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
              {isAdmin ? "∞" : credits.total_credits}
            </span>
            <span className="text-[11px] text-muted-foreground">credits</span>
            {showPackages ? (
              <ChevronUp className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
        {isOutOfCredits && countdown && (
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            <span>Resets in {countdown}</span>
          </div>
        )}
      </div>

      {showPackages && (
        <div className="w-full space-y-3">
          <p className="text-xs text-muted-foreground">
            {isAdmin ? "Unlimited credits · Admin" : `${weeklyAllocation} free credits/week · Resets every Monday`}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {CREDIT_PACKAGES.filter((p) => p.is_active).map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handlePurchase(pkg)}
                disabled={!!purchasing}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  pkg.id === "popular"
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                {pkg.id === "popular" && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold uppercase rounded-full">
                    Popular
                  </span>
                )}
                <span className="text-xl font-bold text-primary">{pkg.credits}</span>
                <span className="text-[11px] text-muted-foreground">credits</span>
                <span className="text-xs font-semibold text-foreground mt-1">
                  Rp{pkg.price_idr.toLocaleString("id-ID")}
                </span>
                {purchasing === pkg.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary mt-1" />
                ) : (
                  <span className="text-[10px] text-primary font-medium mt-1">Buy</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>Purchased credits never expire</span>
          </div>
        </div>
      )}

      <Dialog open={showSnap} onOpenChange={setShowSnap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
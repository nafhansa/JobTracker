"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Sparkles, Clock, Zap, Flame, Crown, ArrowLeft, Loader2, Check } from "lucide-react";
import { motion, useSpring, useTransform, Variants } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CoinsBalance, COIN_PACKAGES, WEEKLY_COINS_BY_PLAN, COINS_PER_GENERATION } from "@/lib/ai/types";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import { useRouter } from "next/navigation";
import { trackCheckoutStarted } from "@/lib/posthog/events";

const PACKAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "jalur-doa": Zap,
  "mulai-panik": Flame,
  "budak-korporat": Crown,
};

const PACKAGE_COLORS: Record<string, string> = {
  "jalur-doa": "from-blue-500 to-cyan-500",
  "mulai-panik": "from-violet-500 to-purple-500",
  "budak-korporat": "from-amber-400 to-orange-500",
};

function getNextResetTime(weeklyResetAt: string): Date {
  return new Date(weeklyResetAt);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Resetting...";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 300, damping: 30 });
  const display = useTransform(spring, (latest) => Math.round(latest));
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  return <motion.span className="tabular-nums">{display}</motion.span>;
}

// Fixed TypeScript error by explicitly typing as `Variants`
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface JpsShopSectionProps {
  userId: string;
  onNavigateBack?: () => void;
}

export default function JpsShopSection({ userId, onNavigateBack }: JpsShopSectionProps) {
  const { user, subscription } = useAuth();
  const router = useRouter();
  const isAdmin = isAdminUser(user?.email || "");
  const isSubscribed = isAdmin || checkIsPro(subscription);
  const plan = !isSubscribed ? "free" : (subscription?.plan || "free");

  const [coins, setCoins] = useState<CoinsBalance | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSnap, setShowSnap] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const snapLoadAttempted = useRef(false);

  const loadMidtransScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.snap) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
      script.onload = () => {
        setTimeout(() => {
          if (window.snap) resolve();
          else reject(new Error("Snap SDK failed to initialize"));
        }, 300);
      };
      script.onerror = () => reject(new Error("Failed to load payment SDK"));
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (!snapLoadAttempted.current) {
      snapLoadAttempted.current = true;
      loadMidtransScript().catch(() => {});
    }
  }, [loadMidtransScript]);

  const weeklyAllocation = WEEKLY_COINS_BY_PLAN[plan] ?? 240;
  const weeklyGenerates = Math.floor(weeklyAllocation / COINS_PER_GENERATION);
  const isOutOfCoins = !loadingCoins && coins && coins.total_coins < COINS_PER_GENERATION && !isAdmin;

  const fetchCoins = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
      }
    } catch (err) {
      console.error("Failed to fetch coins:", err);
    } finally {
      setLoadingCoins(false);
    }
  }, [user]);

  const verifyPurchase = useCallback(async (orderId: string, pkg: typeof COIN_PACKAGES[0]) => {
    const maxAttempts = 5;
    const delay = 3000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const token = await user?.getIdToken();
        if (!token) break;

        const res = await fetch("/api/payment/midtrans/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data.success && data.type === "coin_purchase") {
          toast.success("JPs added!", { description: `${pkg.coins.toLocaleString("id-ID")} Job Points have been added to your account.` });
          fetchCoins();
          return;
        }

        if (data.success && data.message === "Already processed") {
          toast.success("JPs added!", { description: `${pkg.coins.toLocaleString("id-ID")} Job Points have been added to your account.` });
          fetchCoins();
          return;
        }

        if (!data.success && data.transaction_status && data.transaction_status !== "settlement" && data.transaction_status !== "capture") {
          // Payment not settled yet, retry
        }
      } catch (err) {
        console.error(`Verify attempt ${attempt} failed:`, err);
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All attempts exhausted — check balance anyway
    await fetchCoins();
    toast.info("Verifying purchase", { description: "Your JPs will be added shortly. If not, please refresh the page." });
  }, [user, fetchCoins]);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  useEffect(() => {
    if (!coins) return;
    const updateCountdown = () => {
      const resetTime = getNextResetTime(coins.weekly_reset_at);
      const diff = resetTime.getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [coins]);

  const handlePurchase = async (pkg: typeof COIN_PACKAGES[0]) => {
    setPurchasing(pkg.id);
    trackCheckoutStarted(pkg.name, pkg.price_idr);
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

      if (data.token) {
        try {
          await loadMidtransScript();
        } catch {
          toast.error("Failed to load payment gateway", { description: "Please refresh the page and try again." });
          return;
        }

        if (!window.snap) {
          toast.error("Payment gateway not available", { description: "Please refresh the page and try again." });
          return;
        }

        setShowSnap(true);
        window.snap.pay(data.token, {
          onSuccess: () => {
            setShowSnap(false);
            toast.success("Payment successful!", { description: "Verifying your purchase..." });
            // Poll for verification since webhook may not arrive instantly
            verifyPurchase(data.orderId, pkg);
          },
          onClose: () => {
            setShowSnap(false);
          },
        });
      } else {
        toast.info("Payment initialized", { description: "JPs will be added after payment is confirmed." });
        fetchCoins();
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Purchase failed", { description: "Something went wrong. Please try again." });
    } finally {
      setPurchasing(null);
    }
  };

  const displayTotal = coins ? coins.total_coins : 0;
  const planLabel = plan === "lifetime" ? "Lifetime Pro" : plan === "monthly" ? "Monthly Pro" : "Free";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      // Expanded to max-w-6xl to better utilize desktop width
      className="max-w-6xl mx-auto space-y-12 pt-20 pb-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="relative flex flex-col items-center text-center space-y-4">
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="absolute left-0 top-1 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Get More JPs
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Job Points power your AI-generated cover letters and outreach messages.
          Each generation costs <strong className="text-foreground">{COINS_PER_GENERATION} JPs</strong>.
        </p>
      </motion.div>

      {/* Top Section: Balance & Allocation side-by-side */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="absolute -top-6 -right-6 p-6 opacity-5 pointer-events-none">
            <Sparkles className="w-40 h-40 text-primary" />
          </div>
          
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Your Balance</p>
          <div className="flex items-baseline gap-2 mb-6">
            {loadingCoins ? (
              <div className="w-32 h-12 bg-muted animate-pulse rounded-lg" />
            ) : (
              <span className="text-6xl font-black text-foreground tracking-tight">
                {isAdmin ? "∞" : <AnimatedNumber value={displayTotal} />}
              </span>
            )}
            <span className="text-2xl text-muted-foreground font-medium">JPs</span>
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-6 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weekly JPs</p>
              <p className="text-base font-semibold text-foreground">
                {isAdmin ? "∞" : coins?.weekly_coins ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Purchased JPs</p>
              <p className="text-base font-semibold text-foreground">
                {coins?.purchased_coins ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <p className="text-base font-semibold text-foreground">{planLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {isOutOfCoins ? "Resets in" : "Weekly reset"}
              </p>
              <p className={`text-base font-semibold ${isOutOfCoins ? "text-amber-500 animate-pulse" : "text-foreground"}`}>
                {countdown || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Plan comparison Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">Weekly Allocation</h3>
            <div className="space-y-3">
              {[
                { plan: "Free", jps: 240, generates: 3, current: plan === "free" },
                { plan: "Monthly Pro", jps: 400, generates: 5, current: plan === "monthly" },
                { plan: "Lifetime Pro", jps: 400, generates: 5, current: plan === "lifetime" },
              ].map((row) => (
                <div
                  key={row.plan}
                  className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors ${
                    row.current ? "bg-primary/10 border border-primary/20 shadow-sm" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {row.current ? (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-6 h-6" />
                    )}
                    <span className={`text-sm font-semibold ${row.current ? "text-primary" : "text-foreground"}`}>
                      {row.plan}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="text-base font-bold text-foreground">{row.jps} <span className="text-xs font-normal text-muted-foreground">JPs</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {!isSubscribed && (
            <button
              onClick={() => router.push("/pricing")}
              className="w-full mt-6 py-3 px-4 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </motion.div>

      {/* Bottom Section: Top Up Packages */}
      <motion.div variants={itemVariants} className="space-y-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Buy More JPs</h2>
          <p className="text-sm text-muted-foreground mt-1">One-time purchase. JPs never expire.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {COIN_PACKAGES.filter((p) => p.is_active).map((pkg) => {
            const Icon = PACKAGE_ICONS[pkg.id] || Zap;
            const colorClass = PACKAGE_COLORS[pkg.id] || "from-gray-500 to-gray-600";
            const generates = Math.floor(pkg.coins / COINS_PER_GENERATION);
            const remaining = pkg.coins - generates * COINS_PER_GENERATION;
            const isBestValue = pkg.id === "mulai-panik";

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl border bg-card p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  isBestValue ? "border-primary shadow-md scale-100 md:scale-105 z-10" : "border-border shadow-sm"
                }`}
              >
                {isBestValue && (
                  <span className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-full shadow-md">
                    Best Value
                  </span>
                )}
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-6 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-4xl font-extrabold text-foreground">{pkg.coins.toLocaleString("id-ID")}</span>
                    <span className="text-base font-semibold text-muted-foreground">JPs</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Good for <strong className="text-foreground">{generates}x generate</strong>
                    
                  </p>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={!!purchasing}
                  className={`w-full mt-8 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isBestValue 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {purchasing === pkg.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Rp ${pkg.price_idr.toLocaleString("id-ID")}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-4">
          <Check className="w-3.5 h-3.5" /> All prices are in IDR. Payment powered securely by Midtrans.
        </p>
      </motion.div>

      {/* Processing Overlay */}
      <Dialog open={showSnap} onOpenChange={setShowSnap}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Please complete the payment in the popup...</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
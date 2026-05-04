"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreditsBalance, CREDIT_PACKAGES } from "@/lib/ai/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { WEEKLY_CREDITS_BY_PLAN } from "@/lib/ai/types";

interface CreditsDisplayProps {
  credits: CreditsBalance | null;
  loading: boolean;
  plan: string;
  onPurchaseComplete: () => void;
}

export default function CreditsDisplay({ credits, loading, plan, onPurchaseComplete }: CreditsDisplayProps) {
  const { user } = useAuth();
  const [showPackages, setShowPackages] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSnap, setShowSnap] = useState(false);

  if (loading || !credits) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        Loading credits...
      </div>
    );
  }

  const weeklyAllocation = WEEKLY_CREDITS_BY_PLAN[plan] ?? 1;
  const planLabel = plan === "lifetime" ? "Lifetime" : plan === "monthly" ? "Pro" : "Free";

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
        alert(data.error || "Purchase failed");
        return;
      }

      if (data.token && typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: () => {
            setShowSnap(false);
            onPurchaseComplete();
          },
          onClose: () => {
            setShowSnap(false);
          },
        });
        setShowSnap(true);
      } else {
        alert("Payment initialized. Credits will be added after payment is confirmed.");
        onPurchaseComplete();
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {credits.total_credits} credits
          </span>
          <span className="text-xs text-muted-foreground">
            ({credits.weekly_credits} weekly + {credits.purchased_credits} purchased)
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPackages(!showPackages)}
          className="flex items-center gap-1"
        >
          <CreditCard className="w-3 h-3" />
          Buy Credits
          {showPackages ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {showPackages && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="text-xs text-muted-foreground col-span-full">
            {planLabel} plan: {weeklyAllocation} free credits/week · Resets every Monday
          </div>
          {CREDIT_PACKAGES.filter((p) => p.is_active).map((pkg) => (
            <Card key={pkg.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handlePurchase(pkg)}>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-bold text-primary">{pkg.credits}</div>
                <div className="text-sm font-medium text-foreground mt-1">credits</div>
                <div className="text-xs text-muted-foreground mt-1">{pkg.name}</div>
                <div className="text-sm font-semibold text-foreground mt-2">
                  Rp{pkg.price_idr.toLocaleString("id-ID")}
                </div>
                {purchasing === pkg.id ? (
                  <Loader2 className="w-4 h-4 mx-auto mt-2 animate-spin" />
                ) : (
                  <Button size="sm" className="mt-2 w-full" variant="default">
                    Buy {pkg.credits} Credits
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
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
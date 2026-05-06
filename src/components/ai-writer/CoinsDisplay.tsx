"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { CoinsBalance, COINS_PER_GENERATION } from "@/lib/ai/types";
import { useAuth } from "@/lib/firebase/auth-context";
import { isAdminUser } from "@/lib/supabase/subscriptions";
import Link from "next/link";

interface CoinsDisplayProps {
  coins: CoinsBalance | null;
  loading: boolean;
  plan: string;
  onPurchaseComplete?: () => void;
  stacked?: boolean;
}

function getNextResetTime(weeklyResetAt: string): Date {
  return new Date(weeklyResetAt);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Resetting...";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
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

export default function CoinsDisplay({ coins, loading, plan, stacked = false }: CoinsDisplayProps) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<string>("");

  const isAdmin = isAdminUser(user?.email || "");
  const isOutOfCoins = !loading && coins && coins.total_coins < COINS_PER_GENERATION && !isAdmin;
  const displayTotal = coins ? coins.total_coins : 0;

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

  if (loading || !coins) {
    if (stacked) {
      return (
        <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 bg-muted/50 rounded-lg animate-pulse">
          <div className="w-12 h-3 bg-muted rounded" />
          <div className="w-16 h-2.5 bg-muted rounded" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg animate-pulse">
        <div className="w-20 h-3 bg-muted rounded" />
      </div>
    );
  }

  const coinCount = (
    <>
      <Sparkles className={`w-3.5 h-3.5 ${isOutOfCoins ? "text-amber-500" : "text-primary"}`} />
      <span className="font-semibold">
        {isAdmin ? "∞" : <AnimatedNumber value={displayTotal} />}
      </span>
      <span className="text-[11px] text-muted-foreground">JPs</span>
      {isOutOfCoins && countdown && (
        <span className="text-[10px] text-amber-600 dark:text-amber-400">{countdown}</span>
      )}
    </>
  );

  const getMoreLabel = (
    <span className={`text-[10px] font-semibold leading-tight ${isOutOfCoins ? "text-amber-600 dark:text-amber-300" : "text-primary"}`}>
      Get More JPs
    </span>
  );

  if (stacked) {
    return (
      <Link
        href="/jps-shop"
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
          isOutOfCoins
            ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
            : "bg-primary/10 border border-primary/20 text-foreground hover:bg-primary/15"
        }`}
      >
        <span className="flex items-center gap-1">{coinCount}</span>
        {getMoreLabel}
      </Link>
    );
  }

  return (
    <Link
      href="/jps-shop"
      className={`flex items-center gap-0 px-1 py-0 rounded-lg transition-all text-sm font-medium overflow-hidden ${
        isOutOfCoins
          ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
          : "bg-primary/10 border border-primary/20 text-foreground hover:bg-primary/15"
      }`}
    >
      <span className="flex items-center gap-1.5 px-2 py-1.5">
        {coinCount}
      </span>
      <span className={`border-l ${isOutOfCoins ? "border-amber-500/30" : "border-primary/20"} px-2 py-1.5 text-xs font-medium ${isOutOfCoins ? "text-amber-600 dark:text-amber-300" : "text-primary"}`}>
        Get More JPs
      </span>
    </Link>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { CoinsBalance } from "@/lib/ai/types";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import CoinsDisplay from "./CoinsDisplay";

interface MobileCoinsProps {
  userId: string;
}

export default function MobileCoins({ userId }: MobileCoinsProps) {
  const { user, subscription } = useAuth();
  const isAdmin = isAdminUser(user?.email || "");
  const isSubscribed = isAdmin || checkIsPro(subscription);
  const plan = !isSubscribed ? "free" : (subscription?.plan || "free");
  const [coins, setCoins] = useState<CoinsBalance | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  return <CoinsDisplay coins={coins} loading={loading} plan={plan} stacked />;
}
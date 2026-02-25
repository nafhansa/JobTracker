"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";
import { checkIsPro } from "./subscription";
import { syncFirebaseUserToSupabase } from "./sync-to-supabase";

interface SubscriptionData {
  plan?: string;
  status?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  isPro: boolean;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
  reloadSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: null,
  isPro: false,
  updatedAt: null,
  createdAt: null,
  reloadSubscription: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | string | null>(null);
  
  const isPro = checkIsPro(subscription);

  const reloadSubscription = async () => {
    if (!user) {
      console.log('reloadSubscription: No user found');
      return;
    }

    console.log('reloadSubscription: Fetching subscription for user:', user.uid);

    try {
      const { supabase } = await import("@/lib/supabase/client");

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
        .eq('user_id', user.uid)
        .maybeSingle();

      console.log('reloadSubscription: Subscription result:', { subscriptionData, subscriptionError });

      if (subscriptionData && !subscriptionError) {
        console.log('reloadSubscription: Setting subscription to:', subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log('reloadSubscription: No subscription data found, setting to free');
        setSubscription({ plan: "free", status: "active" });
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status, is_pro, updated_at, created_at')
        .eq('id', user.uid)
        .single();

      if (userData && !userError) {
        setUpdatedAt((userData as any)?.updated_at || null);
      } else {
        setUpdatedAt(null);
      }
    } catch (error) {
      console.error("Failed to reload subscription:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync Firebase user to Supabase (dual storage)
        await syncFirebaseUserToSupabase(user);
        
        // Get subscription from Supabase instead of Firestore (bypass permission issues)
        try {
          const { supabase } = await import("@/lib/supabase/client");

          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
            .eq('user_id', user.uid)
            .maybeSingle();

          if (subscriptionData && !subscriptionError) {
            console.log('Subscription data found:', subscriptionData);
            setSubscription(subscriptionData);
          } else {
            console.log('No subscription found, setting to free');
            setSubscription({ plan: "free", status: "active" });
          }

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_plan, subscription_status, is_pro, updated_at, created_at')
            .eq('id', user.uid)
            .single();

          if (userData && !userError) {
            setUpdatedAt((userData as any)?.updated_at || null);
          } else {
            setUpdatedAt(null);
          }
        } catch (error) {
          console.error("Supabase subscription fetch failed:", error);
          setSubscription({ plan: "free", status: "active" });
          setUpdatedAt(null);
        }
      } else {
        setSubscription(null);
        setUpdatedAt(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading, subscription, isPro, updatedAt, reloadSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
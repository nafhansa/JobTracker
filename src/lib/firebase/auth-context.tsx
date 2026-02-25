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
    if (!user) return;

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status, is_pro, updated_at, created_at')
        .eq('id', user.uid)
        .single();

      if (data && !error) {
        const subscriptionData = {
          plan: (data as any)?.subscription_plan || 'free',
          status: (data as any)?.subscription_status || 'active',
          is_pro: (data as any)?.is_pro || false,
        };
        setSubscription(subscriptionData);
        setUpdatedAt((data as any)?.updated_at || null);
      } else {
        setSubscription({ plan: "free", status: "active" });
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
          const { data, error } = await supabase
            .from('users')
            .select('subscription_plan, subscription_status, is_pro, updated_at, created_at')
            .eq('id', user.uid)
            .single();

          if (data && !error) {
            const subscriptionData = {
              plan: (data as any)?.subscription_plan || 'free',
              status: (data as any)?.subscription_status || 'active',
              is_pro: (data as any)?.is_pro || false,
            };
            setSubscription(subscriptionData);
            setUpdatedAt((data as any)?.updated_at || null);
          } else {
            setSubscription({ plan: "free", status: "active" });
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
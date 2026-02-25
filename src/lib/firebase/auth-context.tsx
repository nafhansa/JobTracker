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
      } else if (subscriptionError) {
        console.error('reloadSubscription: Subscription fetch error:', subscriptionError);
      } else {
        console.log('reloadSubscription: No subscription data found in database');
      }

      // Fetch user data for updated_at (separate from subscription)
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

        // Get subscription from Supabase subscriptions table
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
          } else if (subscriptionError) {
            console.error('Subscription fetch error:', subscriptionError);
          } else {
            console.log('No subscription found, setting to free');
            setSubscription({ plan: "free", status: "active" });
          }
        } catch (error) {
          console.error("Failed to fetch subscription:", error);
          // DON'T reset to free on error - keep existing subscription state
        }

        // Fetch user data for updated_at only (not subscription)
        try {
          const { supabase } = await import("@/lib/supabase/client");
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_plan, subscription_status, is_pro, updated_at, created_at')
            .eq('id', user.uid)
            .single();

          if (userData && !userError) {
            setUpdatedAt((userData as any)?.updated_at || null);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      } else {
        // User logged out
        setSubscription(null);
        setUpdatedAt(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for subscription update events (from payment page)
  useEffect(() => {
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      const subscriptionData = event.detail;
      console.log('Subscription update event received:', subscriptionData);
      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate as EventListener);

    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate as EventListener);
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading, subscription, isPro, updatedAt, reloadSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const forceReloadSubscription = async () => {
  try {
    const { supabase } = await import("@/lib/supabase/client");
    const auth = (await import("./config")).auth;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('forceReloadSubscription: No authenticated user');
      return false;
    }

    const userId = currentUser.uid;

    console.log('forceReloadSubscription: Fetching subscription for user:', userId);

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('forceReloadSubscription: Subscription result:', { subscriptionData, subscriptionError });

    if (subscriptionData && !subscriptionError) {
      console.log('forceReloadSubscription: Successfully loaded subscription:', subscriptionData);
      // Find the context and update it via a custom event
      window.dispatchEvent(new CustomEvent('subscription-updated', { detail: subscriptionData }));
      return true;
    } else {
      console.log('forceReloadSubscription: No subscription found or error');
      return false;
    }
  } catch (error) {
    console.error('Failed to force reload subscription:', error);
    return false;
  }
};

export const fetchAndSetSubscription = async (userId: string) => {
  try {
    const { supabase } = await import("@/lib/supabase/client");

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('fetchAndSetSubscription: Subscription result:', { subscriptionData, subscriptionError });

    if (subscriptionData && !subscriptionError) {
      console.log('fetchAndSetSubscription: Setting subscription to:', subscriptionData);
      return {
        success: true,
        subscription: subscriptionData
      };
    } else if (subscriptionError) {
      console.error('fetchAndSetSubscription: Subscription fetch error:', subscriptionError);
      return {
        success: false,
        subscription: null
      };
    } else {
      console.log('fetchAndSetSubscription: No subscription found');
      return {
        success: false,
        subscription: null
      };
    }
  } catch (error) {
    console.error("Failed to fetch and set subscription:", error);
    return {
      success: false,
      subscription: null
    };
  }
};

export const reloadSubscriptionFromServer = async (userId: string) => {
  try {
    const { supabase } = await import("@/lib/supabase/client");

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Manual reloadSubscription: Subscription result:', { subscriptionData, subscriptionError });

    if (subscriptionData && !subscriptionError) {
      return {
        success: true,
        subscription: subscriptionData
      };
    } else if (subscriptionError) {
      console.error('Manual reloadSubscription: Subscription fetch error:', subscriptionError);
      return {
        success: false,
        subscription: null
      };
    } else {
      console.log('Manual reloadSubscription: No subscription found in database');
      return {
        success: false,
        subscription: null
      };
    }
  } catch (error) {
    console.error("Failed to reload subscription:", error);
    return {
      success: false,
      subscription: null
    };
  }
};
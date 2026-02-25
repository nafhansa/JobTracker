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
          } else {
            console.log('No subscription found, setting to free');
            setSubscription({ plan: "free", status: "active" });
          }
        } catch (error) {
          console.error("Supabase subscription fetch failed:", error);
          setSubscription({ plan: "free", status: "active" });
          setUpdatedAt(null);
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
      console.log('Current subscription state before update:', subscription);

      if (subscriptionData) {
        console.log('Setting subscription to:', subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log('Received null subscription data, keeping current state');
      }
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate as EventListener);

    console.log('Subscription update listener attached');

    return () => {
      console.log('Removing subscription update listener');
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
    const { auth } = await import("./config");
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('forceReloadSubscription: No authenticated user found');
      return false;
    }

    const userId = currentUser.uid;
    const userEmail = currentUser.email;
    const userDisplayName = currentUser.displayName;

    console.log('=== FORCE RELOAD SUBSCRIPTION ===');
    console.log('Current User Firebase UID:', userId);
    console.log('Current User Email:', userEmail);
    console.log('Current User Display Name:', userDisplayName);

    const { supabase } = await import("@/lib/supabase/client");

    // Add delay to ensure database is updated
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Force reload: Starting database query...');

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, midtrans_subscription_id, renews_at, ends_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Force reload: Database query result:', {
      subscriptionData,
      subscriptionError
    });

    if (subscriptionData && !subscriptionError) {
      console.log('Force reload: Subscription FOUND for user:', userId);
      console.log('Force reload: Subscription details:', subscriptionData);
      console.log('Force reload: Dispatching subscription-updated event');

      const event = new CustomEvent('subscription-updated', {
        detail: subscriptionData,
        bubbles: true,
        cancelable: true
      });

      window.dispatchEvent(event);

      console.log('Force reload: Event dispatched successfully');

      return {
        success: true,
        subscription: subscriptionData
      };
    } else if (subscriptionError) {
      console.error('Force reload: Subscription fetch error:', subscriptionError);
      console.error('Force reload: Error details:', {
        message: subscriptionError.message,
        details: subscriptionError.details,
        hint: subscriptionError.hint,
        code: subscriptionError.code
      });
      return {
        success: false,
        error: subscriptionError.message
      };
    } else {
      console.warn('Force reload: No subscription found in database for user:', userId);
      console.warn('Force reload: Will NOT dispatch event - keeping current state');
      return {
        success: false,
        error: 'No subscription found'
      };
    }
  } catch (error) {
    console.error('Force reload: Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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
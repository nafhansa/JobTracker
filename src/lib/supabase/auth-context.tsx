'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { getSubscription, checkIsPro, SubscriptionData } from './subscriptions';
import { ensureFreePlan } from './subscriptions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  isPro: boolean;
  updatedAt: Date | string | null;
  createdAt: Date | string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: null,
  isPro: false,
  updatedAt: null,
  createdAt: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | string | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | string | null>(null);

  // Calculate isPro based on subscription
  const isPro = checkIsPro(subscription);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscription(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Ensure free plan is assigned
        await ensureFreePlan(currentUser.id, currentUser.email || undefined);
        await loadSubscription(currentUser.id);
      } else {
        setSubscription(null);
        setUpdatedAt(null);
        setCreatedAt(null);
        setLoading(false);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const loadSubscription = async (userId: string) => {
    try {
      const subData = await getSubscription(userId);
      setSubscription(subData?.subscription || null);
      setUpdatedAt(subData?.updatedAt || null);
      setCreatedAt(subData?.createdAt || null);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, subscription, isPro, updatedAt, createdAt }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

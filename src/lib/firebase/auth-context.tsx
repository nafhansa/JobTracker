"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";
import { getSubscription, checkIsPro, ensureFreePlan } from "./subscription"; // 👈 Import helper tadi

interface SubscriptionData {
  plan?: string;
  status?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  isPro: boolean; // 👈 Tambah field ini
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: null,
  isPro: false, // Default false
  updatedAt: null,
  createdAt: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | string | null>(null);
  
  // State isPro kita hitung berdasarkan subscription
  const isPro = checkIsPro(subscription); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Ensure free plan is assigned if user doesn't have subscription
        await ensureFreePlan(user.uid);
        
        const sub = await getSubscription(user.uid);
        setSubscription(sub?.subscription || null);
        setUpdatedAt(sub?.updatedAt || null);
        setCreatedAt(sub?.createdAt || null);
      } else {
        setSubscription(null);
        setUpdatedAt(null);
        setCreatedAt(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    // Masukkan isPro ke dalam value provider
    <AuthContext.Provider value={{ user, loading, subscription, isPro, updatedAt }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
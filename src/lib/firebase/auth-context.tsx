"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";
import { getSubscription, checkIsPro } from "./subscription"; // 👈 Import helper tadi

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: any;
  isPro: boolean; // 👈 Tambah field ini
  updatedAt?: any;
  createdAt?: any;
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
  const [subscription, setSubscription] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  
  // State isPro kita hitung berdasarkan subscription
  const isPro = checkIsPro(subscription); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AUTH STATE CHANGED, User:', user?.email);
      setUser(user);
      if (user) {
        const sub = await getSubscription(user.uid);
        console.log('🔥 FULL USER DOC:', sub); // 👈 Debug: lihat seluruh doc
        console.log('🔥 SUBSCRIPTION FIELD:', sub?.subscription); // 👈 Debug: subscription map
        console.log('🔥 UPDATED AT FIELD:', sub?.updatedAt); 
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
  
   console.log('🔥 CONTEXT STATE:', { user, subscription, updatedAt, isPro }); 
  return (
    // Masukkan isPro ke dalam value provider
    <AuthContext.Provider value={{ user, loading, subscription, isPro, updatedAt }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
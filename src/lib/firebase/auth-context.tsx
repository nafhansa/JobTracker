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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: null,
  isPro: false, // Default false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  
  // State isPro kita hitung berdasarkan subscription
  const isPro = checkIsPro(subscription); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const sub = await getSubscription(user.uid);
        setSubscription(sub);
      } else {
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    // Masukkan isPro ke dalam value provider
    <AuthContext.Provider value={{ user, loading, subscription, isPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
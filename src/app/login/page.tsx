// /home/nafhan/Documents/projek/job/src/app/login/page.tsx
"use client";

import { loginWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
import { useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter(); 
  
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const deviceInfo = getDeviceInfo();

      const user = await loginWithGoogle();
      if (user) {
        // Track login attempt AFTER successful login (so we have email)
        try {
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              type: "login",
              userId: user.uid,
              userEmail: user.email || undefined,
              sessionId,
              deviceInfo,
            }),
          });
        } catch (error) {
          console.error("Failed to track login attempt:", error);
        }

        // Track dashboard visit after successful login
        try {
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              type: "dashboard", 
              userId: user.uid,
              userEmail: user.email || undefined,
              sessionId,
              deviceInfo,
            }),
          });
        } catch (error) {
          console.error("Failed to track dashboard visit:", error);
        }
      }
      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      alert("Gagal login bro"); 
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md px-6">
        
        <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </Link>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 text-center relative overflow-hidden group">  
            <h2 className="text-3xl font-bold tracking-wider mb-2 text-foreground">
                Job<span className="text-primary">Tracker</span>.
            </h2>
            <p className="text-muted-foreground text-sm mb-8 font-normal">
                Manage your professional journey with confidence.
            </p>
            <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-foreground border border-border px-6 py-4 rounded-lg font-semibold tracking-wide hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
            </button>
            <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
        </div>
      </div>
    </div>
  );
}
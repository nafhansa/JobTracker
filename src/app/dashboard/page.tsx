// /home/nafhan/Documents/projek/job/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { logout } from "@/lib/firebase/auth";
import { subscribeToJobs } from "@/lib/firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { JobApplication, FREE_PLAN_JOB_LIMIT } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react"; 
import { checkIsPro, isAdminUser } from "@/lib/firebase/subscription";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

import DashboardClient from "@/components/tracker/DashboardClient";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionInfo } from "@/components/SubscriptionInfo";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics"; 

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, subscription } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Logic: User dianggap "subscribed" jika dia ADMIN atau checkIsPro true (grace period, active, lifetime)
  const isAdmin = isAdminUser(user?.email || "");
  const isSubscribed = isAdmin || checkIsPro(subscription);
  
  // Check if user has free plan
  const plan = subscription?.plan || "free";
  const isFreeUser = plan === "free" && !isAdmin && !isSubscribed;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Track dashboard visit
  useEffect(() => {
    if (user && !authLoading) {
      const trackDashboard = async () => {
        try {
          const sessionId = getOrCreateSessionId();
          const deviceInfo = getDeviceInfo();
          
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
      };
      trackDashboard();
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Load jobs for all authenticated users (including free users)
    if (user) {
      const unsubscribeDocs = subscribeToJobs(user.uid, (data) => {
        const sanitizedData = data.map((job) => ({
          ...job,
          createdAt: job.createdAt ? (job.createdAt as unknown as Timestamp).toMillis() : Date.now(),
          updatedAt: job.updatedAt ? (job.updatedAt as unknown as Timestamp).toMillis() : Date.now(),
        }));
        setJobs(sanitizedData as unknown as JobApplication[]);
        setLoading(false);
      });
      return () => unsubscribeDocs();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground">
      {/* Navbar */}
      <nav className="relative z-30 border-b border-border bg-background/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl tracking-widest text-foreground transition-colors">
            Job<span className="text-primary">Tracker</span>.
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t("dashboard.admin")}
            </Button>
          )}
          <span className="hidden md:inline text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors">
            {user.email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("dashboard.logout")}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto p-6 md:py-10">
        
        <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {t("dashboard.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("dashboard.subtitle")}
            </p>
        </div>

        {/* Info Langganan (muncul untuk semua users yang bukan admin) */}
        {(subscription && !isAdmin) && (
          <div className="mb-8">
            <SubscriptionInfo />
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-card border border-border rounded-xl" />
            ))}
          </div>
        ) : isSubscribed || isFreeUser ? (
          <>
            {isFreeUser && jobs.length >= FREE_PLAN_JOB_LIMIT && (
              <div className="mb-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-yellow-700 font-semibold mb-1">Job limit reached!</p>
                    <p className="text-muted-foreground text-sm">You&apos;ve reached the limit of {FREE_PLAN_JOB_LIMIT} jobs on the Free Plan.</p>
                  </div>
                  <Button
                    onClick={() => router.push("/upgrade")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Upgrade to Pro Now
                  </Button>
                </div>
              </div>
            )}
            <DashboardClient initialJobs={jobs} userId={user.uid} plan={plan} />
          </>
        ) : (
          <SubscriptionBanner />
        )}
      </main>
    </div>
  );
}
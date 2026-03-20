"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { logout } from "@/lib/firebase/auth";
import { JobApplication, FREE_PLAN_JOB_LIMIT } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, LogOut } from "lucide-react";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

import DashboardLayout from "@/components/DashboardLayout";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionInfo } from "@/components/SubscriptionInfo";
import GmailConnect from "@/components/GmailConnect";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
import { subscribeToJobs as supabaseSubscribeToJobs } from "@/lib/supabase/jobs";
import { clearTutorialState } from "@/lib/tutorial/context";

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
    if (user) {
      let unsubscribe: (() => void) | undefined;

      // Always use Supabase for jobs
      const channel = supabaseSubscribeToJobs(user.uid, (data) => {
        setJobs(data);
        setLoading(false);
      });
      unsubscribe = () => {
        channel.unsubscribe();
      };

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user]);

  const handleLogout = async () => {
    if (user?.uid) {
      clearTutorialState(user.uid);
    }
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
      {/* NAVBAR - Desktop Only */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-[60] border-b border-border bg-background/95 dark:bg-card/95 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 shadow-md">
        <div className="flex items-center justify-between w-full mx-auto">
          
          {/* Sisi Kiri: Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <h1 className="font-bold text-lg md:text-xl tracking-wider md:tracking-widest text-foreground transition-colors">
              Job<span className="text-primary">Tracker</span>.
            </h1>
          </div>

          {/* Sisi Kanan: All Controls & Info */}
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <LanguageToggle />

            <div className="h-4 w-[1px] bg-border mx-1" />

            {isFreeUser && (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/upgrade")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-4 h-9 font-bold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Upgrade</span>
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors px-3 h-9"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span className="text-xs">{t("dashboard.admin")}</span>
              </Button>
            )}

            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase truncate max-w-[200px] px-2">
              {user?.email}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-foreground hover:text-destructive hover:bg-destructive/10 border border-border hover:border-destructive/50 transition-colors px-3 h-9"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-xs">{t("dashboard.logout")}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {loading ? (
        <main className="relative z-10 w-full p-4 md:p-6 md:py-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 md:h-56 bg-card border border-border rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      ) : isSubscribed || isFreeUser ? (
        <DashboardLayout jobs={jobs} userId={user.uid} plan={plan} />
      ) : (
        <main className="relative z-10 w-full p-4 md:p-6 md:py-10">
          <div className="max-w-6xl mx-auto">
            <SubscriptionBanner />
          </div>
        </main>
      )}
    </div>
  );
}
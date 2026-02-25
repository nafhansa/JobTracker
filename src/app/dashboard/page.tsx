"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { logout } from "@/lib/firebase/auth";
import { JobApplication, FREE_PLAN_JOB_LIMIT } from "@/types";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles, ShieldCheck, LogOut } from "lucide-react";
import { checkIsPro, isAdminUser } from "@/lib/supabase/subscriptions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

import DashboardLayout from "@/components/DashboardLayout";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionInfo } from "@/components/SubscriptionInfo";
import GmailConnect from "@/components/GmailConnect";
import SettingsDrawer from "@/components/SettingsDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
import { subscribeToJobs as supabaseSubscribeToJobs } from "@/lib/supabase/jobs";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, subscription } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    setIsSettingsOpen(false);
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
      {/* NAVBAR - Simplified for mobile */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 dark:bg-card/95 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 shadow-md">
        <div className="flex items-center justify-between gap-4 max-w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <h1 className="font-bold text-lg md:text-xl tracking-wider md:tracking-widest text-foreground transition-colors">
              Job<span className="text-primary">Tracker</span>.
            </h1>
          </div>

          {/* Right Side - Mobile shows Theme+Lang+Menu, Desktop shows all */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Mobile - Theme and Language Always Visible */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            {/* Desktop - Show all settings */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />

              {/* Upgrade Button for Free Users - Desktop */}
              {isFreeUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/upgrade")}
                  className="bg-blue-600 text-white hover:bg-blue-700 border-none transition-all px-4 h-9 font-bold shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Upgrade</span>
                </Button>
              )}

              {/* Admin Button - Desktop */}
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

              {/* Email - Desktop */}
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors truncate max-w-[150px]">
                {user?.email}
              </span>

              {/* Logout Button - Desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors px-3 h-9"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-xs">{t("dashboard.logout")}</span>
              </Button>
            </div>

            {/* Mobile Only - Hamburger for Settings Drawer */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Settings Drawer - Mobile Only */}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

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
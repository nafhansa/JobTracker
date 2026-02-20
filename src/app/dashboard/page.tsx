// FIXED VERSION - src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { logout } from "@/lib/firebase/auth";
import { JobApplication, FREE_PLAN_JOB_LIMIT } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { checkIsPro, isAdminUser } from "@/lib/firebase/subscription";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

import DashboardClient from "@/components/tracker/DashboardClient";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionInfo } from "@/components/SubscriptionInfo";
import GmailConnect from "@/components/GmailConnect";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
import { subscribeToJobs as supabaseSubscribeToJobs } from "@/lib/supabase/jobs";

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

  // Debug: print user uid to console so developer can verify in browser
  useEffect(() => {
    console.log('🔑 MY UID:', user?.uid);
  }, [user]);

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
      {/* FIXED NAVBAR - Responsive untuk mobile */}
      <nav className="relative z-30 border-b border-border bg-background/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 px-3 md:px-6 py-3 md:py-4 shadow-md">
        <div className="flex items-center justify-between gap-2 max-w-full">
          {/* Logo - Lebih kecil di mobile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <h1 className="font-bold text-base md:text-xl tracking-wider md:tracking-widest text-foreground transition-colors">
              Job<span className="text-primary">Tracker</span>.
            </h1>
          </div>

          {/* Right Side - Responsive layout */}
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            <div className="scale-90 md:scale-100">
              <ThemeToggle />
            </div>
            <div className="scale-90 md:scale-100">
              <LanguageToggle />
            </div>

            {/* Upgrade Button for Free Users */}
            {isFreeUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/upgrade")}
                className="bg-blue-600 text-white hover:bg-blue-700 border-none transition-all px-4 md:px-6 h-8 md:h-9 font-bold shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2 fill-current" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Upgrade</span>
              </Button>
            )}

            {/* Admin Button - Hide text on mobile */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors px-2 md:px-4 h-8 md:h-9"
              >
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline text-xs">{t("dashboard.admin")}</span>
              </Button>
            )}

            {/* Email - Hidden on mobile and tablet */}
            <span className="hidden lg:inline text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors truncate max-w-[150px]">
              {user.email}
            </span>

            {/* Logout Button - Icon only on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-foreground hover:text-primary hover:bg-accent border border-border hover:border-primary/50 transition-colors px-2 md:px-4 h-8 md:h-9"
            >
              <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline text-xs">{t("dashboard.logout")}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 md:py-10">

        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-center md:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              {t("dashboard.title")}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t("dashboard.subtitle")}
            </p>
          </div>
          
          {/* Conversion Metrics Badges */}
          {jobs.length > 0 && (
            <div className="flex gap-3 md:gap-4">
              {/* Interview Conversion Badge */}
              {(() => {
                const totalJobs = jobs.length;
                const interviewCount = jobs.filter(j => j.status.interviewEmail).length;
                const interviewConversion = totalJobs > 0 ? (interviewCount / totalJobs) * 100 : 0;
                return (
                  <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm min-w-[100px] md:min-w-[120px] text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                      {interviewConversion.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                      Interview
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {interviewCount} dari {totalJobs}
                    </div>
                  </div>
                );
              })()}
              
              {/* Offer Conversion Badge */}
              {(() => {
                const totalJobs = jobs.length;
                const offerCount = jobs.filter(j => j.status.contractEmail).length;
                const offerConversion = totalJobs > 0 ? (offerCount / totalJobs) * 100 : 0;
                return (
                  <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm min-w-[100px] md:min-w-[120px] text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                      {offerConversion.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                      Offer
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {offerCount} dari {totalJobs}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Info Langganan */}
        {(subscription && !isAdmin) && (
          <div className="mb-6 md:mb-8">
            <SubscriptionInfo />
          </div>
        )}

        {/* Gmail Connect */}
        <div className="mb-6 md:mb-8">
          <GmailConnect />
        </div>

        {/* Small Upgrade Banner for Free Users (Before limit reached) */}
        {isFreeUser && jobs.length < FREE_PLAN_JOB_LIMIT && (
          <div className="mb-6 md:mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Upgrade ke Pro</p>
                  <p className="text-muted-foreground text-sm">Dapatkan akses tak terbatas dan fitur premium (Smart Filters & Reminders).</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/upgrade")}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Lihat Paket
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 md:h-56 bg-card border border-border rounded-xl" />
            ))}
          </div>
        ) : isSubscribed || isFreeUser ? (
          <>
            {isFreeUser && jobs.length >= FREE_PLAN_JOB_LIMIT && (
              <div className="mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-400 font-bold mb-1">Job limit reached!</p>
                    <p className="text-muted-foreground text-sm">You&apos;ve reached the limit of {FREE_PLAN_JOB_LIMIT} jobs on the Free Plan.</p>
                  </div>
                  <Button
                    onClick={() => router.push("/upgrade")}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto font-bold shadow-md"
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
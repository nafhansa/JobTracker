"use client";

import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, Moon, Sun, Languages, Download, Check, Smartphone, X, Crown, Calendar, CreditCard, Gift, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { useTheme } from "@/lib/theme/context";
import { logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { getJobCount } from "@/lib/supabase/jobs";
import { isAdminUser } from "@/lib/supabase/subscriptions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearTutorialState } from "@/lib/tutorial/context";
import FeedbackSection from "@/components/FeedbackSection";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface SettingsSectionProps {
  isAdmin: boolean;
}

export default function SettingsSection({ isAdmin }: SettingsSectionProps) {
  const router = useRouter();
  const { user, subscription } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { mode, toggleMode, mounted } = useTheme();

  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [jobCount, setJobCount] = useState<number | null>(null);

  const isAdminUserCheck = isAdmin || isAdminUser(user?.email || "");
  const isFreePlan = subscription?.plan === "free" && !isAdminUserCheck;
  const isLifetime = subscription?.plan?.toLowerCase().includes("lifetime");
  const isPro = isAdminUserCheck || (subscription?.plan !== "free" && subscription?.status === "active");

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      return isMobileDevice || isSmallScreen;
    };

    setIsMobile(checkMobile());

    const isIOSDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(isIOSDevice);

    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = navigator.standalone === true;
      return isStandalone || isIOSStandalone;
    };

    setIsInstalled(checkInstalled());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      getJobCount(user.uid).then(setJobCount).catch(() => setJobCount(0));
    }
  }, [user]);

  const handleManage = () => {
    router.push("/dashboard/billing");
  };

  const usagePercent = isFreePlan && jobCount !== null
    ? Math.min((jobCount / FREE_PLAN_JOB_LIMIT) * 100, 100)
    : 0;

  const usageColor = usagePercent >= 100
    ? "bg-red-500"
    : usagePercent >= 80
    ? "bg-amber-500"
    : "bg-primary";

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleLogout = async () => {
    if (user?.uid) {
      clearTutorialState(user.uid);
    }
    await logout();
    router.push("/login");
  };

  const handleAdmin = () => {
    router.push("/admin");
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-card dark:bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 space-y-6">
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Appearance Card */}
      <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Appearance
        </h3>
        <div className="space-y-3">
          <button
            onClick={toggleMode}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Mode</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              {mode === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-xs capitalize">{mode}</span>
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-lg transition-colors">
                <span className="text-sm font-medium text-foreground">Language</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Languages className="w-5 h-5" />
                  <span className="text-xs capitalize">{language}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-full">
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-accent" : ""}
              >
                <span className="mr-2">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("id")}
                className={language === "id" ? "bg-accent" : ""}
              >
                <span className="mr-2">🇮🇩</span>
                Indonesian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* App Card (mobile only) */}
      {isMobile && (
        <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            App
          </h3>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Install as App</p>
                  <p className="text-xs text-muted-foreground">Get native-like experience</p>
                </div>
              </div>
              {isInstalled ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Installed</span>
                </div>
              ) : (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Install
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Card */}
      <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
        <FeedbackSection />
      </div>

      {/* Subscription Card */}
      <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Subscription
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isFreePlan ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"}`}>
                {isFreePlan ? <Gift className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isAdminUserCheck ? "Admin" : isFreePlan ? "Free" : isLifetime ? "Lifetime" : "Monthly"}
                </p>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  subscription?.status === "active"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                }`}>
                  {subscription?.status || "inactive"}
                </span>
              </div>
            </div>
            {!isFreePlan && !isLifetime && (
              <Button onClick={handleManage} size="sm" variant="outline" className="gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Manage
              </Button>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Job Usage</span>
              <span className="text-sm text-muted-foreground">
                {isAdminUserCheck || !isFreePlan ? "Unlimited" : isFreePlan && jobCount !== null ? `${jobCount}/${FREE_PLAN_JOB_LIMIT}` : "—"}
              </span>
            </div>
            {isFreePlan && jobCount !== null ? (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className={`${usageColor} h-full rounded-full transition-all duration-500`} style={{ width: `${usagePercent}%` }} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">{isAdminUserCheck ? "Admin Access" : "Unlimited"}</span>
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={handleAdmin}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent p-4 mt-2"
          >
            <ShieldCheck className="w-4 h-4 mr-3" />
            <span>Admin</span>
          </Button>
        )}
      </div>

      {/* Account Card */}
      <div className="bg-card dark:bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Account
        </h3>
        <div className="space-y-3">
          {user?.email && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="text-xs text-muted-foreground">Email</span>
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-4"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowIOSModal(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Install App
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">To install JobTracker on your iOS device:</p>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</span>
                  <span>Tap the <strong className="text-primary">Share</strong> button in Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">2</span>
                  <span>Scroll down and tap <strong className="text-primary">Add to Home Screen</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">3</span>
                  <span>Tap <strong className="text-primary">Add</strong> to install JobTracker</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

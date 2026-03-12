"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Calendar, CreditCard, Gift, User, ShieldCheck, AlertTriangle, Sparkles, Palette, Check, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { getJobCount } from "@/lib/supabase/jobs";
import { useLanguage } from "@/lib/language/context";
import { isAdminUser } from "@/lib/supabase/subscriptions";
import { useTheme, ColorTheme, themeLabels } from "@/lib/theme/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const colorThemes: ColorTheme[] = ["default", "aurora", "sakura", "meadow", "ocean", "lavender", "warm-sand"];

function parseFirebaseDate(dateValue: unknown): Date | null {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === "object" && dateValue !== null) {
    interface FirestoreTimestampLike {
      toDate?: () => Date;
    }
    const typed = dateValue as FirestoreTimestampLike;
    if (typeof typed.toDate === "function") {
      return typed.toDate();
    }
  }
  if (typeof dateValue === "number") return new Date(dateValue);
  if (typeof dateValue === "string") {
    const match = dateValue.match(
      /^([A-Za-z]+ \d{1,2}, \d{4}) at (\d{1,2}:\d{2}:\d{2})\s?(AM|PM)? UTC([+-]\d+)?$/
    );
    if (!match) {
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? null : d;
    }
    const [, datePart, timePart, ampm, tz] = match;
    let formatted = `${datePart} ${timePart}`;
    if (ampm) formatted += ` ${ampm}`;
    formatted += " GMT";
    if (tz) formatted += tz;
    const d = new Date(formatted);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

interface ProfileSectionProps {
  isAdmin?: boolean;
}

export default function ProfileSection({ isAdmin: isAdminProp }: ProfileSectionProps = {}) {
  const router = useRouter();
  const { t } = useLanguage();
  const { subscription, updatedAt, user, isPro, loading } = useAuth();
  const { colorTheme, mode, setColorTheme, toggleMode, mounted } = useTheme();
  const [jobCount, setJobCount] = useState<number | null>(null);

  const isAdmin = isAdminProp || isAdminUser(user?.email || "");
  const isFreePlan = subscription?.plan === "free" && !isAdmin;
  const isLifetime = subscription?.plan?.toLowerCase().includes('lifetime');

  useEffect(() => {
    if (user) {
      getJobCount(user.uid).then(setJobCount).catch(() => setJobCount(0));
    }
  }, [user]);

  if (loading || !subscription) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-24 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  const dateToShow = subscription.status === 'active'
    ? updatedAt
    : subscription.endsAt;

  let parsedDate: Date | null = null;

  if (dateToShow) {
    if (typeof dateToShow === "object" && dateToShow !== null) {
      interface FirestoreTimestampLike {
        toDate?: () => Date;
      }
      const typed = dateToShow as FirestoreTimestampLike;
      if (typeof typed.toDate === "function") {
        parsedDate = typed.toDate();
      }
    }
    else if (typeof dateToShow === "string") {
      parsedDate = parseFirebaseDate(dateToShow);
    }
    else if (dateToShow instanceof Date) {
      parsedDate = dateToShow;
    }
    else if (typeof dateToShow === "number") {
      parsedDate = new Date(dateToShow);
    }
  }

  const displayDate = parsedDate
    ? parsedDate.toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      })
    : null;

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
<div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground mb-1">{t("profile.userInfo")}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("profile.memberSince")}: {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })
                : t("profile.unknown")}
            </p>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Appearance</h3>
        <div className="space-y-3">
          <button
            onClick={toggleMode}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                {mode === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-foreground">Mode</span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">{mode}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-accent rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Color Theme</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">{mounted ? themeLabels[colorTheme].name : "Ocean Blue"}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {colorThemes.map((theme) => (
                <DropdownMenuItem
                  key={theme}
                  onClick={() => setColorTheme(theme)}
                  className="flex items-center justify-between"
                >
                  <span>
                    <span className="mr-2">{themeLabels[theme].emoji}</span>
                    {themeLabels[theme].name}
                  </span>
                  {colorTheme === theme && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subscription Plan Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 md:items-center items-start">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-xl border flex-shrink-0 ${
                isFreePlan
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
              }`}>
                {isFreePlan ? <Gift className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-semibold text-foreground leading-none mt-2 text-center">
                {isAdmin ? t("profile.admin") : isFreePlan ? t("profile.freePlan") : isLifetime ? t("profile.lifetime") : t("profile.monthly")}
              </h3>
              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border leading-none mt-2 ${
                subscription.status === 'active'
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              }`}>
                {subscription.status}
              </span>
            </div>

            <div className="flex flex-col justify-center">
              {!isFreePlan && displayDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {subscription.status === 'active' ? t("profile.renewsOn") : t("profile.expiresOn")}: {displayDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isFreePlan && !isLifetime && (
            <Button
              onClick={handleManage}
              className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all font-semibold shadow-md"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {t("profile.manage")}
            </Button>
          )}
        </div>

        {/* Usage Progress Bar */}
        <div className="bg-muted/30 rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{t("profile.usage")}</span>
              {isFreePlan && jobCount !== null && jobCount >= FREE_PLAN_JOB_LIMIT && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                  {t("profile.limitReached")}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {isAdmin || !isFreePlan ? t("profile.unlimited") : isFreePlan && jobCount !== null
                ? `${jobCount}/${FREE_PLAN_JOB_LIMIT}`
                : t("profile.unlimited")}
            </span>
          </div>

          {isFreePlan && jobCount !== null ? (
            <>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`${usageColor} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent >= 80 && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {usagePercent >= 100 ? t("profile.limitReachedTitle") : t("profile.nearLimitTitle")}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      {usagePercent >= 100 ? t("profile.limitReachedDesc") : t("profile.nearLimitDesc")}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">{isAdmin ? "Admin Access - Unlimited Jobs" : t("profile.unlimitedAccess")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pro Features Card (for free users) */}
      {isFreePlan && !isAdmin && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("profile.unlockPro")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{t("profile.feature1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{t("profile.feature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{t("profile.feature3")}</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push("/upgrade")}
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {t("profile.upgradeNow")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

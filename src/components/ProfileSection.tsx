"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Calendar, CreditCard, Gift, ArrowUpRight, User, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { getJobCount } from "@/lib/supabase/jobs";
import { useLanguage } from "@/lib/language/context";
import { isAdminUser } from "@/lib/supabase/subscriptions";

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
    ? "bg-yellow-500"
    : "bg-blue-600";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
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

      {/* Subscription Plan Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border flex-shrink-0 ${
              isFreePlan
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                : "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
            }`}>
              {isFreePlan ? <Gift className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground leading-none">
                  {isAdmin ? t("profile.admin") : isFreePlan ? t("profile.freePlan") : isLifetime ? t("profile.lifetime") : t("profile.monthly")}
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border leading-none ${
                  subscription.status === 'active'
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                }`}>
                  {subscription.status}
                </span>
              </div>

              {!isFreePlan && displayDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
            <div className="flex items-center gap-2 text-sm text-green-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">{isAdmin ? "Admin Access - Unlimited Jobs" : t("profile.unlimitedAccess")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pro Features Card (for free users) */}
      {isFreePlan && !isAdmin && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("profile.unlockPro")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{t("profile.feature1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{t("profile.feature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{t("profile.feature3")}</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push("/upgrade")}
                className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
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

"use client";

import { useRouter } from "next/navigation"; // 1. Import router
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, CreditCard, Gift, ArrowUpRight } from "lucide-react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { useEffect, useState } from "react";
import { getJobCount } from "@/lib/firebase/firestore";

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

export function SubscriptionInfo() {
  const router = useRouter(); // 2. Init router
  const { subscription, updatedAt, user } = useAuth();
  const [jobCount, setJobCount] = useState<number | null>(null);

  const isFreePlan = subscription?.plan === "free";
  
  // Fetch job count for free users - MUST be before early return
  useEffect(() => {
    if (isFreePlan && user) {
      getJobCount(user.uid).then(setJobCount).catch(() => setJobCount(0));
    }
  }, [isFreePlan, user]);

  if (!subscription) return null;

  const dateToShow = subscription.status === 'active' 
    ? updatedAt
    : subscription.endsAt;

  let parsedDate: Date | null = null;

  if (dateToShow) {
  // 1. Cek kalau Firestore Timestamp (punya method toDate)
  if (typeof dateToShow === "object" && dateToShow !== null) {
    interface FirestoreTimestampLike {
      toDate?: () => Date;
    }
    const typed = dateToShow as FirestoreTimestampLike;
    if (typeof typed.toDate === "function") {
      parsedDate = typed.toDate();
    }
  } 
  // 2. Cek kalau format string kayak "February 8, 2026 at 5:00:00 PM UTC+7"
  else if (typeof dateToShow === "string") {
    parsedDate = parseFirebaseDate(dateToShow);
  } 
  // 3. Cek kalau udah Date object
  else if (dateToShow instanceof Date) {
    parsedDate = dateToShow;
  }
  // 4. Cek kalau timestamp number
  else if (typeof dateToShow === "number") {
    parsedDate = new Date(dateToShow);
  }
}

  const displayDate = parsedDate
  ? parsedDate.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    })
  : null;

  // 3. Update fungsi handleManage
  const handleManage = () => {
    router.push("/dashboard/billing");
  };

  // Cek apakah plan lifetime atau monthly untuk display text
  const isLifetime = subscription.plan?.toLowerCase().includes('lifetime');

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg border ${
            isFreePlan 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-primary/10 border-primary/20 text-primary"
          }`}>
            {isFreePlan ? <Gift className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">
                Plan: {isFreePlan ? "Free Plan" : isLifetime ? "Lifetime Access" : "Monthly Pro"}
                </h3>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                    subscription.status === 'active' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                    {subscription.status}
                </span>
            </div>

            {isFreePlan && jobCount !== null && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>
                        Jobs: <span className="font-semibold text-foreground">{jobCount}/{FREE_PLAN_JOB_LIMIT}</span>
                    </span>
                </div>
            )}

            {!isFreePlan && displayDate && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                        {subscription.status === 'active' ? "Renews on" : "Expires on"}: {displayDate}
                    </span>
                </div>
            )}
          </div>
        </div>

        {isFreePlan ? (
          <Button 
            onClick={() => router.push("/upgrade")}
            className="bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 transition-all font-semibold shadow-md"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        ) : !isLifetime && (
          <Button 
            onClick={handleManage}
            className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all font-semibold shadow-md"
          >
          <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        )}
      </div>
    </div>
  );
}
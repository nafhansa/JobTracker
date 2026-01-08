"use client";

import { useRouter } from "next/navigation"; // 1. Import router
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, CreditCard } from "lucide-react";

function parseFirebaseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === "object" && typeof dateValue.toDate === "function") {
    return dateValue.toDate();
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
    const [_, datePart, timePart, ampm, tz] = match;
    let formatted = `${datePart} ${timePart}`;
    if (ampm) formatted += ` ${ampm}`;
    formatted += " GMT"; 
    if (tz) formatted += tz;
    const d = new Date(formatted);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(dateValue: any) {
  const parsedDate = parseFirebaseDate(dateValue);
  return parsedDate
    ? parsedDate.toLocaleDateString("id-ID", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })
    : null;
}

export function SubscriptionInfo() {
  const router = useRouter(); // 2. Init router
  const { subscription, updatedAt } = useAuth();

  if (!subscription) return null;

  const dateToShow = subscription.status === 'active' 
    ? updatedAt
    : subscription.endsAt;

  function parseFirebaseDate(dateStr: string): Date | null {
    // Contoh: "February 8, 2026 at 5:00:00 PM UTC+7"
    const match = dateStr.match(
      /^([A-Za-z]+ \d{1,2}, \d{4}) at (\d{1,2}:\d{2}:\d{2})\s?(AM|PM)? UTC([+-]\d+)?$/
    );
    if (!match) return null;

    // Gabungkan jadi format yang bisa diparse JS Date
    const [_, datePart, timePart, ampm, tz] = match;
    let formatted = `${datePart} ${timePart}`;
    if (ampm) formatted += ` ${ampm}`;
    formatted += " GMT"; // UTC+7 jadi GMT+7, tapi JS Date bisa parse "GMT+7"
    if (tz) formatted += tz;

    const d = new Date(formatted);
    return isNaN(d.getTime()) ? null : d;
  }

  let parsedDate: Date | null = null;

  if (dateToShow) {
  // 1. Cek kalau Firestore Timestamp (punya method toDate)
  if (typeof dateToShow === "object" && typeof dateToShow.toDate === "function") {
    parsedDate = dateToShow.toDate();
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
    <div className="relative overflow-hidden rounded-xl border border-[#FFF0C4]/20 bg-[#3E0703]/40 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-[#3E0703]/60">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#8C1007]/40 blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4]">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#FFF0C4]">
                Plan: {isLifetime ? "Lifetime Access" : "Monthly Pro"}
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    subscription.status === 'active' 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}>
                    {subscription.status}
                </span>
            </div>

            {displayDate && (
                <div className="flex items-center gap-2 mt-1 text-sm text-[#FFF0C4]/60">
                    <Calendar className="w-3 h-3" />
                    <span>
                        {subscription.status === 'active' ? "Renews on" : "Expires on"}: {displayDate}
                    </span>
                </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleManage}
          className="bg-[#FFF0C4] text-[#3E0703] hover:bg-[#FFF0C4]/90 hover:scale-105 transition-all font-bold shadow-lg shadow-[#FFF0C4]/10"
        >
        <CreditCard className="w-4 h-4 mr-2" />
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}
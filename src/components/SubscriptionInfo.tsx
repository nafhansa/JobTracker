"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, CreditCard } from "lucide-react";

export function SubscriptionInfo() {
  const { subscription } = useAuth();

  if (!subscription) return null;

  // Format tanggal endsAt
  const endDate = subscription.endsAt 
    ? new Date(subscription.endsAt).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      })
    : null;

  // Fungsi untuk membuka customer portal (opsional, jika kamu punya link portal)
  const handleManage = () => {
    // Jika menggunakan Lemon Squeezy, biasanya ada URL customer portal
    if (subscription.customerPortalUrl) {
        window.open(subscription.customerPortalUrl, "_blank");
    } else {
        alert("Redirecting to billing portal...");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#FFF0C4]/20 bg-[#3E0703]/40 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-[#3E0703]/60">
      
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#8C1007]/40 blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left Side: Status Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4]">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#FFF0C4]">
                Plan: {subscription.plan === "lifetime" ? "Lifetime Access" : "Pro Membership"}
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    subscription.status === 'active' 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}>
                    {subscription.status}
                </span>
            </div>

            {endDate && (
                <div className="flex items-center gap-2 mt-1 text-sm text-[#FFF0C4]/60">
                    <Calendar className="w-3 h-3" />
                    <span>
                        {subscription.status === 'active' ? "Renews on" : "Expires on"}: {endDate}
                    </span>
                </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Button */}
        <Button 
            variant="outline"
            onClick={handleManage}
            className="border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#FFF0C4]/10 hover:border-[#FFF0C4]/50"
        >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
        </Button>
      </div>
    </div>
  );
}
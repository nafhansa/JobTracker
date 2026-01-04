"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, CreditCard, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function SubscriptionInfo() {
  const { subscription } = useAuth();
  const router = useRouter();

  // Tampilkan hanya jika status active atau cancelled (tapi belum expired secara tanggal)
  if (!subscription || (subscription.status !== "active" && subscription.status !== "cancelled")) return null;

  const isLifetime = subscription.plan === "lifetime";
  const isCancelled = subscription.status === "cancelled";

  return (
    <Card className="mb-8 border border-[#FFF0C4]/10 bg-gradient-to-r from-[#2a0401] to-[#3E0703] shadow-lg relative overflow-hidden group">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8C1007]/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

      <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 relative z-10">
        
        {/* Kiri: Info */}
        <div className="flex items-center gap-5 w-full">
          <div className={`p-3.5 rounded-xl border ${isLifetime ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-[#FFF0C4]/10 border-[#FFF0C4]/20 text-[#FFF0C4]"}`}>
            {isLifetime ? <Crown className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
          </div>
          
          <div className="flex-1">
            <h3 className="text-[#FFF0C4] font-serif font-bold text-lg flex items-center gap-3">
              {isLifetime ? "Lifetime Pro" : "Monthly Plan"}
              
              {/* Status Badge */}
              {!isLifetime && (
                 <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isCancelled ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-green-500/30 bg-green-500/10 text-green-300"} uppercase tracking-wider font-sans`}>
                    {isCancelled ? "Ending Soon" : "Active"}
                 </span>
              )}
            </h3>
            
            <p className="text-[#FFF0C4]/50 text-sm mt-0.5">
              {isLifetime 
                ? "You have permanent access to all Pro features." 
                : isCancelled 
                  ? "Your subscription is set to expire soon."
                  : "Your next billing is automated."
              }
            </p>
          </div>
        </div>

        {/* Kanan: Action Button (Internal Link) */}
        {!isLifetime && (
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard/billing")}
            className="w-full md:w-auto border border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#FFF0C4]/5 hover:text-white hover:border-[#FFF0C4]/40 transition-all duration-300 group-hover:translate-x-1"
          >
            Billing Details
            <ChevronRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        )}

      </CardContent>
    </Card>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import Navbar from "@/components/Navbar";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4] flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-[#8C1007] border-t-[#FFF0C4] rounded-full animate-spin"></div>
        <p className="text-[#FFF0C4]/60 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] overflow-x-hidden">
      <Navbar />
      
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16 px-6">
        {/* Back Button */}
        <div className="w-full max-w-4xl mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-[#FFF0C4] hover:text-black hover:bg-[#FFF0C4]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Subscription Banner */}
        <div className="w-full max-w-4xl">
          <SubscriptionBanner isLimitReached={true} currentJobCount={0} />
        </div>
      </main>
    </div>
  );
}

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
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-[#1E293B] border-t-[#3B82F6] rounded-full animate-spin"></div>
        <p className="text-[#F8FAFC]/60 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] font-sans selection:bg-[#3B82F6]/30 selection:text-current overflow-x-hidden">
      <Navbar />

      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white dark:from-blue-900/20 dark:via-[#0F172A] dark:to-[#0F172A]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16 px-6">
        {/* Back Button */}
        <div className="w-full max-w-4xl mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-[#1E293B] dark:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-slate-800"
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

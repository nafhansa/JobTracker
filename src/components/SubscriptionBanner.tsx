"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function SubscriptionBanner() {
  
  const handleSubscribe = () => {
    // ⚠️ PENTING: GANTI URL DI BAWAH INI DENGAN LINK FASTSPRING KAMU
    // Contoh: "https://namatoko.onfastspring.com/checkout/job-tracker-pro"
    window.location.href = "https://YOUR-STORE-NAME.onfastspring.com/checkout/YOUR-PRODUCT-PATH"; 
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-8 md:p-12 text-center shadow-2xl">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C1007] to-transparent opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#8C1007] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4] text-xs font-bold tracking-wider uppercase mb-6">
          <Sparkles className="w-3 h-3" />
          Premium Access Required
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FFF0C4] mb-4 drop-shadow-md">
          Unlock Your Career Potential
        </h2>
        
        <p className="text-[#FFF0C4]/70 text-lg mb-8 leading-relaxed">
          Track unlimited jobs, get analytics insights, and organize your job search like a pro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8 w-full max-w-lg">
           <div className="flex items-center gap-3 text-[#FFF0C4]/80">
             <CheckCircle2 className="w-5 h-5 text-[#8C1007]" />
             <span>Unlimited Job Tracking</span>
           </div>
           <div className="flex items-center gap-3 text-[#FFF0C4]/80">
             <CheckCircle2 className="w-5 h-5 text-[#8C1007]" />
             <span>Lifetime Access</span>
           </div>
        </div>

        <Button 
          size="lg" 
          onClick={handleSubscribe}
          className="bg-[#8C1007] hover:bg-[#a11d13] text-[#FFF0C4] font-bold px-8 py-6 text-lg shadow-lg shadow-[#8C1007]/20 transition-all hover:scale-105"
        >
          Get Access Now
        </Button>
        
        <p className="mt-4 text-xs text-[#FFF0C4]/40">
          Secure payment via FastSpring.
        </p>
      </div>
    </div>
  );
}
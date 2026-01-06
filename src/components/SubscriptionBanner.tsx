"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

export function SubscriptionBanner() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = (plan: "monthly" | "lifetime") => {
    if (!user) {
      router.push("/login");
      return;
    }

    const productPath = plan === 'monthly' ? 'job-tracker-monthly-plan' : 'job-tracker-lifetime-plan';
    const checkoutUrl = `https://jobtracker.test.onfastspring.com/${productPath}?contact_email=${encodeURIComponent(user.email || "")}&tags=user_id=${user.uid}&buyerReference=${user.uid}`;
    
    window.open(checkoutUrl, "_self");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8C1007]/50 bg-gradient-to-br from-[#3E0703] to-[#1a0201] p-6 md:p-10 text-center shadow-2xl">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C1007] to-transparent opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#8C1007] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C1007]/20 border border-[#8C1007]/50 text-[#FFF0C4] text-xs font-bold tracking-wider uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          Premium Access Required
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FFF0C4] mb-4 drop-shadow-md">
          Choose Your Plan
        </h2>
        
        <p className="text-[#FFF0C4]/70 text-lg mb-8 max-w-2xl">
          Unlock unlimited job tracking, analytics, and organize your search like a pro.
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Monthly Plan */}
          <div className="flex flex-col rounded-xl border border-[#FFF0C4]/10 bg-[#1a0201]/60 p-6 backdrop-blur-sm hover:border-[#FFF0C4]/30 transition-all">
            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Monthly Plan</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">Perfect for short-term job hunting.</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Full Feature Access</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Cancel Anytime</span>
               </div>
            </div>

            <Button 
              onClick={() => handleSubscribe("monthly")}
              // Hapus variant="outline" atau "default" biar kita bisa custom full lewat className
              className="w-full py-6 
              bg-transparent border border-[#FFF0C4]/20 text-[#FFF0C4] 
              hover:bg-[#8C1007] hover:border-[#8C1007] hover:text-[#FFF0C4] 
              transition-all duration-300"
              >
              Subscribe Monthly
            </Button>
          </div>

          {/* Lifetime Plan (Highlighted) */}
          <div className="relative flex flex-col rounded-xl border border-[#8C1007] bg-[#3E0703]/40 p-6 backdrop-blur-sm shadow-lg shadow-[#8C1007]/10 transform md:scale-105">
            
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8C1007] text-[#FFF0C4] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#FFF0C4]/20 flex items-center gap-1">
               <Zap className="w-3 h-3 fill-current" /> Best Value
            </div>

            <h3 className="text-xl font-bold text-[#FFF0C4] mb-2">Lifetime Access</h3>
            <p className="text-sm text-[#FFF0C4]/60 mb-6">Pay once, own it forever.</p>
            
            <div className="flex-1 space-y-3 mb-6">
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>**Unlimited** Everything</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>No Recurring Fees</span>
               </div>
               <div className="flex items-center gap-3 text-[#FFF0C4]/80 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-[#8C1007]" />
                 <span>Future Updates Included</span>
               </div>
            </div>

            <Button 
              onClick={() => handleSubscribe("lifetime")}
              className="w-full bg-[#8C1007] hover:bg-[#a11d13] text-[#FFF0C4] font-bold py-6 shadow-md transition-all hover:scale-105"
            >
              Get Lifetime Access
            </Button>
            <p className="mt-3 text-[10px] text-[#FFF0C4]/40">One-time payment via FastSpring</p>
          </div>

        </div>
      </div>
    </div>
  );
}
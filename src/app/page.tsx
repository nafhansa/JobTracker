// /home/nafhan/Documents/projek/job/src/app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image dari Next.js
import { ArrowRight, Star, Check, X, Clock, TrendingUp, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import SocialProof from "../components/SocialProof";
import FAQSection from "../components/FAQSection";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";

export default function LandingPage() {
  const [ctaVariant] = useState<"A" | "B" | "C">(() => {
    const variants: ("A" | "B" | "C")[] = ["A", "B", "C"];
    return variants[Math.floor(Math.random() * variants.length)];
  });
  const [startTime] = useState(() => Date.now());
  const scrollDepthRef = useRef<number>(0);

  // Track page visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const deviceInfo = getDeviceInfo();
        
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            type: "visit", 
            page: "home",
            sessionId,
            deviceInfo,
          }),
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };
    trackVisit();
  }, []);

  // Track micro-conversions
  const trackMicroConversion = useCallback(async (type: string, value?: number) => {
    try {
      const sessionId = getOrCreateSessionId();
      await fetch("/api/analytics/micro-conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          value,
          sessionId,
          page: "home",
        }),
      });
    } catch (error) {
      console.error("Failed to track micro-conversion:", error);
    }
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      if (scrollDepth > scrollDepthRef.current) {
        scrollDepthRef.current = scrollDepth;
        
        // Track at milestones: 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          trackMicroConversion("scroll_depth", scrollDepth);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackMicroConversion]);

  // Track time on page (when user leaves)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      trackMicroConversion("time_on_page", timeOnPage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [startTime, trackMicroConversion]);

  // Track CTA click
  const handleCTAClick = () => {
    trackMicroConversion("cta_click");
  };

  // Track pricing click
  const handlePricingClick = () => {
    trackMicroConversion("pricing_click");
  };

  // Get CTA text based on variant
  const getCTAText = () => {
    switch (ctaVariant) {
      case "A":
        return "Get Started Now";
      case "B":
        return "Try Now";
      case "C":
        return "Start Tracking Jobs";
      default:
        return "Get Started Now";
    }
  };

  // Early bird countdown logic
  const EARLY_BIRD_END_DATE = new Date();
  EARLY_BIRD_END_DATE.setDate(EARLY_BIRD_END_DATE.getDate() + 3);
  EARLY_BIRD_END_DATE.setHours(23, 59, 59, 999);

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const end = EARLY_BIRD_END_DATE.getTime();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    const initial = calculateTimeLeft();
    return {
      days: initial.days,
      hours: initial.hours,
      minutes: initial.minutes,
      seconds: initial.seconds,
    };
  });
  const [isEarlyBirdExpired, setIsEarlyBirdExpired] = useState(() => calculateTimeLeft().expired);

  useEffect(() => {
    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft((prev) => {
        if (prev.days === result.days && prev.hours === result.hours && 
            prev.minutes === result.minutes && prev.seconds === result.seconds) {
          return prev;
        }
        return {
          days: result.days,
          hours: result.hours,
          minutes: result.minutes,
          seconds: result.seconds,
        };
      });
      setIsEarlyBirdExpired((prev) => prev !== result.expired ? result.expired : prev);
    }, 1000);

    return () => clearInterval(timer);
  // calculateTimeLeft is stable (doesn't depend on props/state), so we can safely ignore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen justify-center bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] overflow-x-hidden">
      <Navbar />
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-24 md:pt-40 pb-20 px-6 text-center max-w-5xl mx-auto space-y-8 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border border-[#8C1007]/50 rounded-full text-[#FFF0C4] bg-[#8C1007]/20 shadow-[0_0_15px_rgba(140,16,7,0.4)] backdrop-blur-sm">
            <Star className="w-3 h-3 text-[#8C1007] fill-current" /> Premium Career Management
          </div>
          
          <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-[#FFF0C4] drop-shadow-2xl">
            Stop Using Spreadsheets <br/>
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-1 bg-[#8C1007]/20 blur-xl rounded-full"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0C4] via-[#ffaa99] to-[#8C1007]">
                For Your Future.
              </span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#FFF0C4]/70 max-w-2xl mx-auto font-light leading-relaxed mb-4">
            Track your job search with elegance. Monitor status, salaries, and follow-ups in one <span className="text-[#FFF0C4] font-semibold underline decoration-[#8C1007] decoration-2 underline-offset-4">sophisticated dashboard</span>.
          </p>

          {/* Value Proposition Benefits */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#8C1007]/20 border border-[#8C1007]/50 rounded-full">
              <Clock className="w-4 h-4 text-[#8C1007]" />
              <span className="text-sm md:text-base text-[#FFF0C4] font-medium">
                Save <span className="font-bold text-[#8C1007]">5 hours/week</span> on job tracking
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#8C1007]/20 border border-[#8C1007]/50 rounded-full">
              <TrendingUp className="w-4 h-4 text-[#8C1007]" />
              <span className="text-sm md:text-base text-[#FFF0C4] font-medium">
                Never miss a <span className="font-bold text-[#8C1007]">follow-up</span> again
              </span>
            </div>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              onClick={handleCTAClick}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-widest text-[#FFF0C4] bg-[#8C1007] rounded-sm hover:bg-[#a31208] transition-all duration-300 shadow-[0_0_20px_rgba(140,16,7,0.4)] hover:shadow-[0_0_40px_rgba(140,16,7,0.6)] uppercase overflow-hidden ${
                ctaVariant === "B" ? "text-lg px-10 py-5" : ""
              }`}
            >
              <span className="relative z-10 flex items-center">
                {getCTAText()}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </Link>
            
            <Link 
              href="/pricing" 
              onClick={handlePricingClick}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-widest text-[#FFF0C4] border border-[#FFF0C4]/20 rounded-sm hover:bg-[#FFF0C4]/10 transition-all duration-300 uppercase"
            >
              View Pricing
            </Link>
          </div>
        </section>

        {/* --- EARLY BIRD SPECIAL SECTION --- */}
        {!isEarlyBirdExpired && (
          <section className="w-full max-w-6xl px-6 py-12 md:py-16 relative z-10 mx-auto">
            <div className="relative bg-gradient-to-br from-[#8C1007] via-[#a01208] to-[#8C1007] rounded-2xl border-2 border-[#FFF0C4]/20 shadow-[0_0_40px_rgba(140,16,7,0.6)] overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFF0C4] to-transparent animate-pulse"></div>
              
              <div className="relative z-10 p-6 md:p-10">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF0C4]/20 rounded-full mb-4">
                      <Zap className="w-4 h-4 text-[#FFF0C4] animate-pulse" />
                      <span className="text-xs font-bold text-[#FFF0C4] uppercase tracking-wider">
                        🎉 Early Bird Special
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#FFF0C4] mb-2">
                      Limited Time Offer
                    </h2>
                    <p className="text-base text-[#FFF0C4]/90 mb-4">
                      Get Lifetime Access for <span className="font-bold text-[#FFF0C4]">$9.99</span>
                    </p>
                    <p className="text-sm text-[#FFF0C4]/70 line-through mb-2">
                      Regular Price: $17.99
                    </p>
                  </div>

                  {/* Countdown Timer Mobile */}
                  <div className="bg-[#FFF0C4]/10 rounded-xl p-4 border border-[#FFF0C4]/20">
                    <div className="text-center mb-3">
                      <Clock className="w-5 h-5 text-[#FFF0C4] mx-auto mb-2" />
                      <p className="text-xs text-[#FFF0C4]/80 uppercase tracking-wider">Offer Ends In</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-[#FFF0C4]/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-[#FFF0C4]">
                          {String(timeLeft.days).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-[#FFF0C4]/70 uppercase mt-1">Days</p>
                      </div>
                      <div className="bg-[#FFF0C4]/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-[#FFF0C4]">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-[#FFF0C4]/70 uppercase mt-1">Hours</p>
                      </div>
                      <div className="bg-[#FFF0C4]/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-[#FFF0C4]">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-[#FFF0C4]/70 uppercase mt-1">Mins</p>
                      </div>
                      <div className="bg-[#FFF0C4]/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-[#FFF0C4]">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-[#FFF0C4]/70 uppercase mt-1">Secs</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    onClick={handlePricingClick}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#FFF0C4] text-[#8C1007] rounded-lg font-bold text-base hover:bg-white transition-all duration-300 shadow-lg"
                  >
                    Claim Early Bird Offer
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF0C4]/20 rounded-full mb-4">
                      <Zap className="w-5 h-5 text-[#FFF0C4] animate-pulse" />
                      <span className="text-sm font-bold text-[#FFF0C4] uppercase tracking-wider">
                        🎉 Early Bird Special
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF0C4] mb-3">
                      Limited Time: Lifetime Access Only $9.99
                    </h2>
                    <p className="text-lg text-[#FFF0C4]/90 mb-4">
                      <span className="line-through text-[#FFF0C4]/60">Was $17.99</span> • Save 44% • Pay Once, Own Forever
                    </p>
                    
                    {/* Countdown Timer Desktop */}
                    <div className="flex items-center gap-4 mt-6">
                      <Clock className="w-5 h-5 text-[#FFF0C4]" />
                      <span className="text-sm text-[#FFF0C4]/80 font-medium">Offer ends in:</span>
                      <div className="flex items-center gap-2 font-mono text-lg font-bold text-[#FFF0C4]">
                        <span className="bg-[#FFF0C4]/20 px-3 py-2 rounded-lg">
                          {String(timeLeft.days).padStart(2, "0")}d
                        </span>
                        <span>:</span>
                        <span className="bg-[#FFF0C4]/20 px-3 py-2 rounded-lg">
                          {String(timeLeft.hours).padStart(2, "0")}h
                        </span>
                        <span>:</span>
                        <span className="bg-[#FFF0C4]/20 px-3 py-2 rounded-lg">
                          {String(timeLeft.minutes).padStart(2, "0")}m
                        </span>
                        <span>:</span>
                        <span className="bg-[#FFF0C4]/20 px-3 py-2 rounded-lg">
                          {String(timeLeft.seconds).padStart(2, "0")}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    onClick={handlePricingClick}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFF0C4] text-[#8C1007] rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 shadow-lg hover:scale-105"
                  >
                    Claim Offer
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- COMPARISON SECTION --- */}
        <section id="comparison" className="py-20 w-full max-w-6xl px-6 relative z-10 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FFF0C4] mb-4">
              Spreadsheets vs JobTracker
            </h2>
            <p className="text-[#FFF0C4]/60 text-lg">
              See why JobTracker is the smarter choice
            </p>
          </div>

          <div className="bg-[#2a0401] rounded-xl border border-[#FFF0C4]/10 p-2 md:p-8 backdrop-blur-sm">
            {/* --- DESKTOP VIEW (Grid System) --- */}
            <div className="hidden md:grid grid-cols-3 gap-6 items-stretch">
              
              {/* 1. FEATURES COLUMN */}
              <div className="flex flex-col px-4 py-8"> 
                {/* Header Area - Fixed Height for alignment */}
                <div className="h-[120px] flex flex-col justify-end pb-8 border-b border-[#FFF0C4]/5 mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#FFF0C4] text-left">
                    Features
                  </h3>
                </div>
                {/* Rows */}
                <div className="flex flex-col space-y-4">
                  {[
                    "Visual Stage Tracking",
                    "Salary Recording",
                    "Structured Job Details",
                    "Responsive Mobile Experience",
                  ].map((feature, idx) => (
                    <div key={idx} className="h-12 flex items-center text-base font-medium text-[#FFF0C4]/90">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. JOBTRACKER COLUMN (Highlighted) */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-[#8C1007]/20 rounded-xl blur-md"></div>
                
                <div className="relative bg-[#3E0703] border-2 border-[#8C1007] rounded-xl p-8 shadow-[0_0_20px_rgba(140,16,7,0.2)] h-full">
                  {/* Header Area - Fixed Height for alignment */}
                  <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-[#8C1007]/30 mb-6">
                    <h3 className="text-2xl font-serif font-bold text-[#FFF0C4] mb-2">
                      JobTracker
                    </h3>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#8C1007] text-xs font-bold text-[#FFF0C4] shadow-lg">
                      <Star className="w-3 h-3 fill-[#FFF0C4]" />
                      Winner
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="flex flex-col space-y-4">
                    <ComparisonItem value="Yes" icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                    <ComparisonItem value="Yes" icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                    <ComparisonItem value="Yes" icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                    <ComparisonItem value="Organized" icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                    <ComparisonItem value="Yes" icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                  </div>
                </div>
              </div>

              {/* 3. SPREADSHEETS COLUMN */}
              <div className="flex flex-col h-full">
                <div className="bg-[#1a0201] border border-[#FFF0C4]/10 rounded-xl p-8 h-full">
                  {/* Header Area - Fixed Height for alignment */}
                  <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-[#FFF0C4]/10 mb-6">
                    <h3 className="text-2xl font-serif font-bold text-[#FFF0C4]/60">
                      Spreadsheets
                    </h3>
                  </div>

                  {/* Rows */}
                  <div className="flex flex-col space-y-4">
                    <ComparisonItem value="No" icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                    <ComparisonItem value="No" icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                    <ComparisonItem value="No" icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                    <ComparisonItem value="Messy" icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                    <ComparisonItem value="Painful" icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* --- MOBILE VIEW (Stacked Cards) --- */}
            <div className="md:hidden space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-serif font-bold text-[#FFF0C4] mb-2">
                  Why switch?
                </h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#8C1007]/30 border border-[#8C1007]/50 text-xs font-bold text-[#FFF0C4]">
                  <Star className="w-3 h-3 fill-[#8C1007]" />
                  Recommended
                </div>
              </div>

              {[
                { feature: "Auto-Follow Up Reminders", jobtracker: "Yes", spreadsheet: "No" },
                { feature: "Kanban Visualization", jobtracker: "Yes", spreadsheet: "No" },
                { feature: "Salary Analytics", jobtracker: "Yes", spreadsheet: "No" },
                { feature: "Document Storage", jobtracker: "Organized", spreadsheet: "Messy" },
                { feature: "Mobile Friendly", jobtracker: "Yes", spreadsheet: "Painful" },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#1a0201] border border-[#FFF0C4]/10 rounded-lg p-5">
                  <div className="text-sm font-bold text-[#FFF0C4] mb-4 text-center tracking-wide uppercase opacity-80">
                    {item.feature}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* JobTracker Side */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-[#8C1007]/20 rounded-lg blur-sm"></div>
                      <div className="relative bg-[#3E0703] border border-[#8C1007] rounded-lg p-3 text-center h-full flex flex-col justify-center items-center">
                        <div className="text-[10px] uppercase tracking-wider text-[#8C1007] font-bold mb-1">JobTracker</div>
                        <div className="flex items-center gap-2 text-[#FFF0C4] font-medium">
                          <Check className="w-4 h-4 text-[#8C1007]" /> {item.jobtracker}
                        </div>
                      </div>
                    </div>
                    
                    {/* Spreadsheet Side */}
                    <div className="bg-[#0f0101] border border-[#FFF0C4]/5 rounded-lg p-3 text-center h-full flex flex-col justify-center items-center opacity-70">
                       <div className="text-[10px] uppercase tracking-wider text-[#FFF0C4]/30 font-bold mb-1">Excel</div>
                       <div className="flex items-center gap-2 text-[#FFF0C4]/50">
                          <X className="w-4 h-4" /> {item.spreadsheet}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRODUCT SHOWCASE (UPDATED: REAL SCREENSHOT) --- */}
        {/* Paddle Point #3: Clear display of product features */}
        <div className="relative w-full max-w-6xl px-4 mt-8 md:mt-16 mb-24 perspective-[2000px] group">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#8C1007] rounded-full blur-[100px] opacity-20"></div>
           
           <div className="relative bg-[#1a0201] border border-[#FFF0C4]/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm transform rotate-x-[10deg] group-hover:rotate-x-[0deg] transition-all duration-700 ease-out">
              {/* Browser Bar */}
              <div className="h-8 bg-[#3E0703] flex items-center px-4 space-x-2 border-b border-[#FFF0C4]/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <div className="ml-4 px-3 py-1 bg-[#1a0201]/50 rounded text-[10px] text-[#FFF0C4]/40 font-mono hidden md:block">jobtrackerapp.site/dashboard</div>
              </div>
              
             
              <div className="relative aspect-video w-full bg-[#1a0201]">
                 <Image 
                  src="/dashboard-preview.png" 
                  alt="JobTracker Dashboard Interface" 
                  fill
                  className="object-cover object-top"
                  priority
                 />
              </div>
           </div>
        </div>

        {/* --- SOCIAL PROOF SECTION --- */}
        <SocialProof />

        {/* --- FAQ SECTION --- */}
        <FAQSection />
      </main>

      {/* --- FOOTER (UPDATED: EXPLICIT LINKS) --- */}
      {/* Paddle Point #4: Clear navigation to Terms, Privacy, Refund */}
      <footer className="py-12 border-t border-[#FFF0C4]/10 bg-[#150201] relative z-10 text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="text-center md:text-left">
              <p className="text-[#FFF0C4] font-bold tracking-widest uppercase mb-2">JobTracker</p>
              <p className="text-[#FFF0C4]/40">&copy; {new Date().getFullYear()} All rights reserved.</p>
           </div>

           <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[#FFF0C4]/60">
              <Link href="/terms-policy#terms" className="hover:text-[#8C1007] transition-colors">Terms of Service</Link>
              <Link href="/terms-policy#privacy" className="hover:text-[#8C1007] transition-colors">Privacy Policy</Link>
              <Link href="/terms-policy#refund" className="hover:text-[#8C1007] transition-colors">Refund Policy</Link>
              <Link href="/terms-policy#contact" className="hover:text-[#8C1007] transition-colors">Contact Support</Link>
           </div>

           <div className="text-[#FFF0C4]/40 text-xs">
              <a href="mailto:official.jobtrackerapp@gmail.com" className="hover:text-[#FFF0C4] flex items-center gap-2">
                 official.jobtrackerapp@gmail.com
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function ComparisonItem({ value, icon, isPositive }: { value: string, icon: React.ReactNode, isPositive: boolean }) {
  return (
    <div className="h-12 flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
          isPositive
            ? "bg-[#8C1007] text-[#FFF0C4]"
            : "bg-[#FFF0C4]/10 text-[#FFF0C4]/40"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-base font-medium ${
          isPositive ? "text-[#FFF0C4]" : "text-[#FFF0C4]/50"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
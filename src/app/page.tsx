// /home/nafhan/Documents/projek/job/src/app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image dari Next.js
import { ArrowRight, Star, Check, X, Clock, Zap } from "lucide-react";
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
        return "Start Tracking Free";
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
    <div className="flex flex-col min-h-screen justify-center bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* --- HERO SECTION --- */}
        {/* SECTION PADDING: Adjust top padding - Mobile: pt-X (lebih kecil = lebih ke atas), Desktop: md:pt-20 (tetap) */}
        {/* Mobile options: pt-16, pt-20, pt-24, pt-28, pt-32, pt-36, pt-40 (semakin kecil = semakin ke atas) */}
        <section className="pt-36 md:pt-20 pb-20 px-6 text-center max-w-5xl mx-auto">
          {/* MAIN SPACING: Adjust spacing between all components - space-y-6 (mobile) md:space-y-8 (desktop) */}
          {/* Options: space-y-4 (tight), space-y-6 (default), space-y-8 (comfortable), space-y-10 (spacious) */}
          <div className="flex flex-col items-center space-y-6 md:space-y-4">
            {/* Badge - Jarak dari atas section diatur oleh pt-24 md:pt-40 di section */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border border-primary/30 rounded-full text-primary bg-primary/10 backdrop-blur-sm">
              <Star className="w-3 h-3 text-primary fill-current" />
              Premium Career Management
            </div>

            {/* Heading - Jarak dari badge diatur oleh space-y-6 md:space-y-8 di parent div */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
              Stop Using Spreadsheets <br />
              <span className="relative whitespace-nowrap">
                <span className="absolute -inset-1 bg-primary/10 blur-xl rounded-full"></span>
                <span className="relative text-primary">For Your Future.</span>
              </span>
            </h1>
          
        {/* --- PRODUCT SHOWCASE (UPDATED: REAL SCREENSHOT) --- */}
        {/* Paddle Point #3: Clear display of product features */}
        {/* UKURAN: Adjust max-width (max-w-4xl/max-w-5xl/max-w-6xl), padding (px-2/px-4/px-6), margin (mt-X mb-X) */}
        {/* SCALE: Untuk lebih kecil, tambahkan scale-90 md:scale-100 di container atau scale-75 md:scale-100 */}
        <div className="relative w-full max-w-4xl md:max-w-2xl px-2 md:px-4 mt-1 md:mt-1 mb-2 md:mb-1 perspective-[2000px] group scale-90 md:scale-85">
          {/* Background Glow - Adjust w-X h-X untuk mengubah ukuran glow (w-1/2 = 50%, w-3/4 = 75%) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 md:w-3/4 h-1/2 md:h-3/4 bg-primary/10 rounded-full blur-[100px]"></div>
           
          <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-xl backdrop-blur-sm transform rotate-x-[0deg] group-hover:rotate-x-[10deg] transition-all duration-700 ease-out">
            {/* Browser Bar - Adjust h-6/h-8 untuk tinggi browser bar */}
            <div className="h-6 md:h-8 bg-muted/50 flex items-center px-3 md:px-4 space-x-2 border-b border-border">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
              <div className="ml-2 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-background/50 rounded text-[9px] md:text-[10px] text-muted-foreground font-mono hidden md:block">jobtrackerapp.site/dashboard</div>
            </div>
            
            {/* Image Container - aspect-video = 16:9, bisa diganti aspect-square (1:1) atau aspect-[4/3] */}
            <div className="relative aspect-video w-full bg-background">
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

            {/* Description - Jarak dari heading: diatur oleh space-y-6 md:space-y-8 di parent div (line 189) */}
            {/* JARAK KHUSUS: Adjust mt-X (margin-top) dan mb-X (margin-bottom) sesuai kebutuhan - Mobile: lebih kecil, Desktop: lebih besar */}
            {/* Options: mt-0, mt-2, mt-4, mt-6, mt-8, mt-10, mt-12 | mb-0, mb-2, mb-4, mb-6, mb-8, mb-10, mb-12 */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mt-2 md:mt-0.5 mb-3 md:mb-4">
              Track your job search with confidence. Monitor status, salaries, and follow-ups in one{" "}
              <span className="text-foreground font-semibold underline decoration-primary decoration-2 underline-offset-4">
                sophisticated dashboard
              </span>
              .
            </p>

            {/* CTA Buttons - Jarak dari description: base spacing dari parent - Mobile: lebih kecil, Desktop: lebih besar */}
            {/* MOBILE: gap-3, padding lebih kecil | DESKTOP: gap-4, padding normal */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full sm:w-auto">
              <Link
                href="/login"
                onClick={handleCTAClick}
                className={`group relative inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg uppercase overflow-hidden ${
                  ctaVariant === "B" ? "md:text-lg md:px-10 md:py-5" : ""
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {getCTAText()}
                  <ArrowRight className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/pricing"
                onClick={handlePricingClick}
                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* --- EARLY BIRD SPECIAL SECTION --- */}
        {!isEarlyBirdExpired && (
          <section className="w-full max-w-6xl px-6 py-12 md:py-16 relative z-10 mx-auto">
            <div className="relative bg-white rounded-2xl border border-border shadow-md overflow-hidden">
              <div className="relative z-10 p-6 md:p-10">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Early Bird Special
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Limited Time Offer
                    </h2>
                    <p className="text-base text-foreground mb-4">
                      Get Lifetime Access for <span className="font-bold text-primary">$7.99</span>
                    </p>
                    <p className="text-sm text-muted-foreground line-through mb-2">
                      Regular Price: $17.99
                    </p>
                  </div>

                  {/* Countdown Timer Mobile */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-border">
                    <div className="text-center mb-3">
                      <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Offer Ends In</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {String(timeLeft.days).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Days</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Hours</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Mins</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Secs</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    onClick={handlePricingClick}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary/90 transition-all duration-300 shadow-md"
                  >
                    Claim Early Bird Offer
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                        Early Bird Special
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Limited Time: Lifetime Access Only $7.99
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      <span className="line-through">Was $17.99</span> • Save 44% • Pay Once, Own Forever
                    </p>
                    
                    {/* Countdown Timer Desktop */}
                    <div className="flex items-center gap-4 mt-6">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Offer ends in:</span>
                      <div className="flex items-center gap-2 font-mono text-lg font-bold text-foreground">
                        <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                          {String(timeLeft.days).padStart(2, "0")}d
                        </span>
                        <span className="text-muted-foreground">:</span>
                        <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                          {String(timeLeft.hours).padStart(2, "0")}h
                        </span>
                        <span className="text-muted-foreground">:</span>
                        <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                          {String(timeLeft.minutes).padStart(2, "0")}m
                        </span>
                        <span className="text-muted-foreground">:</span>
                        <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                          {String(timeLeft.seconds).padStart(2, "0")}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    onClick={handlePricingClick}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:scale-105"
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
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Spreadsheets vs JobTracker
            </h2>
            <p className="text-muted-foreground text-lg">
              See why JobTracker is the smarter choice
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-2 md:p-8 shadow-sm">
            {/* --- DESKTOP VIEW (Grid System) --- */}
            <div className="hidden md:grid grid-cols-3 gap-6 items-stretch">
              
              {/* 1. FEATURES COLUMN */}
              <div className="flex flex-col px-4 py-8"> 
                {/* Header Area - Fixed Height for alignment */}
                <div className="h-[120px] flex flex-col justify-end pb-8 border-b border-border mb-6">
                  <h3 className="text-xl font-bold text-foreground text-left">
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
                    <div key={idx} className="h-12 flex items-center text-base font-medium text-muted-foreground">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. JOBTRACKER COLUMN (Highlighted) */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-md"></div>
                
                <div className="relative bg-card border-2 border-primary rounded-xl p-8 shadow-md h-full">
                  {/* Header Area - Fixed Height for alignment */}
                  <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-primary/30 mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      JobTracker
                    </h3>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-xs font-semibold text-white shadow-sm">
                      <Star className="w-3 h-3 fill-white" />
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
                <div className="bg-muted/30 border border-border rounded-xl p-8 h-full">
                  {/* Header Area - Fixed Height for alignment */}
                  <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-border mb-6">
                    <h3 className="text-2xl font-bold text-muted-foreground">
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
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Why switch?
                </h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
                  <Star className="w-3 h-3 fill-primary" />
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
                <div key={idx} className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <div className="text-sm font-semibold text-foreground mb-4 text-center tracking-wide uppercase">
                    {item.feature}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* JobTracker Side */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-primary/10 rounded-lg blur-sm"></div>
                      <div className="relative bg-card border border-primary rounded-lg p-3 text-center h-full flex flex-col justify-center items-center">
                        <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">JobTracker</div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Check className="w-4 h-4 text-primary" /> {item.jobtracker}
                        </div>
                      </div>
                    </div>
                    
                    {/* Spreadsheet Side */}
                    <div className="bg-muted/30 border border-border rounded-lg p-3 text-center h-full flex flex-col justify-center items-center">
                       <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Excel</div>
                       <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" /> {item.spreadsheet}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SOCIAL PROOF SECTION --- */}
        <SocialProof />

        {/* --- FAQ SECTION --- */}
        <FAQSection />
      </main>

      {/* --- FOOTER (UPDATED: EXPLICIT LINKS) --- */}
      {/* Paddle Point #4: Clear navigation to Terms, Privacy, Refund */}
      <footer className="py-12 border-t border-border bg-background relative z-10 text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="text-center md:text-left">
              <p className="text-foreground font-bold tracking-widest uppercase mb-2">JobTracker</p>
              <p className="text-muted-foreground">&copy; {new Date().getFullYear()} All rights reserved.</p>
           </div>

           <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-muted-foreground">
              <Link href="/terms-policy#terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/terms-policy#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms-policy#refund" className="hover:text-primary transition-colors">Refund Policy</Link>
              <Link href="/terms-policy#contact" className="hover:text-primary transition-colors">Contact Support</Link>
           </div>

           <div className="text-muted-foreground text-xs">
              <a href="mailto:official.jobtrackerapp@gmail.com" className="hover:text-foreground flex items-center gap-2 transition-colors">
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
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-base font-medium ${
          isPositive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
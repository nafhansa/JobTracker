"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ResetThemeToDefault } from "@/components/ResetThemeToDefault";
import { getOrCreateSessionId, getDeviceInfo } from "@/lib/utils/analytics";
import { useLanguage } from "@/lib/language/context";
import { useAuth } from "@/lib/firebase/auth-context";
import HeroSection from "@/components/landing/HeroSection";
import MorphSection from "@/components/landing/MorphSection";
import EarlyBirdSection from "@/components/landing/EarlyBirdSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterSection from "@/components/landing/FooterSection";
import IOSInstallModal from "@/components/landing/IOSInstallModal";

export default function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [startTime] = useState(() => Date.now());
  const scrollDepthRef = useRef<number>(0);
  const [pwaRedirecting, setPwaRedirecting] = useState(false);

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

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      const detectedPWA = isStandalone || isIOSStandalone;

      setIsPWA(detectedPWA);

      return detectedPWA;
    };

    const detectedPWA = checkPWA();

    if (!detectedPWA) return;

    setPwaRedirecting(true);

    if (!authLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (pwaRedirecting && !authLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [pwaRedirecting, authLoading, user, router]);

  useEffect(() => {
    const checkIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(checkIOS);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

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

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

      if (scrollDepth > scrollDepthRef.current) {
        scrollDepthRef.current = scrollDepth;

        if ([25, 50, 75, 100].includes(scrollDepth)) {
          trackMicroConversion("scroll_depth", scrollDepth);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackMicroConversion]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      trackMicroConversion("time_on_page", timeOnPage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [startTime, trackMicroConversion]);

  const handleCTAClick = () => {
    trackMicroConversion("cta_click");
  };

  if (pwaRedirecting) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">{t("dashboard.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-center bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground overflow-x-hidden">
      <ResetThemeToDefault />
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col items-center">
        <HeroSection onCTAClick={handleCTAClick} onInstallClick={handleInstallClick} />
        <MorphSection />
        <EarlyBirdSection onCTAClick={handleCTAClick} />
        <ComparisonSection />
        <SocialProofSection />
        <FAQSection />
      </main>

      <FooterSection />

      <IOSInstallModal
        open={showIOSInstructions}
        onClose={() => setShowIOSInstructions(false)}
      />
    </div>
  );
}
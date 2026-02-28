"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      try {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const isIOSStandalone = (navigator as any).standalone === true;
        return isStandalone || isIOSStandalone;
      } catch (error) {
        console.error("Error checking PWA mode:", error);
        return false;
      }
    };

    const isPWA = checkPWA();

    if (!isPWA) return;

    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/splash.png"
          alt="JobTracker"
          className="w-full h-full object-cover"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    </div>
  );
}

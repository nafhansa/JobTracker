"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500">
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src="/splash.png"
          alt="JobTracker"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </div>
  );
}

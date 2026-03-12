"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export default function PWAFloatingButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      return isMobileDevice || isSmallScreen;
    };

    const mobile = checkMobile();
    setIsMobile(mobile);

    if (!mobile) return;
    const isIOSDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(isIOSDevice);

    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = navigator.standalone === true;
      return isStandalone || isIOSStandalone;
    };

    const installed = checkInstalled();
    if (installed) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const installedStorage = localStorage.getItem("pwa-installed");
    const floatingHidden = localStorage.getItem("pwa-floating-hidden");

    if (floatingHidden) {
      setIsHidden(true);
      return;
    }

    if (dismissed && !installedStorage) {
      setShowButton(true);
    }

    const handleBannerDismissed = () => {
      setShowButton(true);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-banner-dismissed", handleBannerDismissed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-banner-dismissed", handleBannerDismissed);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  const handleHideButton = () => {
    setShowButton(false);
    setIsHidden(true);
    localStorage.setItem("pwa-floating-hidden", "true");
  };

  if (!showButton || isInstalled || isHidden || !isMobile) return null;

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[90] animate-in fade-in slide-in-from-right duration-300">
        <div className="relative group">
          <button
            onClick={handleHideButton}
            className="absolute -top-1 -right-1 w-5 h-5 bg-muted border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-accent"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Install App</span>
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowIOSModal(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Install App
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">To install JobTracker on your iOS device:</p>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</span>
                  <span>Tap the <strong className="text-primary">Share</strong> button in Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">2</span>
                  <span>Scroll down and tap <strong className="text-primary">Add to Home Screen</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">3</span>
                  <span>Tap <strong className="text-primary">Add</strong> to install JobTracker</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
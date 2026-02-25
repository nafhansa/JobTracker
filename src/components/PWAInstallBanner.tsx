"use client";

import { useEffect, useState } from "react";
import { X, Download, Check } from "lucide-react";
import { Button } from "./ui/button";

// Extend Navigator interface for iOS standalone mode
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = async () => {
      // Check if app is already installed
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return;
      }

      // Check for iOS
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      const isInStandaloneMode = navigator.standalone === true;

      if (isIOS && !isInStandaloneMode) {
        // Show iOS instruction banner after delay
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user already dismissed or installed
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const installed = localStorage.getItem("pwa-installed");

      if (!dismissed && !installed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner || isInstalled) return null;

  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 md:p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Download className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
              Install App
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              {isIOS ? (
                <>
                  Tap the share button <span className="font-medium">􀈂</span> and select
                  <span className="font-medium"> Add to Home Screen</span>
                </>
              ) : (
                "Get the best experience by installing JobTracker on your device"
              )}
            </p>

            {isIOS ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="line-clamp-2">
                  Add to Home Screen to use JobTracker like a native app
                </span>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="w-full md:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

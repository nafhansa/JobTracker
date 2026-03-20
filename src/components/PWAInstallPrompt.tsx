"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const KEY_DISMISSED = "pwa-install-dismissed";
const KEY_INSTALLED = "pwa-installed";
const KEY_FLOAT_HIDDEN = "pwa-floating-hidden";
const BANNER_DELAY_MS = 5000;

type DisplayMode = "hidden" | "banner" | "floating";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
    window.innerWidth < 1024
  );
}

function isAlreadyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

function getStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

export function PWAInstallPrompt() {
  const [mode, setMode] = useState<DisplayMode>("hidden");
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const deferredPrompt = useRef<Event | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = isMobileDevice();

    if (!isMobile.current || isAlreadyInstalled()) return;

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    const dismissed = getStorage(KEY_DISMISSED) === "true";
    const installed = getStorage(KEY_INSTALLED) === "true";
    const floatHidden = getStorage(KEY_FLOAT_HIDDEN) === "true";

    if (installed) return;

    if (dismissed && !floatHidden) {
      setMode("floating");
      return;
    }

    if (dismissed && floatHidden) return;

    const showBanner = () => {
      if (
        getStorage(KEY_DISMISSED) !== "true" &&
        getStorage(KEY_INSTALLED) !== "true" &&
        !isAlreadyInstalled()
      ) {
        setMode("banner");
      }
    };

    const handleAppInstalled = () => {
      setStorage(KEY_INSTALLED, "true");
      setMode("hidden");
      deferredPrompt.current = null;
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    if (ios) {
      bannerTimer.current = setTimeout(showBanner, BANNER_DELAY_MS);
      return () => {
        if (bannerTimer.current) clearTimeout(bannerTimer.current);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      bannerTimer.current = setTimeout(showBanner, BANNER_DELAY_MS);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptEvent = deferredPrompt.current as BeforeInstallPromptEvent | null;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setStorage(KEY_INSTALLED, "true");
      setMode("hidden");
    }
    deferredPrompt.current = null;
  };

  const handleDismissBanner = () => {
    setStorage(KEY_DISMISSED, "true");
    setMode("floating");
  };

  const handleDismissFloating = () => {
    setStorage(KEY_FLOAT_HIDDEN, "true");
    setMode("hidden");
  };

  if (!isMobile.current) return null;

  if (mode === "hidden" && !showIOSModal) return null;

  return (
    <>
      {mode === "banner" && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 md:p-6 relative">
            <button
              onClick={handleDismissBanner}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Tutup"
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
                      Tap the share button{" "}
                      <span className="font-medium">􀈂</span> and select{" "}
                      <span className="font-medium">Add to Home Screen</span>
                    </>
                  ) : (
                    "Get the best experience by installing JobTracker on your device"
                  )}
                </p>
                {isIOS ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      Add to Home Screen to use JobTracker like a native app
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "floating" && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-[90] animate-in fade-in slide-in-from-right duration-300">
          <div className="relative group">
            <button
              onClick={handleDismissFloating}
              aria-label="Sembunyikan"
              className="absolute -top-1 -right-1 w-5 h-5 bg-muted border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-accent"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              onClick={handleInstall}
              aria-label="Install JobTracker"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Install App</span>
            </button>
          </div>
        </div>
      )}

      {showIOSModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
              <p className="text-muted-foreground">
                To install JobTracker on your iOS device:
              </p>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-primary">Share</strong>{" "}
                    button{" "}
                    <span className="text-lg" role="img" aria-label="share">
                      􀈂
                    </span>{" "}
                    in Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap{" "}
                    <strong className="text-primary">
                      Add to Home Screen
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-primary">Add</strong> to
                    install JobTracker
                  </span>
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
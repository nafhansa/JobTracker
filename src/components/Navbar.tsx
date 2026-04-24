// FIXED VERSION - src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

interface NavbarProps {
  showcaseRef?: React.RefObject<HTMLElement | null>;
}

export default function Navbar({ showcaseRef }: NavbarProps) {
  const { user } = useAuth();
  const { t, mounted: langMounted } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!showcaseRef?.current) {
        setIsVisible(false);
        return;
      }
      const showcaseTop = showcaseRef.current.getBoundingClientRect().top + window.scrollY;
      setIsVisible(window.scrollY > showcaseTop - 120);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showcaseRef]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div
        className="mx-auto w-[calc(100%-1.5rem)] md:w-full md:max-w-[40rem] mt-3 md:mt-4 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 md:py-2.5 px-3 md:px-5 flex items-center justify-between gap-2 md:gap-10"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-base md:text-2xl font-bold tracking-wider md:tracking-widest text-foreground flex items-center gap-1 md:gap-2 cursor-pointer transition-colors flex-shrink-0"
        >
          Job<span className="text-primary">Tracker</span>.
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
          <div className="scale-90 md:scale-100">
            <ThemeToggle />
          </div>
          <div className="scale-90 md:scale-100">
            <LanguageToggle />
          </div>

          {/* Pricing */}
          {!langMounted ? (
            <div className="h-6 md:h-9 w-16 md:w-20 bg-muted rounded-lg animate-pulse" />
          ) : (
            <Link
              href="/pricing"
              className="text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap hover:bg-accent hover:text-accent-foreground text-foreground"
            >
              {t("nav.pricing")}
            </Link>
          )}

          {/* CTA */}
          {!langMounted ? (
            <div className="h-6 md:h-9 w-14 md:w-16 bg-muted rounded-lg animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

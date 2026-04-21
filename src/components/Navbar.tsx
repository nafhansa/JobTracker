// FIXED VERSION - src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

interface NavbarProps {
  heroRef?: React.RefObject<HTMLElement | null>;
}

export default function Navbar({ heroRef }: NavbarProps) {
  const { user } = useAuth();
  const { t, mounted: langMounted } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef?.current) {
        setIsScrolled(window.scrollY > 40);
        return;
      }
      const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight;
      setIsScrolled(window.scrollY > heroBottom - 80);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`
          mx-auto w-full
          flex items-center justify-between gap-6 md:gap-10
          transition-[max-width,padding,border-radius,background-color,border-color,box-shadow,backdrop-filter,margin] 
          duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isScrolled
            ? "max-w-[40rem] mt-3 md:mt-4 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2.5 px-5"
            : "max-w-7xl mt-0 rounded-none bg-transparent border-transparent py-3 md:py-6 px-4 md:px-6"
          }
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-lg md:text-2xl font-bold tracking-wider md:tracking-widest text-foreground flex items-center gap-1 md:gap-2 cursor-pointer transition-colors flex-shrink-0"
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
              className={`text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap ${
                isScrolled
                  ? "hover:bg-accent hover:text-accent-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
              }`}
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

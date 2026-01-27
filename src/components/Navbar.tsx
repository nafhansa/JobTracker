// FIXED VERSION - src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-background/80 dark:bg-card/80 backdrop-blur-xl border-b border-border py-2 md:py-3 shadow-lg"
          : "bg-background/0 dark:bg-card/0 border-transparent py-3 md:py-6"
      }`}
    >
      {/* FIXED: Padding lebih kecil di mobile, gap dikurangi */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* FIXED: Logo lebih kecil di mobile */}
        <Link 
          href="/" 
          className="text-lg md:text-2xl font-bold tracking-wider md:tracking-widest text-foreground flex items-center gap-1 md:gap-2 cursor-pointer transition-colors flex-shrink-0"
        >
          Job<span className="text-primary">Tracker</span>.
        </Link>
        
        {/* FIXED: Gap lebih kecil di mobile, flex-shrink-0 untuk prevent squishing */}
        <nav className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
          {/* FIXED: Scale down toggle buttons di mobile */}
          <div className="scale-90 md:scale-100">
            <ThemeToggle />
          </div>
          <div className="scale-90 md:scale-100">
            <LanguageToggle />
          </div>
          
          {/* FIXED: Pricing button - padding lebih kecil di mobile */}
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
          
          {/* FIXED: CTA button - padding lebih kecil di mobile */}
          {user ? (
            <Link
              href="/dashboard"
              className={`text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap ${
                  isScrolled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              }`}
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <Link
              href="/login"
              className={`text-xs md:text-sm font-semibold transition duration-300 px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg whitespace-nowrap ${
                  isScrolled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              }`}
            >
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
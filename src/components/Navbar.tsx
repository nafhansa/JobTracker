// /home/nafhan/Documents/projek/job/src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const { user } = useAuth();
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
          ? "bg-background/80 dark:bg-card/80 backdrop-blur-xl border-b border-border py-3 shadow-lg"
          : "bg-background/0 dark:bg-card/0 border-transparent py-4 md:py-6"
      }`}
    >
      {/* Ubah px-6 jadi px-4 di mobile biar space lebih lega */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo agak dikecilin dikit di mobile (text-xl) biar gak nabrak */}
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-widest text-foreground flex items-center gap-1 md:gap-2 cursor-pointer transition-colors">
          Job<span className="text-primary">Tracker</span>.
        </Link>
        
        {/* Gap diperkecil di mobile (gap-2) */}
        <nav className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Link
            href="/pricing"
            // Di mobile: text-xs dan px-3 biar muat
            className={`text-xs md:text-sm font-semibold transition duration-300 px-3 py-2 md:px-6 rounded-lg ${
                isScrolled 
                ? "hover:bg-accent hover:text-accent-foreground text-foreground" 
                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
            }`}
          >
            Pricing
          </Link>
          
          {user ? (
            <Link
              href="/dashboard"
              // Di mobile: text-xs dan px-3 biar muat
              className={`text-xs md:text-sm font-semibold transition duration-300 px-3 py-2 md:px-6 rounded-lg ${
                  isScrolled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              // Di mobile: text-xs dan px-3 biar muat
              className={`text-xs md:text-sm font-semibold transition duration-300 px-3 py-2 md:px-6 rounded-lg ${
                  isScrolled 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              }`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
// /home/nafhan/Documents/projek/job/src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";

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
          ? "bg-[#3E0703]/70 backdrop-blur-md border-b border-[#FFF0C4]/10 py-3 shadow-lg"
          : "bg-transparent border-transparent py-4 md:py-6"
      }`}
    >
      {/* Ubah px-6 jadi px-4 di mobile biar space lebih lega */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo agak dikecilin dikit di mobile (text-xl) biar gak nabrak */}
        <Link href="/" className="font-serif text-xl md:text-2xl font-bold tracking-widest text-[#FFF0C4] flex items-center gap-1 md:gap-2 cursor-pointer">
          Job<span className="text-[#8C1007]">Tracker</span>.
        </Link>
        
        {/* Gap diperkecil di mobile (gap-2) */}
        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/pricing"
            // Di mobile: text-xs dan px-3 biar muat
            className={`text-xs md:text-sm font-bold tracking-widest transition duration-300 uppercase px-3 py-2 md:px-6 rounded-sm ${
                isScrolled 
                ? "hover:bg-[#8C1007] hover:text-white text-[#FFF0C4]" 
                : "text-[#FFF0C4]/80 hover:text-white"
            }`}
          >
            Pricing
          </Link>
          
          {user ? (
            <Link
              href="/dashboard"
              // Di mobile: text-xs dan px-3 biar muat
              className={`text-xs md:text-sm font-bold tracking-widest transition duration-300 uppercase px-3 py-2 md:px-6 rounded-sm ${
                  isScrolled 
                  ? "hover:bg-[#8C1007] hover:text-white text-[#FFF0C4]" 
                  : "bg-[#8C1007] text-white hover:bg-[#a31208]"
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              // Di mobile: text-xs dan px-3 biar muat
              className={`text-xs md:text-sm font-bold tracking-widest transition duration-300 uppercase px-3 py-2 md:px-6 rounded-sm ${
                  isScrolled 
                  ? "hover:bg-[#8C1007] hover:text-white text-[#FFF0C4]" 
                  : "bg-[#8C1007] text-white hover:bg-[#a31208]"
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
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
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
          ? "bg-[#3E0703]/70 backdrop-blur-md border-b border-[#FFF0C4]/10 py-3 shadow-lg" // State saat discroll (Glass)
          : "bg-transparent border-transparent py-6" // State saat di paling atas (Clean)
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {}
        <div className="font-serif text-2xl font-bold tracking-widest text-[#FFF0C4] flex items-center gap-2">
          Job<span className="text-[#8C1007]">Tracker</span>.
        </div>
        {}
        <nav>
          <Link
            href="/login"
            className={`text-sm font-bold tracking-widest transition duration-300 uppercase px-6 py-2 rounded-sm ${
                isScrolled 
                ? "hover:bg-[#8C1007] hover:text-white text-[#FFF0C4]" 
                : "bg-[#8C1007] text-white hover:bg-[#a31208]"
            }`}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
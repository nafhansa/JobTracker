"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onCTAClick: () => void;
  onInstallClick: () => void;
}

export default function HeroSection({ onCTAClick, onInstallClick }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>(".hero-letter");

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const seed = 42;
      const seededRandom = (i: number) => {
        const x = Math.sin(seed + i * 127.1) * 43758.5453;
        return x - Math.floor(x);
      };

      const scatterOverrides: Record<number, Partial<{ x: number; y: number; rotation: number; scale: number; opacity: number }>> = {};

      const scatterData = letters.map((_, i) => {
        // Menyebar huruf secara melingkar (ellipse) untuk mencegah tumpang tindih
        // Ditambah sedikit random noise agar tetap terlihat tersebar natural
        const angle = (i / letters.length) * Math.PI * 2;
        const angleNoise = (seededRandom(i * 4) - 0.5) * 0.6;
        const finalAngle = angle + angleNoise;
        
        const radiusX = vw * 0.38 + (seededRandom(i * 4 + 1) - 0.5) * vw * 0.15;
        const radiusY = vh * 0.38 + (seededRandom(i * 4 + 2) - 0.5) * vh * 0.15;

        return {
          x: Math.cos(finalAngle) * radiusX,
          y: Math.sin(finalAngle) * radiusY,
          rotation: (seededRandom(i * 4 + 3) - 0.5) * 90,
          scale: 0.65 + seededRandom(i * 4 + 4) * 0.35,
          opacity: 0.15,
          ...scatterOverrides[i],
        };
      });

      gsap.set(".hero-content", { y: "60vh", opacity: 0, scale: 0.97 });
      gsap.set(".hero-content-child", { y: 30, opacity: 0 });

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=80%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      letters.forEach((letter, i) => {
        scrollTl.to(
          letter,
          {
            x: scatterData[i].x,
            y: scatterData[i].y,
            rotation: scatterData[i].rotation,
            scale: scatterData[i].scale,
            opacity: scatterData[i].opacity,
            duration: 1,
            ease: "none",
            force3D: true,
          },
          i * 0.01
        );
      });

      scrollTl.fromTo(
        ".hero-content",
        { y: "60vh", opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power2.out", force3D: true },
        0.25
      );

      scrollTl.fromTo(
        ".hero-content-child",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out", force3D: true },
        0.35
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const brandText = "JobTracker.";
  const letters = brandText.split("");

  return (
    <section
      ref={sectionRef}
      className="relative z-30 w-full h-screen bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-500"
      style={{ contain: "layout style paint" }}
    >
      {/* Background dark mode glow elements */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[128px] opacity-50 mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[128px] opacity-50 mix-blend-screen" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ willChange: "transform" }}>
        <div className="relative flex flex-wrap justify-center">
          {letters.map((char, i) => (
            <span
              key={i}
              className={`hero-letter text-5xl md:text-9xl lg:text-[10rem] font-black inline-block leading-none tracking-tight md:tracking-normal ${
                i < 3 ? "text-black dark:text-white" : "text-blue-600 dark:text-blue-500"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>

      <div className="hero-content absolute inset-0 flex items-center justify-center z-20 opacity-0" style={{ willChange: "transform, opacity" }}>
        <div className="flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <h2 className="hero-content-child text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Track Your Job Applications With{" "}
            <br className="md:hidden" />
            <span className="text-blue-600 dark:text-blue-500">No Setup</span>
          </h2>

          <div className="hero-content-child w-full max-w-3xl mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-950 z-10 pointer-events-none" />
            <Image
              src="/laptop.svg"
              alt="Dashboard Preview"
              width={1200}
              height={750}
              className="w-full h-auto relative z-0 drop-shadow-2xl dark:opacity-90 dark:brightness-[0.85] transition-all"
              priority
            />
          </div>

          <p className="hero-content-child text-lg md:text-xl text-black dark:text-slate-300 max-w-2xl mb-8 leading-relaxed font-bold transition-colors">
            Throw your Spreadsheets and start tracking now.
          </p>

          <div className="hero-content-child flex flex-col sm:flex-row gap-4 relative z-20">
            <button
              onClick={onInstallClick}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl border-2 border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-foreground transition-all duration-300 shadow-lg dark:shadow-none"
            >
              <Play className="w-5 h-5 mr-2 text-black dark:text-white" />
              Watch Demo
            </button>

            <Link
              href="/login"
              onClick={onCTAClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] dark:shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
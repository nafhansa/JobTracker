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

      const scatterOverrides: Record<number, Partial<{ x: number; y: number; rotation: number; scale: number; opacity: number }>> = {
        7: { y: 200 },
      };

      const scatterData = letters.map((_, i) => ({
        x: (seededRandom(i * 3) - 0.5) * vw * 1.2,
        y: (seededRandom(i * 3 + 1) - 0.5) * vh * 1.0,
        rotation: (seededRandom(i * 3 + 2) - 0.5) * 60,
        scale: 0.7 + seededRandom(i * 3 + 3) * 0.3,
        opacity: 0.15,
        ...scatterOverrides[i],
      }));

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
      className="relative z-30 w-full h-screen bg-white overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ willChange: "transform" }}>
        <div className="relative flex flex-wrap justify-center">
          {letters.map((char, i) => (
            <span
              key={i}
              className={`hero-letter text-5xl md:text-9xl lg:text-[10rem] font-black inline-block leading-none tracking-tight md:tracking-normal ${
                i < 3 ? "text-black" : "text-blue-600"
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
            <span className="text-blue-600">No Setup</span>
          </h2>

          <div className="hero-content-child w-full max-w-3xl mb-6">
            <Image
              src="/laptop.svg"
              alt="Dashboard Preview"
              width={1200}
              height={750}
              className="w-full h-auto"
              priority
            />
          </div>

          <p className="hero-content-child text-lg md:text-xl text-black max-w-2xl mb-8 leading-relaxed font-bold">
            Throw your Spreadsheets and start tracking now.
          </p>

          <div className="hero-content-child flex flex-col sm:flex-row gap-4">
            <button
              onClick={onInstallClick}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-md hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>

            <Link
              href="/login"
              onClick={onCTAClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)]"
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
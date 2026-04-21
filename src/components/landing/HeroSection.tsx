"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Download, Check, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/language/context";
import InteractiveGrid from "../InteractiveGrid";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onCTAClick: () => void;
  onInstallClick: () => void;
}

const comparisons = [
  { feature: "Visual Stage Tracking", jobtracker: true, spreadsheet: false },
  { feature: "Salary Recording", jobtracker: true, spreadsheet: false },
  { feature: "Mobile Optimized", jobtracker: true, spreadsheet: false },
  { feature: "Auto Follow-ups", jobtracker: true, spreadsheet: false },
  { feature: "Zero Setup", jobtracker: true, spreadsheet: false },
];

export default function HeroSection({ onCTAClick, onInstallClick }: HeroSectionProps) {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [ctaVariant, setCtaVariant] = useState<"A" | "B" | "C">("A");

  useEffect(() => {
    const variants: ("A" | "B" | "C")[] = ["A", "B", "C"];
    setCtaVariant(variants[Math.floor(Math.random() * variants.length)]);

    const ctx = gsap.context(() => {
      // Intro animation
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".gsap-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(".gsap-title-line", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.4")
        .fromTo(".gsap-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".gsap-actions", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".gsap-laptop", { x: 80, opacity: 0, scale: 0.92 }, { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" }, "-=0.8");

      // Floating laptop
      gsap.to(".gsap-laptop-inner", {
        y: -15,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Scroll-driven animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Text column exits left quickly
      scrollTl.to(".gsap-text-col", {
        xPercent: -100,
        opacity: 0,
        ease: "power2.inOut",
      }, 0);

      // Laptop shifts further left to make room for comparison
      scrollTl.to(".gsap-laptop", {
        xPercent: -70,
        scale: 0.88,
        ease: "power2.inOut",
      }, 0);

      // Comparison card enters from right
      scrollTl.fromTo(
        ".gsap-compare-col",
        { xPercent: 110, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: "power2.out" },
        0.25
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden">
      <InteractiveGrid />

      <div ref={scrollContainerRef} className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-[90rem] mx-auto px-6 py-24 md:py-32">
          <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-14 lg:gap-20">
            {/* TEXT COLUMN */}
            <div className="gsap-text-col flex-[0.38] min-w-0 text-center md:text-left will-change-transform">
              <div className="gsap-badge opacity-0 inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border border-primary/20 rounded-full text-primary bg-primary/5 backdrop-blur-md">
                <Star className="w-3 h-3 text-primary fill-current" />
                {t("hero.badge")}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
                <span className="gsap-title-line opacity-0 block">{t("hero.title.1")}</span>
                <span className="gsap-title-line opacity-0 block mt-2">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-primary/20 blur-2xl rounded-full"></span>
                    <span className="relative text-primary">{t("hero.title.2")}</span>
                  </span>
                </span>
                <span className="gsap-title-line opacity-0 block mt-2">{t("hero.title.3")}</span>
              </h1>

              <p className="gsap-desc opacity-0 text-base md:text-lg text-muted-foreground max-w-xl font-normal leading-relaxed mb-8">
                {t("hero.description")}{" "}
                <span className="text-foreground font-semibold underline decoration-primary/30 decoration-2 underline-offset-4">
                  {t("hero.description.2")}
                </span>
              </p>

              <div className="gsap-actions opacity-0 flex flex-col sm:flex-row justify-center md:justify-start gap-4 w-full sm:w-auto">
                <Link
                  href="/login"
                  onClick={onCTAClick}
                  className={`group relative inline-flex items-center justify-center px-8 py-4 text-sm md:text-base font-bold rounded-xl text-white bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(59,130,246,0.5)] uppercase ${
                    ctaVariant === "B" ? "md:text-lg px-10 py-5" : ""
                  }`}
                >
                  <span className="relative z-10 flex items-center">
                    {t("hero.cta.primary")}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <button
                  onClick={onInstallClick}
                  className="inline-flex items-center justify-center px-8 py-4 text-sm md:text-base font-bold border-2 border-border/50 bg-white/50 backdrop-blur-md rounded-xl hover:bg-white transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </button>
              </div>
            </div>

            {/* LAPTOP COLUMN - bigger and will shift left on scroll */}
            <div className="gsap-laptop opacity-0 flex-[0.62] min-w-0 relative will-change-transform">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] -z-10" />
              <div className="gsap-laptop-inner relative w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] transform-gpu">
                <Image
                  src="/laptop.svg"
                  alt="Dashboard Preview"
                  width={1400}
                  height={875}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* COMPARISON COLUMN - slides in from right on scroll, bigger */}
            <div className="gsap-compare-col absolute top-1/2 right-0 lg:right-10 -translate-y-1/2 w-full max-w-md lg:max-w-lg opacity-0 pointer-events-none md:pointer-events-auto will-change-transform">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl border border-border/50">
                <h3 className="text-xl md:text-2xl font-bold mb-1 text-foreground">
                  {t("comparison.title")}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-6">
                  {t("comparison.subtitle")}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>{t("comparison.features")}</span>
                    <div className="flex gap-6">
                      <span className="w-10 text-center">SS</span>
                      <span className="w-10 text-center text-primary">JT</span>
                    </div>
                  </div>

                  {comparisons.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                      <span className="text-sm md:text-base font-medium text-foreground pr-4">{item.feature}</span>
                      <div className="flex gap-6 shrink-0">
                        <div className="w-10 flex justify-center">
                          {item.spreadsheet ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div className="w-10 flex justify-center">
                          {item.jobtracker ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

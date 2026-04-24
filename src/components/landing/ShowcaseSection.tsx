"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Bell, BarChart3 } from "lucide-react";
import gsap from "gsap";
import { useLanguage } from "@/lib/language/context";

const phones = [
  { src: "/phone.png", alt: "Dashboard Preview" },
  { src: "/phone2.png", alt: "Application Tracking Preview" },
  { src: "/phone3.png", alt: "Reminders Preview" },
  { src: "/phone4.png", alt: "Statistics Preview" },
];

const features = [
  { icon: Zap, titleKey: "phone.feature.1.title", descKey: "phone.feature.1.desc" },
  { icon: Bell, titleKey: "phone.feature.2.title", descKey: "phone.feature.2.desc" },
  { icon: BarChart3, titleKey: "phone.feature.3.title", descKey: "phone.feature.3.desc" },
];

const SLIDE_DURATION = 3500;

export default function ShowcaseSection() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const prevRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const goTo = useCallback((next: number) => {
    const prev = prevRef.current;
    if (next === prev) return;
    prevRef.current = next;

    if (tweenRef.current) tweenRef.current.kill();

    const prevEl = slidesRef.current[prev];
    const nextEl = slidesRef.current[next];
    if (prevEl) gsap.to(prevEl, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    if (nextEl) {
      gsap.set(nextEl, { opacity: 0 });
      tweenRef.current = gsap.to(nextEl, { opacity: 1, duration: 0.5, ease: "power2.out" });
    }

    setActive(next);
  }, []);

  const goNext = useCallback(() => {
    goTo((prevRef.current + 1) % phones.length);
  }, [goTo]);

  const goPrev = useCallback(() => {
    goTo((prevRef.current - 1 + phones.length) % phones.length);
  }, [goTo]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(goNext, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, isPaused, goNext]);

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.06]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              {t("phone.badge")}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-5">
            {t("phone.title").split("\n").map((line, i) => (
              <span key={i} className="block whitespace-nowrap">{line}</span>
            ))}
          </h2>

          <p className="text-base md:text-lg text-white/60 max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
            {t("phone.subtitle")}
          </p>

          <div className="flex flex-col gap-4 mb-8 md:mb-8">
            {features.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex items-start gap-3 text-left">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t(titleKey)}</p>
                  <p className="text-white/50 text-sm">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-blue-700 bg-white hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.25)]"
            >
              {t("phone.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div
          className="flex-1 flex flex-col items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="relative flex items-center gap-4">
            <button
              onClick={goPrev}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-white/50 shadow-md hover:bg-blue-50 transition-all duration-200 shrink-0"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-blue-700" />
            </button>

            <div className="relative w-[220px] md:w-[280px] lg:w-[300px]" style={{ aspectRatio: "407/858" }}>
              <div className="absolute -inset-8 bg-white/10 rounded-[3rem] blur-2xl pointer-events-none" />
              {phones.map((phone, i) => (
                <div
                  key={phone.src}
                  ref={(el) => { slidesRef.current[i] = el; }}
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Image
                    src={phone.src}
                    alt={phone.alt}
                    width={407}
                    height={858}
                    className="w-full h-auto drop-shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-white/50 shadow-md hover:bg-blue-50 transition-all duration-200 shrink-0"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-blue-700" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {phones.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? "bg-white w-7" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="md:hidden w-full text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-blue-700 bg-white hover:bg-blue-50 active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.25)]"
          >
            {t("phone.cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
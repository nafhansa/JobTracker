"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

interface EarlyBirdSectionProps {
  onCTAClick: () => void;
}

export default function EarlyBirdSection({ onCTAClick }: EarlyBirdSectionProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEarlyBirdExpired, setIsEarlyBirdExpired] = useState(false);

  useEffect(() => {
    setMounted(true);

    const EARLY_BIRD_END_DATE = new Date();
    EARLY_BIRD_END_DATE.setDate(EARLY_BIRD_END_DATE.getDate() + 3);
    EARLY_BIRD_END_DATE.setHours(23, 59, 59, 999);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = EARLY_BIRD_END_DATE.getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    const initial = calculateTimeLeft();
    setTimeLeft({
      days: initial.days,
      hours: initial.hours,
      minutes: initial.minutes,
      seconds: initial.seconds,
    });
    setIsEarlyBirdExpired(initial.expired);

    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft((prev) => {
        if (prev.days === result.days && prev.hours === result.hours &&
            prev.minutes === result.minutes && prev.seconds === result.seconds) {
          return prev;
        }
        return {
          days: result.days,
          hours: result.hours,
          minutes: result.minutes,
          seconds: result.seconds,
        };
      });
      setIsEarlyBirdExpired((prev) => prev !== result.expired ? result.expired : prev);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || isEarlyBirdExpired) return null;

  return (
    <section className="w-full max-w-6xl px-6 py-12 md:py-16 relative z-10 mx-auto">
      <div className="relative bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        <div className="relative z-10 p-6 md:p-10">
          <div className="md:hidden space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  {t("early.badge")}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("early.title.mobile")}
              </h2>
              <p className="text-base text-foreground mb-4">
                {t("early.price.mobile")} <span className="font-bold text-primary">Rp51.988</span>
              </p>
              <p className="text-sm text-muted-foreground line-through mb-2">
                {t("early.regular")}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-border">
              <div className="text-center mb-3">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{t("early.timer")}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {String(timeLeft.days).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{t("early.days")}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{t("early.hours")}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{t("early.minutes")}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{t("early.seconds")}</p>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              onClick={onCTAClick}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary/90 transition-all duration-300 shadow-md"
            >
              {t("early.cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  {t("early.badge")}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {t("early.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {t("early.subtitle")}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">{t("early.timer")}</span>
                <div className="flex items-center gap-2 font-mono text-lg font-bold text-foreground">
                  <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                    {String(timeLeft.days).padStart(2, "0")}d
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                    {String(timeLeft.hours).padStart(2, "0")}h
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                    {String(timeLeft.minutes).padStart(2, "0")}m
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span className="bg-slate-50 border border-border px-3 py-2 rounded-lg">
                    {String(timeLeft.seconds).padStart(2, "0")}s
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              onClick={onCTAClick}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:scale-105"
            >
              {t("early.cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
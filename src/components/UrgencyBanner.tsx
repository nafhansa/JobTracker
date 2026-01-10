"use client";

import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import Link from "next/link";

// Early bird pricing ends in 3 days from now
const EARLY_BIRD_END_DATE = new Date();
EARLY_BIRD_END_DATE.setDate(EARLY_BIRD_END_DATE.getDate() + 3);
EARLY_BIRD_END_DATE.setHours(23, 59, 59, 999);

// Early bird lifetime price
const EARLY_BIRD_LIFETIME_PRICE = "9.99";
const REGULAR_LIFETIME_PRICE = "17.99";

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

export function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const initial = calculateTimeLeft();
    return {
      days: initial.days,
      hours: initial.hours,
      minutes: initial.minutes,
      seconds: initial.seconds,
    };
  });
  const [isExpired, setIsExpired] = useState(() => calculateTimeLeft().expired);

  useEffect(() => {
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
      setIsExpired((prev) => prev !== result.expired ? result.expired : prev);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-[#8C1007] via-[#a01208] to-[#8C1007] border-b border-[#FFF0C4]/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FFF0C4] animate-pulse" />
          <span className="text-sm sm:text-base font-bold text-[#FFF0C4]">
            🎉 Early Bird Special:
          </span>
          <span className="text-sm sm:text-base font-bold text-[#FFF0C4]">
            Lifetime Access Only ${EARLY_BIRD_LIFETIME_PRICE} (Was ${REGULAR_LIFETIME_PRICE})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FFF0C4]" />
          <span className="text-xs sm:text-sm text-[#FFF0C4]/90">Ends in:</span>
          <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-[#FFF0C4]">
            <span className="bg-[#FFF0C4]/20 px-2 py-1 rounded">
              {String(timeLeft.days).padStart(2, "0")}d
            </span>
            <span>:</span>
            <span className="bg-[#FFF0C4]/20 px-2 py-1 rounded">
              {String(timeLeft.hours).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="bg-[#FFF0C4]/20 px-2 py-1 rounded">
              {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="bg-[#FFF0C4]/20 px-2 py-1 rounded">
              {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>

        <Link
          href="/pricing"
          className="ml-auto text-xs sm:text-sm font-bold text-[#FFF0C4] underline hover:text-white transition-colors"
        >
          Claim Offer →
        </Link>
      </div>
    </div>
  );
}

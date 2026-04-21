"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language/context";

export default function ShowcaseSection() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a1628]">
      {/* Ambient glow behind phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center gap-6 md:gap-8 pt-16 pb-20">
        {/* Title */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          {t("phone.title")}
        </h2>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-white/50 max-w-md">
          Track your applications on the go. Fully responsive, lightning fast, and built for mobile.
        </p>

        {/* Phone mockup */}
        <div
          className="relative mt-4 md:mt-6"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          {/* Phone frame */}
          <div className="relative w-[260px] h-[530px] md:w-[300px] md:h-[610px] rounded-[2.8rem] bg-gradient-to-b from-white/15 to-white/5 border-[6px] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-sm">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[30px] bg-black rounded-b-[1rem] z-20 flex items-end justify-center pb-1">
              <div className="w-16 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Screen bezel */}
            <div className="absolute inset-[3px] rounded-[2.4rem] bg-black overflow-hidden">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-8 z-10 flex items-center justify-between px-6 pt-1">
                <span className="text-[10px] font-semibold text-white">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-white/40" />
                  <div className="w-3 h-3 rounded-full border border-white/40" />
                  <div className="w-4 h-2 rounded-sm border border-white/40" />
                </div>
              </div>

              {/* Screen content */}
              <div className="absolute inset-0 pt-8">
                <Image
                  src="/dashboard-preview.png"
                  alt="Mobile Dashboard Preview"
                  width={600}
                  height={1200}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>

              {/* Bottom home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-10" />
            </div>
          </div>

          {/* Reflection/shine effect */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 rounded-[3.5rem] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

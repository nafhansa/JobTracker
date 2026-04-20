"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Download } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

interface HeroSectionProps {
  onCTAClick: () => void;
  onInstallClick: () => void;
}

export default function HeroSection({ onCTAClick, onInstallClick }: HeroSectionProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [ctaVariant, setCtaVariant] = useState<"A" | "B" | "C">("A");

  useEffect(() => {
    setMounted(true);
    const variants: ("A" | "B" | "C")[] = ["A", "B", "C"];
    const randomIndex = Math.floor(Math.random() * variants.length);
    setCtaVariant(variants[randomIndex]);
  }, []);

  return (
    <section className="pt-24 md:pt-20 pb-20 px-6 text-center max-w-5xl mx-auto">
      <div className="flex flex-col items-center space-y-6 md:space-y-4">
        {!mounted ? (
          <HeroSkeleton />
        ) : (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border border-primary/30 rounded-full text-primary bg-primary/10 backdrop-blur-sm">
              <Star className="w-3 h-3 text-primary fill-current" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
              {t("hero.title.1")} <br />
              <span className="relative whitespace-nowrap">
                <span className="absolute -inset-1 bg-primary/10 blur-xl rounded-full"></span>
                <span className="relative text-primary">{t("hero.title.2")}</span>
              </span>
            </h1>

            <div className="relative w-full max-w-4xl md:max-w-2xl px-2 md:px-4 mt-1 md:mt-1 mb-2 md:mb-1 perspective-[2000px] group scale-90 md:scale-85">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 md:w-3/4 h-1/2 md:h-3/4 bg-primary/10 rounded-full blur-[100px]"></div>

              <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-xl backdrop-blur-sm transform rotate-x-[0deg] group-hover:rotate-x-[10deg] transition-all duration-700 ease-out">
                <div className="h-6 md:h-8 bg-muted/50 flex items-center px-3 md:px-4 space-x-2 border-b border-border">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                  <div className="ml-2 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-background/50 rounded text-[9px] md:text-[10px] text-muted-foreground font-mono hidden md:block">jobtrackerapp.site/dashboard</div>
                </div>

                <div className="relative aspect-video w-full bg-background">
                  <Image
                    src="/dashboard-preview.png"
                    alt="JobTracker Dashboard Interface"
                    fill
                    className="object-cover object-top"
                    priority
                    quality={100}
                    unoptimized
                  />
                </div>
              </div>
            </div>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mt-2 md:mt-0.5 mb-3 md:mb-4">
              {t("hero.description")}{" "}
              <span className="text-foreground font-semibold underline decoration-primary decoration-2 underline-offset-4">
                {t("hero.description.2")}
              </span>
              .
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full sm:w-auto">
              <Link
                href="/login"
                onClick={onCTAClick}
                className={`group relative inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg uppercase overflow-hidden ${
                  ctaVariant === "B" ? "md:text-lg md:px-10 md:py-5" : ""
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {t("hero.cta.primary")}
                  <ArrowRight className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button
                onClick={onInstallClick}
                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Install App
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
        <div className="w-3 h-3 rounded-sm bg-muted-foreground/30"></div>
        <div className="h-3 w-52 bg-muted-foreground/30 rounded"></div>
      </div>

      <div className="mt-6 md:mt-4 space-y-2">
        <div className="h-[2.5rem] md:h-[4.125rem] lg:h-[5rem] w-[19rem] md:w-[29rem] lg:w-[34rem] bg-muted rounded animate-pulse mx-auto"></div>
        <div className="h-[2.5rem] md:h-[4.125rem] lg:h-[5rem] w-[14rem] md:w-[21rem] lg:w-[25rem] bg-muted rounded animate-pulse mx-auto"></div>
      </div>

      <div className="mt-6 md:mt-4 relative w-full max-w-4xl md:max-w-2xl px-2 md:px-4 scale-90 md:scale-85">
        <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          <div className="h-6 md:h-8 bg-muted/50 flex items-center px-3 md:px-4 space-x-2 border-b border-border">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/50"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/50"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/50"></div>
            <div className="ml-2 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-background/50 rounded h-4 md:h-5 w-44 hidden md:flex items-center">
              <div className="h-2.5 md:h-3 w-36 bg-muted-foreground/20 rounded"></div>
            </div>
          </div>
          <div className="relative aspect-video w-full bg-muted animate-pulse"></div>
        </div>
      </div>

      <div className="mt-6 md:mt-4 space-y-1.5 max-w-2xl mx-auto px-4">
        <div className="h-5 md:h-6 lg:h-7 w-full bg-muted rounded animate-pulse"></div>
        <div className="h-5 md:h-6 lg:h-7 w-48 md:w-60 lg:w-72 bg-muted rounded animate-pulse mx-auto"></div>
      </div>

      <div className="mt-6 md:mt-4 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0">
        <div className="h-12 md:h-14 w-full sm:w-auto sm:min-w-[165px] md:min-w-[188px] bg-muted rounded-lg animate-pulse"></div>
        <div className="h-12 md:h-14 w-full sm:w-auto sm:min-w-[145px] md:min-w-[165px] bg-muted rounded-lg animate-pulse border border-border"></div>
      </div>
    </>
  );
}
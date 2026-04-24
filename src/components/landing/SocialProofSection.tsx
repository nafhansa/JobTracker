"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

export default function SocialProofSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 w-full bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute -inset-3 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                <Image
                  src="/founder.png"
                  alt={t("social.name")}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-primary/20 mb-4 rotate-180" />
            <div className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 space-y-3">
              {t("social.subtitle").split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <p className="text-lg md:text-xl font-semibold text-foreground mb-8">
              {t("social.subtitle.2")}
            </p>
            <div>
              <p className="font-bold text-foreground">{t("social.name")}</p>
              <p className="text-sm md:text-base text-primary">{t("social.role")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
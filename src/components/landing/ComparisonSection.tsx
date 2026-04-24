"use client";

import { Check, X, Star } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

export default function ComparisonSection() {
  const { t } = useLanguage();

  return (
    <section id="comparison" className="py-20 w-full max-w-6xl px-6 relative z-10 mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {t("comparison.title")}
        </h2>
        <p className="text-muted-foreground text-lg">
          {t("comparison.subtitle")}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-2 md:p-8 shadow-sm">
        <div className="hidden md:grid grid-cols-3 gap-6 items-stretch">
          <div className="flex flex-col px-4 py-8">
            <div className="h-[120px] flex flex-col justify-end pb-8 border-b border-border mb-6">
              <h3 className="text-xl font-bold text-foreground text-left">
                {t("comparison.features")}
              </h3>
            </div>
            <div className="flex flex-col space-y-4">
              {[
                t("comparison.feature.1"),
                t("comparison.feature.2"),
                t("comparison.feature.3"),
                t("comparison.feature.4"),
              ].map((feature, idx) => (
                <div key={idx} className="h-12 flex items-center text-base font-medium text-muted-foreground">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-md"></div>

            <div className="relative bg-card border-2 border-primary rounded-xl p-8 shadow-md h-full">
              <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-primary/30 mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {t("comparison.jobtracker")}
                </h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-xs font-semibold text-white shadow-sm">
                  <Star className="w-3 h-3 fill-white" />
                  {t("comparison.winner")}
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <ComparisonItem value={t("comparison.yes")} icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                <ComparisonItem value={t("comparison.yes")} icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                <ComparisonItem value={t("comparison.yes")} icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                <ComparisonItem value={t("comparison.organized")} icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
                <ComparisonItem value={t("comparison.yes")} icon={<Check className="w-3.5 h-3.5" />} isPositive={true} />
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="bg-muted/30 border border-border rounded-xl p-8 h-full">
              <div className="h-[120px] flex flex-col justify-end items-center pb-8 border-b border-border mb-6">
                <h3 className="text-2xl font-bold text-muted-foreground">
                  {t("comparison.spreadsheets")}
                </h3>
              </div>

              <div className="flex flex-col space-y-4">
                <ComparisonItem value={t("comparison.no")} icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                <ComparisonItem value={t("comparison.no")} icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                <ComparisonItem value={t("comparison.no")} icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                <ComparisonItem value={t("comparison.messy")} icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
                <ComparisonItem value={t("comparison.painful")} icon={<X className="w-3.5 h-3.5" />} isPositive={false} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {t("comparison.why")}
            </h3>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
              <Star className="w-3 h-3 fill-primary" />
              {t("comparison.recommended")}
            </div>
          </div>

          {[
            { feature: t("comparison.feature.5"), jobtracker: t("comparison.yes"), spreadsheet: t("comparison.no") },
            { feature: t("comparison.feature.1"), jobtracker: t("comparison.yes"), spreadsheet: t("comparison.no") },
            { feature: t("comparison.feature.2"), jobtracker: t("comparison.yes"), spreadsheet: t("comparison.no") },
            { feature: t("comparison.feature.3"), jobtracker: t("comparison.organized"), spreadsheet: t("comparison.messy") },
            { feature: t("comparison.feature.4"), jobtracker: t("comparison.yes"), spreadsheet: t("comparison.painful") },
          ].map((item, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="text-sm font-semibold text-foreground mb-4 text-center tracking-wide uppercase">
                {item.feature}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-primary/10 rounded-lg blur-sm"></div>
                  <div className="relative bg-card border border-primary rounded-lg p-3 text-center h-full flex flex-col justify-center items-center">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">{t("comparison.jobtracker")}</div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-primary" /> {item.jobtracker}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-3 text-center h-full flex flex-col justify-center items-center">
                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("comparison.spreadsheets")}</div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <X className="w-4 h-4" /> {item.spreadsheet}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonItem({ value, icon, isPositive }: { value: string, icon: React.ReactNode, isPositive: boolean }) {
  return (
    <div className="h-12 flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
          isPositive
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-base font-medium ${
          isPositive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
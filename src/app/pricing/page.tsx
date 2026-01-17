"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { CheckCircle2, ArrowRight, Star, Tag, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

// Early bird pricing check (same as UrgencyBanner)
const EARLY_BIRD_END_DATE = new Date();
EARLY_BIRD_END_DATE.setDate(EARLY_BIRD_END_DATE.getDate() + 3);
EARLY_BIRD_END_DATE.setHours(23, 59, 59, 999);

const EARLY_BIRD_LIFETIME_PRICE = "7.99";
const REGULAR_LIFETIME_PRICE = "17.99";

function isEarlyBirdActive(): boolean {
  return new Date().getTime() < EARLY_BIRD_END_DATE.getTime();
}

export default function PricingPage() {
  const { t } = useLanguage();
  const [isEarlyBird] = useState(() => isEarlyBirdActive());

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16">
        <section className="text-center max-w-4xl mx-auto px-6 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {t("pricing.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </section>

        <section className="w-full max-w-6xl mx-auto px-6 mt-16">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* FREE PLAN */}
            <PricingCard
              plan={t("pricing.free.title")}
              price="$0"
              period="forever"
              description={t("pricing.free.desc")}
              features={[
                t("pricing.free.feature1").replace('5', FREE_PLAN_JOB_LIMIT.toString()),
                t("pricing.free.feature2"),
                t("pricing.free.feature3"),
                t("pricing.free.feature4"),
              ]}
              buttonText={t("pricing.free.cta")}
              isFree
            />

            {/* MONTHLY PLAN */}
            <PricingCard
              plan={t("pricing.monthly.title")}
              price="$1.99"
              originalPrice="$2.99"
              period="/month"
              description={t("pricing.monthly.desc")}
              features={[
                t("pricing.monthly.feature1"),
                t("pricing.monthly.feature2"),
                t("pricing.monthly.feature3"),
                t("pricing.monthly.feature4"),
              ]}
              buttonText={t("pricing.monthly.cta")}
            />

            {/* LIFETIME PLAN */}
            <PricingCard
              plan={t("pricing.lifetime.title")}
              price={isEarlyBird ? `$${EARLY_BIRD_LIFETIME_PRICE}` : `$${REGULAR_LIFETIME_PRICE}`}
              originalPrice={isEarlyBird ? `$${REGULAR_LIFETIME_PRICE}` : "$24.99"}
              period="one-time"
              description={isEarlyBird ? t("pricing.lifetime.desc.early") : t("pricing.lifetime.desc")}
              features={[
                t("pricing.lifetime.feature1"),
                t("pricing.lifetime.feature2"),
                t("pricing.lifetime.feature3"),
                t("pricing.lifetime.feature4"),
              ]}
              buttonText={t("pricing.lifetime.cta")}
              isFeatured
            />
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-border text-center text-sm text-muted-foreground relative z-10">
        <p>&copy; {new Date().getFullYear()} JobTracker. {t("footer.rights")}</p>
      </footer>
    </div>
  );
}

function PricingCard({
  plan,
  price,
  originalPrice,
  period,
  description,
  features,
  buttonText,
  isFeatured = false,
  isFree = false,
}: {
  plan: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isFeatured?: boolean;
  isFree?: boolean;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div
      className={`group relative p-8 rounded-2xl transition-all duration-300 bg-card border shadow-sm ${
        isFeatured 
          ? "border-primary border-2 shadow-md md:-translate-y-4 z-10" 
          : isFree
          ? "border-border hover:border-primary/30 hover:shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-md"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-4 right-6">
          <span className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> {t("pricing.badge.best")}
          </span>
        </div>
      )}
      
      {isFree && (
        <div className="absolute -top-4 right-6">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
            <Gift className="w-3 h-3 fill-current" /> {t("pricing.badge.free")}
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold text-foreground">{plan}</h3>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
      
      <div className="mt-6">
        {originalPrice && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg text-muted-foreground line-through decoration-muted-foreground decoration-2 font-medium">
              {originalPrice}
            </span>
            <span className="text-[10px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-blue-200">
              <Tag className="w-3 h-3" /> 
              {(() => {
                // Calculate discount percentage
                const original = parseFloat(originalPrice.replace('$', ''));
                const current = parseFloat(price.replace('$', ''));
                const discount = Math.round(((original - current) / original) * 100);
                return `${t("pricing.badge.save")} ${discount}%`;
              })()}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground font-medium">{period}</span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 p-0.5 rounded-full ${isFeatured ? "bg-primary/20 text-primary" : "text-muted-foreground/40"}`}>
              <CheckCircle2 className={`w-5 h-5 ${isFeatured ? "text-emerald-500" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-sm ${isFeatured ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 relative z-20">
        <button
          onClick={() => {
            if (user) {
              // If user is logged in, go to dashboard
              router.push("/dashboard");
            } else {
              // If user is not logged in, go to login
              router.push("/login");
            }
          }}
          className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg transition-all duration-300 group-hover:scale-[1.02] ${
            isFeatured
              ? "bg-primary text-white hover:bg-primary/90 shadow-md"
              : isFree
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
              : "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {user ? t("nav.dashboard") : buttonText}
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {isFeatured && (
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          {t("pricing.guarantee")}
        </p>
      )}
    </div>
  );
}
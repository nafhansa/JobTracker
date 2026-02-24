"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { CheckCircle2, ArrowRight, Star, Tag, Gift, AlertTriangle, Clock, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { detectLocation } from "@/lib/utils/location";
import { PRICING_USD, PRICING_IDR, LIFETIME_ACCESS_LIMIT } from "@/lib/pricing-config";

interface LifetimeAvailability {
  totalPurchased: number;
  limit: number;
  remaining: number;
  isAvailable: boolean;
}

export default function PricingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isIndonesia, setIsIndonesia] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [lifetimeAvailability, setLifetimeAvailability] = useState<LifetimeAvailability | null>(null);
  const [loadingLifetime, setLoadingLifetime] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const location = await detectLocation();
        setIsIndonesia(location.isIndonesia);
        
        const response = await fetch('/api/payment/lifetime-availability');
        const data = await response.json();
        setLifetimeAvailability(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setLoadingLocation(false);
        setLoadingLifetime(false);
      }
    };
    
    fetchData();
  }, []);

  const pricing = isIndonesia ? PRICING_IDR : PRICING_USD;
  const isLoading = loadingLocation || loadingLifetime;
  const showLifetime = !loadingLifetime && lifetimeAvailability?.isAvailable;
  const showMidtransBadge = isIndonesia && !isLoading;

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
          
          {showMidtransBadge && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <span>🇮🇩</span>
              <span>Pembayaran via Midtrans (BCA, Mandiri, BNI, dll)</span>
            </div>
          )}
        </section>

        {!loadingLifetime && showLifetime && lifetimeAvailability && (
          <section className="w-full max-w-6xl mx-auto px-6 mt-12">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Lifetime Access Slots Tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    {lifetimeAvailability.remaining} dari {LIFETIME_ACCESS_LIMIT} slot tersisa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">
                  {Math.round((lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100)}%
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="w-full max-w-6xl mx-auto px-6 mt-16">
          {isLoading ? (
            <div className="grid gap-6 lg:gap-8 items-start md:grid-cols-3">
              <PricingCardSkeleton />
              <PricingCardSkeleton />
              <PricingCardSkeleton isFeatured={true} />
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:gap-8 items-start md:grid-cols-3">
                
                <PricingCard
                  plan={t("pricing.free.title")}
                  price={pricing.free.price}
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

                <PricingCard
                  plan={t("pricing.monthly.title")}
                  price={pricing.monthly.price}
                  originalPrice={pricing.monthly.originalPrice}
                  period={isIndonesia ? "/bulan" : "/month"}
                  description={t("pricing.monthly.desc")}
                  features={[
                    t("pricing.monthly.feature1"),
                    t("pricing.monthly.feature2"),
                    t("pricing.monthly.feature3"),
                    t("pricing.monthly.feature4"),
                  ]}
                  buttonText={t("pricing.monthly.cta")}
                  isIndonesia={isIndonesia}
                />

                {showLifetime ? (
                  <PricingCard
                    plan={t("pricing.lifetime.title")}
                    price={pricing.lifetime.price}
                    originalPrice={pricing.lifetime.originalPrice}
                    period="one-time"
                    description={t("pricing.lifetime.desc")}
                    features={[
                      t("pricing.lifetime.feature1"),
                      t("pricing.lifetime.feature2"),
                      t("pricing.lifetime.feature3"),
                      t("pricing.lifetime.feature4"),
                    ]}
                    buttonText={t("pricing.lifetime.cta")}
                    isFeatured
                    isIndonesia={isIndonesia}
                    showSlotCounter={true}
                    remainingSlots={lifetimeAvailability?.remaining || 0}
                  />
                ) : null}
              </div>

              {!loadingLifetime && !showLifetime && (
                <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-1">Lifetime Access Habis</p>
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                    Semua {LIFETIME_ACCESS_LIMIT} slot lifetime access sudah terisi. Tapi jangan khawatir, paket bulanan tetap tersedia!
                  </p>
                </div>
              )}
            </>
          )}
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
  isIndonesia = false,
  showSlotCounter = false,
  remainingSlots = 0,
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
  isIndonesia?: boolean;
  showSlotCounter?: boolean;
  remainingSlots?: number;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubscribe = async () => {
    const { user } = useAuth();
    
    if (isIndonesia && user) {
      try {
        const planType = plan.toLowerCase().includes('lifetime') ? 'lifetime' : 'monthly';
        
        const response = await fetch('/api/payment/midtrans/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            plan: planType,
            customerDetails: {
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              phone: user.phoneNumber || '',
            },
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('midtransToken', data.token);
          localStorage.setItem('midtransOrderId', data.orderId);
          router.push(`/payment/midtrans?orderId=${data.orderId}`);
        } else {
          console.error('Failed to create transaction:', data.error);
          alert('Failed to create payment. Please try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to create payment. Please try again.');
      }
    } else if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

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
                const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
                const current = parseFloat(price.replace(/[^0-9.]/g, ''));
                const discount = original > 0 ? Math.round(((original - current) / original) * 100) : 0;
                return `${t("pricing.badge.save")} ${discount}%`;
              })()}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground font-medium">{period}</span>
        </div>

        {showSlotCounter && (
          <div className="mt-2 flex items-center gap-2 text-xs text-primary">
            <Clock className="w-3 h-3" />
            <span>{remainingSlots} slot tersisa</span>
          </div>
        )}
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
          onClick={handleSubscribe}
          className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg transition-all duration-300 group-hover:scale-[1.02] ${
            isFeatured
              ? "bg-primary text-white hover:bg-primary/90 shadow-md"
              : isFree
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
              : "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {user ? (isIndonesia ? (isFree ? t("nav.dashboard") : "Bayar Sekarang") : t("nav.dashboard")) : buttonText}
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

function PricingCardSkeleton({ isFeatured = false }: { isFeatured?: boolean }) {
  return (
    <div
      className={`group relative p-8 rounded-2xl transition-all duration-300 bg-card border shadow-sm animate-pulse ${
        isFeatured 
          ? "border-primary border-2 shadow-md md:-translate-y-4 z-10" 
          : "border-border"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-4 right-6">
          <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 h-7 w-24"></div>
        </div>
      )}

      <div className="space-y-4">
        <div className="h-7 bg-muted rounded w-32"></div>
        <div className="h-4 bg-muted rounded w-48"></div>
        
        {isFeatured && (
          <>
            <div className="flex items-center gap-2 mb-1 mt-6">
              <div className="h-5 bg-muted rounded w-24"></div>
              <div className="h-5 bg-muted rounded w-16"></div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="h-4 bg-muted rounded w-4"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          </>
        )}

        <div className="flex items-baseline gap-1 mt-6">
          <div className="h-12 bg-muted rounded w-40"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-muted rounded-full"></div>
            <div className="h-4 bg-muted rounded flex-1"></div>
          </div>
        ))}
      </div>

      <div className="h-12 bg-muted rounded w-full mt-8"></div>
      {isFeatured && (
        <div className="h-3 bg-muted rounded w-32 mx-auto mt-4"></div>
      )}
    </div>
  );
}

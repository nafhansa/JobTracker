"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CheckCircle2, ArrowRight, Star, Tag, Gift, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectLocation } from "@/lib/utils/location";
import { PRICING_USD, PRICING_IDR, LIFETIME_ACCESS_LIMIT } from "@/lib/pricing-config";
import { MIDTRANS_PRICES } from "@/lib/midtrans-config";

export default function UpgradePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 md:pt-32 pb-16 px-6">
        <div className="w-full max-w-6xl mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-foreground hover:text-primary hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Upgrade Your Account
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            You've reached your free plan limit. Upgrade to unlock unlimited job tracking and premium features.
          </p>
        </div>

        <PricingCards user={user} />
      </main>
    </div>
  );
}

function PricingCards({ user }: { user: any }) {
  const { t } = useLanguage();
  
  const [isIndonesia, setIsIndonesia] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [lifetimeAvailability, setLifetimeAvailability] = useState<any>(null);
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
  const showLifetime = !loadingLifetime && lifetimeAvailability?.isAvailable;

  return (
    <div className="w-full max-w-6xl">
      {loadingLocation || loadingLifetime ? (
        <div className="grid gap-6 lg:gap-8 items-start md:grid-cols-3">
          <PricingCardSkeleton />
          <PricingCardSkeleton />
          <PricingCardSkeleton isFeatured={true} />
        </div>
      ) : (
        <>
          <div className={`grid gap-6 lg:gap-8 items-start ${showLifetime ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            
            <PricingCard
              plan="Free Plan"
              price={pricing.free.price}
              period="forever"
              description="Your current plan"
              features={[
                "Track up to 5 Applications",
                "Basic Kanban Board",
                "Basic Filters",
                "View & Track Status",
              ]}
              buttonText="Current Plan"
              isFree
              disabled={true}
              user={user}
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
              user={user}
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
                user={user}
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
                Semua 20 slot lifetime access sudah terisi. Tapi jangan khawatir, paket bulanan tetap tersedia!
              </p>
            </div>
          )}
        </>
      )}
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
  disabled = false,
  user,
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
  disabled?: boolean;
  user?: any;
}) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (disabled) return;

    if (user) {
      if (isIndonesia) {
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

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Payment API error:', response.status, errorText);
            alert(`Payment error (${response.status}): ${errorText || 'Unknown error'}`);
            return;
          }

          const data = await response.json();

          if (data.success) {
            localStorage.setItem('midtransToken', data.token);
            localStorage.setItem('midtransOrderId', data.orderId);
            localStorage.setItem('midtransAmount', (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeIDR : MIDTRANS_PRICES.monthlyIDR).toString());
            router.push(`/payment/midtrans?orderId=${data.orderId}`);
          } else {
            console.error('Failed to create transaction:', data.error);
            alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Payment error:', error);
          alert(`Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        router.push("/dashboard");
      }
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
          ? "border-border opacity-75"
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
          <span className="bg-gray-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
            Current
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
          disabled={disabled}
          className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg transition-all duration-300 group-hover:scale-[1.02] ${
            isFeatured
              ? "bg-primary text-white hover:bg-primary/90 shadow-md"
              : isFree
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {disabled ? buttonText : (user ? (isIndonesia ? "Bayar Sekarang" : "Upgrade") : buttonText)}
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

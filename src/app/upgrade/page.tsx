"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import Navbar from "@/components/Navbar";
import { TwitterShareModal } from "@/components/TwitterShareModal";
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
  const router = useRouter();

  const [isIndonesia, setIsIndonesia] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [lifetimeAvailability, setLifetimeAvailability] = useState<any>(null);
  const [loadingLifetime, setLoadingLifetime] = useState(true);
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [pendingPlanType, setPendingPlanType] = useState<'monthly' | 'lifetime'>('monthly');

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
      {!loadingLifetime && showLifetime && lifetimeAvailability && (
        <div className="mb-8 bg-gradient-to-r from-orange-500/90 to-red-500/90 border border-orange-400/50 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4 shadow-lg animate-[scale-up-down_2s_ease-in-out_infinite]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-full">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-base">Limited Availability: {lifetimeAvailability.remaining} slots remaining</p>
              <p className="text-sm text-white/90">
                {LIFETIME_ACCESS_LIMIT - lifetimeAvailability.remaining} already claimed • Claim yours today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${(lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white bg-white/15 px-3 py-1.5 rounded-full">
              {Math.round((lifetimeAvailability.remaining / LIFETIME_ACCESS_LIMIT) * 100)}% available
            </span>
          </div>
        </div>
      )}
      {loadingLocation || loadingLifetime ? (
        <div className="grid gap-6 lg:gap-8 items-start md:grid-cols-3">
          <PricingCardSkeleton />
          <PricingCardSkeleton />
          <PricingCardSkeleton isFeatured={true} />
        </div>
      ) : (
        <>
          <div className={`grid gap-6 lg:gap-8 items-stretch ${showLifetime ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            
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
              discount={pricing.monthly.discount}
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
                discount={pricing.lifetime.discount}
                onLifetimeClick={() => {
                  setPendingPlanType('lifetime');
                  setShowTwitterModal(true);
                }}
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

          <TwitterShareModal
            isOpen={showTwitterModal}
            onClose={() => setShowTwitterModal(false)}
            onConfirm={async () => {
              setShowTwitterModal(false);
              if (user) {
                const planType = pendingPlanType;
                const response = await fetch('/api/payment/midtrans/charge', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.uid,
                    plan: planType,
                    currency: isIndonesia ? 'IDR' : 'USD',
                    customerDetails: {
                      firstName: user.displayName?.split(' ')[0] || '',
                      lastName: user.displayName?.split(' ').slice(1).join('') || '',
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
                  router.push(`/payment/midtrans?orderId=${data.orderId}`);
                } else {
                  console.error('Failed to create transaction:', data.error);
                  alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
                }
              }
             }}
          />
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
  discount,
  onLifetimeClick,
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
  discount?: string;
  onLifetimeClick?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'gopay_tokenization'>('credit_card');

  const isLifetime = plan.toLowerCase().includes('lifetime');
  const isMonthly = plan.toLowerCase().includes('monthly');
  const isFreePlan = plan.toLowerCase().includes('free');

  const handleSubscribe = async () => {
    if (disabled) return;

    if (user) {
      const planType = isLifetime ? 'lifetime' : 'monthly';

      if (!isIndonesia || isLifetime) {
        const response = await fetch('/api/payment/midtrans/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            plan: planType,
            currency: isIndonesia ? 'IDR' : 'USD',
            paymentMethod: null,
            customerDetails: {
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join('') || '',
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
          router.push(`/payment/midtrans?orderId=${data.orderId}`);
        } else {
          console.error('Failed to create transaction:', data.error);
          alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
        }
      } else {
        const response = await fetch('/api/payment/midtrans/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            plan: 'monthly',
            currency: 'IDR',
            paymentMethod: paymentMethod,
            customerDetails: {
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join('') || '',
              email: user.email || '',
              phone: user.phoneNumber || '',
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Payment API error:', response.status, errorText);
          alert(`Payment error: ${response.status}: ${errorText || 'Unknown error'}`);
          return;
        }

        const data = await response.json();

        if (data.success) {
          router.push(`/payment/midtrans?orderId=${data.orderId}`);
        } else {
          console.error('Failed to create transaction:', data.error);
          alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
        }
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      className={`group relative h-full flex flex-col p-10 rounded-2xl transition-all duration-300 bg-card border ${
        isFeatured
          ? "border-primary/50 shadow-lg md:-translate-y-2 z-10 ring-2 ring-primary/10"
          : isFree
          ? "border-border opacity-75"
          : "border-border hover:border-primary/20 hover:shadow-sm"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-3 right-6">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-full tracking-wide shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> {t("pricing.badge.best")}
          </span>
        </div>
      )}
      
      {isFree && (
        <div className="absolute -top-3 right-6">
          <span className="bg-gray-500 text-white text-xs font-medium px-4 py-1.5 rounded-full tracking-wide shadow-md flex items-center gap-1">
            Current
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold text-foreground">{plan}</h3>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
      
      <div className="mt-8">
        {originalPrice && (
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-lg text-muted-foreground line-through decoration-muted-foreground decoration-2 font-medium">
              {originalPrice}
            </span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
              {discount ? `Save ${discount}` : (() => {
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
          <div className="mt-3 bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30 rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                {remainingSlots} slots remaining
              </span>
              <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70">
                Limited availability
              </span>
            </div>
          </div>
        )}
      </div>

      <ul className="mt-8 space-y-4 flex-1">
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

      {!isFreePlan && !isLifetime && isMonthly && isIndonesia && (
        <div className="mt-8 mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Auto-Renew (Recommended)
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            Choose payment method for automatic monthly billing
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 border border-blue-200 dark:border-blue-800 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <input
                type="radio"
                name={`paymentMethod-${plan}`}
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'gopay_tokenization')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Kartu Kredit/Debit</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">Visa, Mastercard, JCB</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 border border-blue-200 dark:border-blue-800 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <input
                type="radio"
                name={`paymentMethod-${plan}`}
                value="gopay_tokenization"
                checked={paymentMethod === 'gopay_tokenization'}
                onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'gopay_tokenization')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">GoPay</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">Auto-deduct from GoPay balance</p>
              </div>
            </label>
          </div>

          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 italic">
            Pembayaran akan otomatis diperpanjang setiap bulan sampai Anda cancel.
            Anda bisa cancel kapan saja di halaman Billing.
          </p>
        </div>
      )}

      <div className="mt-10 relative z-20">
        <button
          onClick={() => {
            if (disabled) return;
            if (isFree) {
              return;
            }
            if (!user) {
              router.push("/login");
              return;
            }
            if (isFeatured && onLifetimeClick) {
              onLifetimeClick();
            } else {
              handleSubscribe();
            }
          }}
          disabled={disabled}
          className={`relative w-full inline-flex items-center justify-center px-8 py-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
            isFeatured
              ? "bg-primary text-white hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-primary/50"
              : isFree
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {disabled
            ? buttonText
            : user
            ? (isFree
                ? buttonText
                : isIndonesia && isMonthly && !isFreePlan && !isLifetime
                ? `Subscribe with Auto-Renew (${paymentMethod === 'credit_card' ? 'Card' : 'GoPay'})`
                : isIndonesia ? "Bayar Sekarang" : "Pay Now")
            : buttonText}
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
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

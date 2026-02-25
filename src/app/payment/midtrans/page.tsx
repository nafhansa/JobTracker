"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck, 
  Lock, 
  CreditCard 
} from "lucide-react";

function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!orderId) {
        setError("Missing order ID");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payment/midtrans/charge?orderId=${orderId}`);

        if (!response.ok) {
          const errorText = await response.text();
          setError(`Payment API error (${response.status}): ${errorText || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.amount) {
          setPaymentData({
            ...data,
            amount: data.amount,
          });
          setIsLoading(false);
        } else {
          setError(data.error || "Failed to fetch payment data");
          setIsLoading(false);
        }
      } catch (err) {
        setError("Failed to connect to payment server");
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [orderId]);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (typeof window === 'undefined' || !window.snap) {
        setError("Midtrans Snap not loaded. Please refresh page.");
        setIsLoading(false);
        return;
      }

      const snapToken = paymentData?.token;

      window.snap?.pay(snapToken, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
          setIsLoading(false);
        },
        onError: (result: any) => {
          console.error('Payment failed:', result);
          setError('Payment failed. Please try again.');
          setIsLoading(false);
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  // --- UI STATES ---

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Invalid Request</h1>
          <p className="text-muted-foreground">Order ID is missing from the URL.</p>
          <button
            onClick={() => router.push("/upgrade")}
            className="mt-6 w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Back to Upgrade
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h1 className="text-xl font-semibold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to complete your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Back Button */}
          <button
            onClick={() => router.push("/upgrade")}
            className="mb-8 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Upgrade
          </button>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
                <h2 className="text-lg font-semibold mb-2">Preparing Checkout</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Please wait a moment while we set up your secure payment session.
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Payment Error</h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : paymentData && (
              <div className="flex flex-col">
                {/* Header */}
                <div className="bg-muted/30 border-b border-border p-6 text-center">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                </div>

                {/* Body / Receipt */}
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Order ID</span>
                      <span className="text-sm font-mono text-foreground">{orderId}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Payment Gateway</span>
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Midtrans
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-medium">Total Amount</span>
                      <span className="text-2xl font-bold tracking-tight text-primary">
                        Rp {paymentData.amount?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                  >
                    Pay Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Trust Badges */}
                <div className="bg-muted/30 p-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Secure by Midtrans</span>
                    </div>
                    <div className="hidden sm:block text-border">•</div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Encrypted Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Cancel Link */}
          {!isLoading && !error && (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/upgrade")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel transaction
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-border text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} JobTracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function MidtransPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <PaymentPage />
    </Suspense>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CheckCircle2, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";

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
        const token = localStorage.getItem('midtransToken');
        const storedOrderId = localStorage.getItem('midtransOrderId');

        if (!token || storedOrderId !== orderId) {
          setError("Payment session expired. Please go back and try again.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/payment/midtrans/charge?orderId=${orderId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentData({
            ...data,
            token: token,
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
        onFailed: (result: any) => {
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

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Request</h1>
          <p className="text-muted-foreground">Order ID is missing from URL.</p>
          <button
            onClick={() => router.push("/upgrade")}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Upgrade
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col items-center pt-24 pb-16 px-6">
        <button
          onClick={() => router.push("/upgrade")}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          Back to Upgrade
        </button>

        <div className="w-full max-w-3xl mx-auto space-y-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold">Preparing Payment...</h2>
              <p className="text-muted-foreground">Please wait while we prepare your secure payment.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-500 mb-2">Payment Error</h2>
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => router.push("/upgrade")}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          ) : paymentData && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Complete Your Payment</h2>
                  <p className="text-muted-foreground">
                    You will be redirected to Midtrans secure payment gateway.
                  </p>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="text-base font-mono text-foreground">{orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold text-foreground">
                        Rp{paymentData.amount?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="text-base font-medium text-primary">Midtrans Snap</p>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Secure payment powered by Midtrans</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <p>🔒 Your payment information is encrypted and secure</p>
                  <p>💳 Multiple payment methods available (GoPay, ShopeePay, etc.)</p>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => router.push("/upgrade")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel & Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-10 border-t border-border text-center text-sm text-muted-foreground relative z-10">
        <p>&copy; {new Date().getFullYear()} JobTracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function MidtransPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PaymentPage />
    </Suspense>
  );
}

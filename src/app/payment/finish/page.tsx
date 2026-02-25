"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Home, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/firebase/auth-context";

function PaymentFinishContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { reloadSubscription } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyMessage, setVerifyMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!searchParams) return;

    const orderId = searchParams.get("order_id");
    const transactionStatus = searchParams.get("transaction_status");

    console.log("Payment finish:", { orderId, transactionStatus });

    const verifyPayment = async () => {
      if (!orderId) {
        setVerifyMessage("Order ID not found. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }

      try {
        const response = await fetch('/api/payment/midtrans/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (data.success) {
          setVerifyMessage("Payment verified successfully! Your subscription is now active.");

          setTimeout(async () => {
            await reloadSubscription();
            setIsRedirecting(true);
            router.push("/dashboard");
          }, 1000);
        } else {
          setVerifyMessage(data.message || "Payment verification pending. Redirecting to dashboard...");
          setTimeout(() => router.push("/dashboard"), 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerifyMessage("Unable to verify payment automatically. Please check your dashboard.");
        setTimeout(() => router.push("/dashboard"), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const transactionStatus = searchParams?.get("transaction_status");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {isVerifying ? (
            <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              {isVerifying ? "Processing Payment..." : "Payment Successful!"}
            </h1>
            <p className="text-muted-foreground">
              {verifyMessage}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push("/pricing")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
            >
              View Pricing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentFinishContent />
    </Suspense>
  );
}

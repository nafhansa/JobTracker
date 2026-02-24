"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function PaymentFinishPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const transactionStatus = params.get("transaction_status");

    console.log("Payment finish:", { orderId, transactionStatus });

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [router]);

  const params = new URLSearchParams(window.location.search);
  const transactionStatus = params.get("transaction_status");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              {transactionStatus === "settlement" || transactionStatus === "capture" 
                ? "Your subscription has been activated. Redirecting to dashboard..."
                : "Your payment is being processed. You'll receive a confirmation email shortly."
              }
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

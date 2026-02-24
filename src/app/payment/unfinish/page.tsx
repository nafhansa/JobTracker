"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function PaymentUnfinishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("order_id");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Payment Incomplete</h1>
            <p className="text-muted-foreground">
              Your payment hasn't been completed yet. You can continue your payment or come back later.
            </p>
            
            {orderId && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground mb-1">Order ID:</p>
                <p className="font-mono text-sm font-medium">{orderId}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/pricing")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Try Again
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, Home, ArrowRight, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";

function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("order_id");
  const errorCode = searchParams?.get("error_code");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground">
              There was an error processing your payment. Please try again or contact support if problem persists.
            </p>
            
            {orderId && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground mb-1">Order ID:</p>
                <p className="font-mono text-sm font-medium">{orderId}</p>
                {errorCode && (
                  <>
                    <p className="text-sm text-muted-foreground mb-1 mt-2">Error Code:</p>
                    <p className="font-mono text-sm text-red-500">{errorCode}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/pricing")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
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

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}

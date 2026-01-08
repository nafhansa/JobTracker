"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Calendar, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BillingPage() {
  const router = useRouter();
  const { user, subscription, loading: authLoading } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCancelSubscription = async () => {
    if (!subscription?.paypalSubscriptionId) {
      alert("No subscription found to cancel");
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscriptionId: subscription.paypalSubscriptionId 
        })
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      setCancelSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel subscription. Please contact support.");
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#1a0201] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8C1007] animate-spin" />
      </div>
    );
  }

  const isLifetime = subscription?.plan === "lifetime";
  const isActive = subscription?.status === "active";
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "canceled";
  
  const rawRenewsAt = subscription?.renewsAt;
  const rawEndsAt = subscription?.endsAt;

  const endsAt = subscription?.endsAt
    ? new Date(subscription.endsAt).toLocaleDateString("en-US", { 
        year: "numeric", month: "long", day: "numeric" 
      })
    : null;

  return (
    <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4]">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-[#FFF0C4] hover:text-[#FFF0C4] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-[#FFF0C4] mb-2">
            Billing & Subscription
          </h1>
          <p className="text-[#FFF0C4]/60">
            Manage your subscription and payment details
          </p>
        </div>

        {/* Success Message */}
        {cancelSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">
              Subscription cancelled successfully. Your access will continue until the end of the billing period.
            </p>
          </div>
        )}

        {/* Current Plan Card */}
        <Card className="bg-[#3E0703]/40 border-[#FFF0C4]/10 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#FFF0C4] flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Current Plan
                </CardTitle>
                <CardDescription className="text-[#FFF0C4]/60">
                  Your subscription details
                </CardDescription>
              </div>
              <Badge 
                variant={isActive ? "default" : "outline"}
                className={
                  isActive 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }
              >
                {subscription?.status || "No Plan"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                {/* Plan Type */}
                <div className="flex justify-between items-center py-3 border-b border-[#FFF0C4]/10">
                  <span className="text-[#FFF0C4]/60">Plan Type</span>
                  <span className="font-semibold text-[#FFF0C4]">
                    {isLifetime ? "Lifetime Access" : "Monthly Pro"}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center py-3 border-b border-[#FFF0C4]/10">
                  <span className="text-[#FFF0C4]/60">Price</span>
                  <span className="font-semibold text-[#FFF0C4]">
                    {isLifetime ? "$17.99 (One-time)" : "$2.99/month"}
                  </span>
                </div>

                {/* Next Billing / End Date */}
                {!isLifetime && (
                  <div className="flex justify-between items-center py-3 border-b border-[#FFF0C4]/10">
                    <span className="text-[#FFF0C4]/60 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {isCancelled ? "Access Ends" : "Next Billing"}
                    </span>
                    <span className="font-semibold text-[#FFF0C4]">
                     {isCancelled
                        ? formatDate(rawEndsAt)
                        : formatDate(rawRenewsAt)}
                    </span>
                  </div>
                )}

                {/* Subscription ID */}
                {subscription.paypalSubscriptionId && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#FFF0C4]/60">Subscription ID</span>
                    <span className="font-mono text-xs text-[#FFF0C4]/80">
                      {subscription.paypalSubscriptionId.slice(0, 20)}...
                    </span>
                  </div>
                )}

                {/* Cancellation Warning */}
                {isCancelled && endsAt && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-400 mb-1">
                        Subscription Cancelled
                      </p>
                      <p className="text-sm text-[#FFF0C4]/70">
                        You'll continue to have access until {endsAt}. 
                        After that, your account will revert to the free plan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancel Button (Only for active monthly subscriptions) */}
                {!isLifetime && isActive && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="w-full mt-4"
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#2a0401] border-[#FFF0C4]/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#FFF0C4]">
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#FFF0C4]/60">
                          Your subscription will be cancelled, but you'll keep access until the end of 
                          your current billing period ({formatDate(rawRenewsAt)}). You can resubscribe anytime.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#3E0703] border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#3E0703]/80">
                          Keep Subscription
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#FFF0C4]/60 mb-4">
                  You don't have an active subscription
                </p>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-[#8C1007] hover:bg-[#a31208] text-white"
                >
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="bg-[#3E0703]/40 border-[#FFF0C4]/10">
          <CardHeader>
            <CardTitle className="text-[#FFF0C4]">Need Help?</CardTitle>
            <CardDescription className="text-[#FFF0C4]/60">
              Contact our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#FFF0C4]/80 mb-4">
              If you have any questions about your subscription or need assistance, 
              we're here to help.
            </p>
            <a 
              href="mailto:official.jobtrackerapp@gmail.com"
              className="inline-flex items-center text-[#8C1007] hover:text-[#FFF0C4] transition-colors"
            >
              official.jobtrackerapp@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function parseFirebaseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  // Jika sudah berupa Date object
  if (dateValue instanceof Date) return dateValue;
  
  // Jika berupa Firebase Timestamp object { seconds, nanoseconds }
  if (typeof dateValue === "object" && typeof dateValue.toDate === "function") {
    return dateValue.toDate();
  }

  // Jika berupa number (timestamp)
  if (typeof dateValue === "number") {
    return new Date(dateValue);
  }

  // Jika berupa string (Contoh: "February 8, 2026 at 5:00:00 PM UTC+7")
  if (typeof dateValue === "string") {
    const match = dateValue.match(
      /^([A-Za-z]+ \d{1,2}, \d{4}) at (\d{1,2}:\d{2}:\d{2})\s?(AM|PM)? UTC([+-]\d+)?$/
    );
    if (!match) {
        // Fallback untuk string ISO standar
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? null : d;
    }

    const [_, datePart, timePart, ampm, tz] = match;
    let formatted = `${datePart} ${timePart}`;
    if (ampm) formatted += ` ${ampm}`;
    formatted += " GMT"; 
    if (tz) formatted += tz;

    const d = new Date(formatted);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function formatDate(dateValue: any) {
  const parsedDate = parseFirebaseDate(dateValue);
  return parsedDate
    ? parsedDate.toLocaleDateString("id-ID", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })
    : "N/A";
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Calendar, AlertCircle, Loader2, CheckCircle, Gift, ArrowUpRight } from "lucide-react";
import { FREE_PLAN_JOB_LIMIT } from "@/types";
import { getJobCount } from "@/lib/supabase/jobs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { detectLocation } from "@/lib/utils/location";
import { PRICING_USD, PRICING_IDR } from "@/lib/pricing-config";

export default function BillingPage() {
  const router = useRouter();
  const { user, subscription, loading: authLoading } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [isIndonesia, setIsIndonesia] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const isFreePlan = subscription?.plan === "free";

  useEffect(() => {
    if (isFreePlan && user) {
      getJobCount(user.uid).then(setJobCount).catch(() => setJobCount(0));
    }
  }, [isFreePlan, user]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await detectLocation();
        setIsIndonesia(location.isIndonesia);
      } catch (error) {
        console.error('Error detecting location:', error);
        setIsIndonesia(true);
      } finally {
        setLoadingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCancelSubscription = async () => {
    const subscriptionId = subscription?.midtransSubscriptionId as string | undefined;

    if (!subscriptionId) {
      alert("No subscription found to cancel");
      return;
    }

    setCancelling(true);
    try {
      if (!user) {
        throw new Error("No user session");
      }
      const token = await user.getIdToken();
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
          provider: "midtrans"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isLifetime = subscription?.plan === "lifetime";
  const isActive = subscription?.status === "active";
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "canceled";
  const pricing = isIndonesia ? PRICING_IDR : PRICING_USD;

  const rawRenewsAt = subscription?.renewsAt;
  const rawEndsAt = subscription?.endsAt;

  const endsAt = subscription?.endsAt
    ? formatDate(subscription.endsAt)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment details
          </p>
        </div>

        {/* Success Message */}
        {cancelSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-700">
              Subscription cancelled successfully. Your access will continue until the end of the billing period.
            </p>
          </div>
        )}

        {/* Current Plan Card */}
        <Card className="bg-card border-border mb-6 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Current Plan
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your subscription details
                </CardDescription>
              </div>
              <Badge
                variant={isActive ? "default" : "outline"}
                className={
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
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
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Plan Type</span>
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    {isFreePlan ? (
                      <>
                        <Gift className="w-4 h-4 text-blue-500" />
                        Free Plan
                      </>
                    ) : isLifetime ? (
                      "Lifetime Access"
                    ) : (
                      "Monthly Pro"
                    )}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-foreground">
                    {isFreePlan ? "Free" : isLifetime ? pricing.lifetime.price + " (One-time)" : pricing.monthly.price + (isIndonesia ? "/bulan" : "/month")}
                  </span>
                </div>

                {/* Usage for Free Plan */}
                {isFreePlan && jobCount !== null && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Jobs Used</span>
                    <span className="font-semibold text-foreground">
                      {jobCount}/{FREE_PLAN_JOB_LIMIT}
                    </span>
                  </div>
                )}

                {/* Next Billing / End Date */}
                {!isLifetime && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {isCancelled ? "Access Ends" : "Next Billing"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {isCancelled
                        ? formatDate(rawEndsAt)
                        : formatDate(rawRenewsAt)}
                    </span>
                  </div>
                )}

                {/* Subscription ID */}
                {subscription.midtransSubscriptionId && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground">Subscription ID</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {subscription.midtransSubscriptionId
                        ? `${(subscription.midtransSubscriptionId as string).slice(0, 20)}...`
                        : "N/A"}
                    </span>
                  </div>
                )}

                {/* Cancellation Warning */}
                {isCancelled && endsAt && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-700 mb-1">
                        Subscription Cancelled
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ll continue to have access until {endsAt}.
                        After that, your account will revert to the free plan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Upgrade CTA for Free Plan */}
                {isFreePlan && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to Pro for unlimited job tracking and advanced features!
                    </p>
                    <Button
                      onClick={() => router.push("/upgrade")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}

                {/* Cancel Button (Only for active monthly subscriptions) */}
                {!isLifetime && !isFreePlan && isActive && (
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
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Your subscription will be cancelled, but you&apos;ll keep access until the end of
                          your current billing period ({formatDate(rawRenewsAt)}). You can resubscribe anytime.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          Keep Subscription
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-red-500 hover:bg-red-600 text-white"
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
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have an active subscription
                </p>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Need Help?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Contact our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about your subscription or need assistance,
              we&apos;re here to help.
            </p>
            <a
              href="mailto:official.jobtrackerapp@gmail.com"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              official.jobtrackerapp@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function parseFirebaseDate(dateValue: unknown): Date | null {
  if (!dateValue) return null;

  // Jika sudah berupa Date object
  if (dateValue instanceof Date) return dateValue;

  // Jika berupa Firebase Timestamp object { seconds, nanoseconds }
  if (typeof dateValue === "object" && dateValue !== null) {
    interface FirestoreTimestampLike {
      toDate?: () => Date;
    }
    const typed = dateValue as FirestoreTimestampLike;
    if (typeof typed.toDate === "function") {
      return typed.toDate();
    }
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

    const [, datePart, timePart, ampm, tz] = match;
    let formatted = `${datePart} ${timePart}`;
    if (ampm) formatted += ` ${ampm}`;
    formatted += " GMT";
    if (tz) formatted += tz;

    const d = new Date(formatted);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function formatDate(dateValue: unknown) {
  const parsedDate = parseFirebaseDate(dateValue);
  return parsedDate
    ? parsedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
    : "N/A";
}
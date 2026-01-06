"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  CalendarDays, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  X // 👈 Tambahkan import icon X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; 
import { Timestamp } from "firebase/firestore";

export default function BillingPage() {
  const router = useRouter();
  const { user, subscription, loading: authLoading } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const performCancellation = async () => {
    setIsCancelling(true);
    setMessage(null);

    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({
            // ⚠️ FIX: Ganti lemonSqueezyId jadi fastspringId agar sesuai database
            subscriptionId: subscription?.fastspringId, 
            userId: user.uid
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: "Subscription cancelled. Access remains until the period ends." });
      setTimeout(() => window.location.reload(), 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "-";
    const date = dateVal instanceof Timestamp ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const isCancelled = subscription?.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4]">
      {/* Background Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#500905] via-[#1a0201] to-[#000000]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-6 md:py-10">
        <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")}
            className="mb-6 text-[#FFF0C4]/60 hover:text-[#FFF0C4] hover:bg-transparent pl-0"
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF0C4] mb-2">
            Subscription Management
        </h1>
        <p className="text-[#FFF0C4]/60 mb-8">Manage your billing and plan details.</p>

        {/* --- STATUS CARD --- */}
        <Card className="bg-[#2a0401]/80 border-[#FFF0C4]/10 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-[#FFF0C4]/10 pb-4">
                <CardTitle className="text-xl text-[#FFF0C4] flex items-center justify-between">
                    Current Plan
                    <span className={`text-xs px-3 py-1 rounded-full border ${isCancelled ? 'border-red-500/50 text-red-400 bg-red-900/20' : 'border-[#8C1007] text-[#FFF0C4] bg-[#8C1007]/20'} uppercase tracking-wider`}>
                        {subscription?.plan === 'lifetime' ? 'Lifetime' : subscription?.status}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-[#FFF0C4]/40">Plan Type</label>
                        <p className="text-lg font-medium text-[#FFF0C4]">
                            {subscription?.plan === 'lifetime' ? 'Lifetime Pro Access' : 'Monthly Pro Plan'}
                        </p>
                    </div>
                    
                    {subscription?.plan !== 'lifetime' && (
                         <div className="space-y-1">
                            <label className="text-xs uppercase tracking-widest text-[#FFF0C4]/40">
                                {isCancelled ? "Access Ends On" : "Next Billing Date"}
                            </label>
                            <p className="text-lg font-medium text-[#FFF0C4] flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-[#8C1007]" />
                                {isCancelled ? formatDate(subscription?.endsAt) : formatDate(subscription?.renewsAt)}
                            </p>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                {/* --- ACTION BUTTONS --- */}
                {subscription?.plan !== 'lifetime' && !isCancelled && (
                    <div className="pt-6 border-t border-[#FFF0C4]/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <p className="text-sm text-[#FFF0C4]/40 text-center md:text-left">
                            Wish to stop your subscription?<br/>
                            <span className="text-xs">You will retain access until the end of the current period.</span>
                        </p>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            {subscription?.customerPortalUrl && (
                                <Button 
                                    variant="outline"
                                    onClick={() => window.open(subscription.customerPortalUrl, "_blank")} 
                                    className="flex-1 md:flex-none border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#FFF0C4]/10 bg-transparent"
                                >
                                    Update Card
                                </Button>
                            )}

                            {/* --- CUSTOM DIALOG UI --- */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        disabled={isCancelling}
                                        className="flex-1 md:flex-none bg-[#8C1007] hover:bg-[#680903] text-white"
                                    >
                                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
                                    </Button>
                                </AlertDialogTrigger>
                                
                                <AlertDialogContent className="bg-[#1a0201] border border-[#8C1007]/50 text-[#FFF0C4]">
                                    
                                    {/* 👇 INI TOMBOL X (CLOSE) YANG DITAMBAHKAN 👇 */}
                                    {/* Menggunakan AlertDialogCancel sebagai wrapper agar fungsinya menutup modal */}
                                    <AlertDialogCancel className="absolute right-4 top-4 p-0 w-auto h-auto border-none bg-transparent hover:bg-transparent text-[#FFF0C4]/50 hover:text-[#FFF0C4] focus:ring-0">
                                        <X className="w-5 h-5" />
                                        <span className="sr-only">Close</span>
                                    </AlertDialogCancel>

                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-serif text-2xl text-[#FFF0C4] flex items-center gap-3">
                                            <AlertTriangle className="text-[#8C1007]" />
                                            Cancel Subscription?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-[#FFF0C4]/70">
                                            This action cannot be undone immediately. You will lose access to Pro features after <b>{formatDate(subscription?.renewsAt)}</b>.
                                            <br/><br/>
                                            Are you absolutely sure you want to proceed?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-4">
                                        <AlertDialogCancel className="bg-transparent border-[#FFF0C4]/20 text-[#FFF0C4] hover:bg-[#FFF0C4]/10 hover:text-white">
                                            No, Keep Plan
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={(e) => {
                                                e.preventDefault(); 
                                                performCancellation();
                                            }}
                                            className="bg-[#8C1007] text-white hover:bg-[#680903] border-none"
                                        >
                                           {isCancelling ? "Processing..." : "Yes, Cancel My Plan"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            {/* --- END DIALOG UI --- */}

                        </div>
                    </div>
                )}

                 {/* Pesan kalau sudah cancel */}
                 {isCancelled && subscription?.plan !== 'lifetime' && (
                    <div className="mt-4 p-4 bg-[#FFF0C4]/5 border border-[#FFF0C4]/10 rounded-lg text-center flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center gap-2 text-[#FFF0C4]/80 text-sm">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span>Your subscription has been cancelled.</span>
                        </div>
                        <p className="text-[#FFF0C4]/60 text-xs">
                            You can still use Pro features until <b>{formatDate(subscription?.endsAt || subscription?.renewsAt)}</b>.
                        </p>
                        <Button 
                            className="mt-2 bg-[#FFF0C4] text-[#3E0703] hover:bg-[#e0d2aa] font-bold"
                            onClick={() => router.push('/pricing')}
                        >
                            Resubscribe
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>
      </div>
    </div>
  );
}
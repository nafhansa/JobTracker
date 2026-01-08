// src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { PAYPAL_API_URL, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" }, 
        { status: 400 }
      );
    }

    // Get PayPal credentials
    const { clientId, clientSecret } = PAYPAL_CREDENTIALS;

    if (!clientId || !clientSecret) {
      console.error("❌ PayPal credentials missing");
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }

    console.log(`🔧 Using PayPal API: ${PAYPAL_API_URL}`);

    // 👇 TAMBAH: Get current subscription data dari Firebase DULU
    const usersSnapshot = await adminDb
      .collection("users")
      .where("subscription.paypalSubscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: "Subscription not found in database" },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const currentSub = userDoc.data().subscription;
    
    // #region agent log
    console.log("[DEBUG] Cancel endpoint: Current subscription data from Firebase", {
      subscriptionId,
      renewsAt: currentSub?.renewsAt,
      endsAt: currentSub?.endsAt,
      status: currentSub?.status,
      fullSubscription: currentSub
    });
    fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel/route.ts:45',message:'Cancel endpoint: Current subscription data from Firebase',data:{subscriptionId,currentSub:JSON.stringify(currentSub),renewsAt:currentSub?.renewsAt,endsAt:currentSub?.endsAt,status:currentSub?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    
    console.log("📦 Current subscription data:", currentSub);

    // Get PayPal Access Token
    const authResponse = await fetch(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      console.error("❌ PayPal Auth Error:", errorData);
      throw new Error("Failed to get PayPal access token");
    }

    const { access_token } = await authResponse.json();
    console.log("✅ PayPal Access Token obtained");

    // Cancel subscription in PayPal
    const cancelResponse = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          reason: "Customer requested cancellation"
        })
      }
    );

    // PayPal returns 204 on successful cancellation
    if (!cancelResponse.ok && cancelResponse.status !== 204) {
      const errorData = await cancelResponse.json().catch(() => ({}));
      console.error("❌ PayPal cancel error:", errorData);
      throw new Error("Failed to cancel subscription in PayPal");
    }

    console.log("✅ Subscription cancelled in PayPal");

    // 👇 PERBAIKAN: Tentukan end date dengan prioritas yang benar
    let endDate: string | null = null;

    // PRIORITAS 1: Coba ambil dari PayPal API
    const detailsResponse = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (detailsResponse.ok) {
      const subDetails = await detailsResponse.json();
      // #region agent log
      console.log("[DEBUG] Cancel endpoint: PayPal API response", {
        subscriptionId,
        nextBillingTime: subDetails.billing_info?.next_billing_time,
        billingInfo: subDetails.billing_info
      });
      fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel/route.ts:111',message:'Cancel endpoint: PayPal API response',data:{subscriptionId,nextBillingTime:subDetails.billing_info?.next_billing_time,fullBillingInfo:subDetails.billing_info},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      if (subDetails.billing_info?.next_billing_time) {
        endDate = new Date(subDetails.billing_info.next_billing_time).toISOString();
        console.log("✅ Got end date from PayPal API:", endDate);
      }
    }

    // PRIORITAS 2: Kalau PayPal ga return, pakai renewsAt dari Firebase
    if (!endDate && currentSub?.renewsAt) {
      // renewsAt bisa berupa Timestamp object atau string
      if (typeof currentSub.renewsAt === 'string') {
        endDate = currentSub.renewsAt;
      } else if (currentSub.renewsAt.toDate) {
        // Firebase Admin SDK Timestamp
        endDate = currentSub.renewsAt.toDate().toISOString();
      } else if (currentSub.renewsAt._seconds) {
        // Firestore Timestamp format { _seconds, _nanoseconds }
        endDate = new Date(currentSub.renewsAt._seconds * 1000).toISOString();
      }
      console.log("📅 Using renewsAt from Firebase:", endDate);
    }

    // PRIORITAS 3: Fallback - tambah 1 bulan dari updatedAt atau sekarang
    if (!endDate) {
      const baseDate = currentSub?.updatedAt 
        ? new Date(currentSub.updatedAt) 
        : new Date();
      
      baseDate.setMonth(baseDate.getMonth() + 1);
      endDate = baseDate.toISOString();
      console.log("⚠️ Fallback: +1 month from base date:", endDate);
    }

    console.log(`📅 Final end date: ${endDate}`);

    // #region agent log
    console.log("[DEBUG] Cancel endpoint: Final endDate calculated", {
      subscriptionId,
      endDate,
      endDateFormatted: endDate ? new Date(endDate).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : null,
      currentSubRenewsAt: currentSub?.renewsAt,
      currentSubEndsAt: currentSub?.endsAt
    });
    fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel/route.ts:144',message:'Cancel endpoint: Final endDate calculated',data:{endDate,endDateISO:endDate,subscriptionId,currentSubRenewsAt:currentSub?.renewsAt,currentSubEndsAt:currentSub?.endsAt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion

    // Update Firebase - SET endsAt, KEEP renewsAt untuk grace period check
    await userDoc.ref.update({
      "subscription.status": "cancelled",
      "subscription.endsAt": endDate,
      // 👇 JANGAN set renewsAt jadi null! Biarkan tetap ada untuk checkIsPro
      "updatedAt": new Date().toISOString()
    });

    // #region agent log
    console.log("[DEBUG] Cancel endpoint: Firebase updated with endsAt", {
      subscriptionId,
      endDate,
      endDateFormatted: endDate ? new Date(endDate).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : null,
      status: 'cancelled'
    });
    fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel/route.ts:152',message:'Cancel endpoint: Firebase updated with endsAt',data:{endDate,subscriptionId,status:'cancelled'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion

    console.log(`✅ Firebase updated for subscription ${subscriptionId}`);

    return NextResponse.json({ 
      success: true,
      message: "Subscription cancelled successfully",
      endsAt: endDate
    });

  } catch (error: any) {
    console.error("❌ Cancel API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
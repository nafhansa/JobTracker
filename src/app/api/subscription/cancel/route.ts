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

    // Update Firebase - SET endsAt, KEEP renewsAt untuk grace period check
    await userDoc.ref.update({
      "subscription.status": "cancelled",
      "subscription.endsAt": endDate,
      // 👇 JANGAN set renewsAt jadi null! Biarkan tetap ada untuk checkIsPro
      "updatedAt": new Date().toISOString()
    });

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
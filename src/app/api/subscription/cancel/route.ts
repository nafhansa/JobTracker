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

    console.log(`🔧 Using PayPal API: ${PAYPAL_API_URL}`); // 👈 Debug log

    // Get PayPal Access Token
    const authResponse = await fetch(
      `${PAYPAL_API_URL}/v1/oauth2/token`, // ✅ Sudah benar
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
    // 👇 FIX: Ganti hardcode jadi pakai PAYPAL_API_URL
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

    // Get subscription details to find end date
    // 👇 FIX: Ganti hardcode jadi pakai PAYPAL_API_URL
    const detailsResponse = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let endDate = null;
    if (detailsResponse.ok) {
      const subDetails = await detailsResponse.json();
      // billing_info.next_billing_time is when the current period ends
      endDate = subDetails.billing_info?.next_billing_time 
        ? new Date(subDetails.billing_info.next_billing_time).toISOString()
        : new Date().toISOString();
    } else {
      endDate = new Date().toISOString();
    }

    console.log(`📅 Subscription end date: ${endDate}`);

    // Update Firebase
    const usersSnapshot = await adminDb
      .collection("users")
      .where("subscription.paypalSubscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        "subscription.status": "cancelled",
        "subscription.endsAt": endDate,
        "subscription.renewsAt": null,
        "updatedAt": new Date().toISOString()
      });

      console.log(`✅ Firebase updated for subscription ${subscriptionId}`);
    }

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
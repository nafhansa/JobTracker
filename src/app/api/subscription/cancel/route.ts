// src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { PAYPAL_API_URL, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requesterUid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      requesterUid = decoded.uid;
    } catch (err) {
      console.error("❌ Invalid ID token:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const { clientId, clientSecret } = PAYPAL_CREDENTIALS;
    if (!clientId || !clientSecret) {
      console.error("❌ PayPal credentials missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log(`🔧 Using PayPal API: ${PAYPAL_API_URL}`);

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
    if (userDoc.id !== requesterUid) {
      return NextResponse.json(
        { error: "Forbidden: subscription does not belong to current user" },
        { status: 403 }
      );
    }

    const currentSub = userDoc.data().subscription;
    if (!currentSub?.paypalSubscriptionId) {
      return NextResponse.json(
        { error: "No active PayPal subscription for this user" },
        { status: 400 }
      );
    }

    const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      console.error("❌ PayPal Auth Error:", errorData);
      throw new Error("Failed to get PayPal access token");
    }

    const { access_token } = await authResponse.json();
    console.log("✅ PayPal Access Token obtained");

    const cancelResponse = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          reason: "Customer requested cancellation",
        }),
      }
    );

    if (!cancelResponse.ok && cancelResponse.status !== 204) {
      const errorData = await cancelResponse.json().catch(() => ({}));
      console.error("❌ PayPal cancel error:", errorData);
      throw new Error("Failed to cancel subscription in PayPal");
    }

    console.log("✅ Subscription cancelled in PayPal");

    let endDate: string | null = null;

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

    if (!endDate && currentSub?.renewsAt) {
      if (typeof currentSub.renewsAt === "string") {
        endDate = currentSub.renewsAt;
      } else if (currentSub.renewsAt.toDate) {
        endDate = currentSub.renewsAt.toDate().toISOString();
      } else if (currentSub.renewsAt._seconds) {
        endDate = new Date(currentSub.renewsAt._seconds * 1000).toISOString();
      }
      console.log("📅 Using renewsAt from Firebase:", endDate);
    }

    if (!endDate) {
      const baseDate = currentSub?.updatedAt
        ? new Date(currentSub.updatedAt)
        : new Date();

      baseDate.setMonth(baseDate.getMonth() + 1);
      endDate = baseDate.toISOString();
      console.log("⚠️ Fallback: +1 month from base date:", endDate);
    }

    console.log(`📅 Final end date: ${endDate}`);

    await userDoc.ref.update({
      "subscription.status": "cancelled",
      "subscription.endsAt": endDate,
      // keep renewsAt for grace period checks
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Firebase updated for subscription ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      endsAt: endDate,
    });
  } catch (error) {
    const err = error as { message?: string };
    console.error("❌ Cancel API Error:", error);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

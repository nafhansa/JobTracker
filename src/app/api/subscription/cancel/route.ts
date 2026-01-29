// src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { PAYPAL_API_URL, PAYPAL_CREDENTIALS } from "@/lib/paypal-config";

export async function POST(req: Request) {
  try {
    const { subscriptionId, provider } = await req.json();
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

    // Determine provider if not provided
    const effectiveProvider = provider || (subscriptionId.startsWith("sub_") ? "paddle" : "paypal");

    const userIdField = effectiveProvider === "paddle"
      ? "subscription.paddleSubscriptionId"
      : "subscription.paypalSubscriptionId";

    const usersSnapshot = await adminDb
      .collection("users")
      .where(userIdField, "==", subscriptionId)
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
    let endDate: string | null = null;

    if (effectiveProvider === "paddle") {
      // PADDLE CANCELLATION
      const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
      const PADDLE_API_URL = process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
        ? "https://api.paddle.com"
        : "https://sandbox-api.paddle.com";

      if (!PADDLE_API_KEY) {
        console.error("❌ Paddle API key missing");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const cancelResponse = await fetch(`${PADDLE_API_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ effective_from: "next_billing_period" }),
      });

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json().catch(() => ({}));
        console.error("❌ Paddle cancel error:", errorData);
        throw new Error("Failed to cancel subscription in Paddle");
      }

      const cancelData = await cancelResponse.json();
      endDate = cancelData.data.scheduled_change?.effective_at || null;
      console.log("✅ Subscription cancelled in Paddle, ends at:", endDate);

    } else {
      // PAYPAL CANCELLATION
      const { clientId, clientSecret } = PAYPAL_CREDENTIALS;
      if (!clientId || !clientSecret) {
        console.error("❌ PayPal credentials missing");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!authResponse.ok) throw new Error("Failed to get PayPal access token");
      const { access_token } = await authResponse.json();

      const cancelRes = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ reason: "Customer requested cancellation" }),
      });

      if (!cancelRes.ok && cancelRes.status !== 204) {
        const errorData = await cancelRes.json().catch(() => ({}));
        console.error("❌ PayPal cancel error:", errorData);
        throw new Error("Failed to cancel subscription in PayPal");
      }

      // Get end date from details
      const detailsRes = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (detailsRes.ok) {
        const subDetails = await detailsRes.json();
        endDate = subDetails.billing_info?.next_billing_time || null;
      }
    }

    // Fallback end date
    if (!endDate && currentSub?.renewsAt) {
      if (typeof currentSub.renewsAt === "string") {
        endDate = currentSub.renewsAt;
      } else if (currentSub.renewsAt.toDate) {
        endDate = currentSub.renewsAt.toDate().toISOString();
      }
    }

    if (!endDate) {
      const fallback = new Date();
      fallback.setMonth(fallback.getMonth() + 1);
      endDate = fallback.toISOString();
    }

    await userDoc.ref.update({
      "subscription.status": "cancelled",
      "subscription.endsAt": endDate,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      endsAt: endDate,
    });
  } catch (error: any) {
    console.error("❌ Cancel API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

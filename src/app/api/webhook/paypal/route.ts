// src/app/api/webhook/paypal/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.event_type;
    const resource = payload.resource;

    console.log(`🔔 PayPal Webhook: ${eventType}`);

    // Extract user ID from various possible locations
    const userId = 
      resource.custom_id || 
      resource.subscriber?.custom_id ||
      resource.purchase_units?.[0]?.custom_id;

    if (!userId) {
      console.error("❌ No user ID found in webhook payload");
      return NextResponse.json({ error: "No User ID" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    // ==========================================
    // SUBSCRIPTION ACTIVATED (Monthly Plan)
    // ==========================================
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const nextBillingTime = resource.billing_info?.next_billing_time;
      const planId = resource.plan_id;

      await userRef.set({
        isPro: true,
        subscription: {
          plan: "monthly",
          status: "active",
          provider: "paypal",
          paypalSubscriptionId: resource.id,
          paypalPlanId: planId,
          renewsAt: nextBillingTime 
            ? Timestamp.fromDate(new Date(nextBillingTime))
            : null,
          endsAt: null
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log(`✅ Monthly subscription activated for user: ${userId}`);
    }

    // ==========================================
    // SUBSCRIPTION PAYMENT SUCCESS (Renewal)
    // ==========================================
    else if (eventType === "PAYMENT.SALE.COMPLETED") {
      // This fires when a subscription renewal payment succeeds
      const billingAgreementId = resource.billing_agreement_id;
      
      if (billingAgreementId) {
        // Monthly subscription renewal
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 31);

        await userRef.set({
          isPro: true,
          subscription: {
            status: "active",
            renewsAt: Timestamp.fromDate(nextBillingDate),
            endsAt: null
          },
          updatedAt: Timestamp.now()
        }, { merge: true });

        console.log(`✅ Subscription payment completed for user: ${userId}`);
      }
    }

    // ==========================================
    // ONE-TIME PAYMENT COMPLETED (Lifetime)
    // ==========================================
    else if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "CHECKOUT.ORDER.COMPLETED") {
      // This is for lifetime/one-time purchases
      const orderId = resource.id;

      await userRef.set({
        isPro: true,
        subscription: {
          plan: "lifetime",
          status: "active",
          provider: "paypal",
          paypalOrderId: orderId,
          renewsAt: null,
          endsAt: null // Lifetime never expires
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log(`✅ Lifetime purchase completed for user: ${userId}`);
    }

    // ==========================================
    // SUBSCRIPTION CANCELLED
    // ==========================================
    else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      // User or system cancelled the subscription
      const nextBillingTime = resource.billing_info?.next_billing_time;
      const endDate = nextBillingTime 
        ? Timestamp.fromDate(new Date(nextBillingTime))
        : Timestamp.now();

      // Check if we still have access (grace period)
      const stillHasAccess = endDate.toDate() > new Date();

      await userRef.set({
        isPro: stillHasAccess, // Keep pro if still in grace period
        subscription: {
          status: "cancelled",
          renewsAt: null,
          endsAt: endDate
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log(`✅ Subscription cancelled for user: ${userId}. Access until: ${endDate.toDate()}`);
    }

    // ==========================================
    // SUBSCRIPTION EXPIRED
    // ==========================================
    else if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      await userRef.set({
        isPro: false,
        subscription: {
          status: "expired",
          renewsAt: null,
          endsAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log(`✅ Subscription expired for user: ${userId}`);
    }

    // ==========================================
    // SUBSCRIPTION SUSPENDED (Payment Failed)
    // ==========================================
    else if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await userRef.set({
        isPro: false,
        subscription: {
          status: "suspended",
          renewsAt: null
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log(`⚠️ Subscription suspended for user: ${userId}`);
    }

    else {
      console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ PayPal Webhook Error:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
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
      console.log("[PayPal Webhook] Handling CANCELLED event for subscription:", resource.id);
      
      // Get current subscription data from Firebase first
      const userDoc = await userRef.get();
      const currentData = userDoc.data();
      const currentSub = currentData?.subscription;
      const existingEndsAt = currentSub?.endsAt;
      
      // #region agent log
      console.log("[DEBUG] Webhook CANCELLED: Received event", {
        subscriptionId: resource.id,
        userId,
        nextBillingTime: resource.billing_info?.next_billing_time,
        hasNextBillingTime: !!resource.billing_info?.next_billing_time,
        existingEndsAt: existingEndsAt ? (existingEndsAt.toDate ? existingEndsAt.toDate().toISOString() : existingEndsAt) : null,
        billingInfo: resource.billing_info
      });
      fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook/paypal/route.ts:108',message:'Webhook CANCELLED: Received event',data:{subscriptionId:resource.id,nextBillingTime:resource.billing_info?.next_billing_time,hasNextBillingTime:!!resource.billing_info?.next_billing_time,existingEndsAt,fullResource:JSON.stringify(resource).substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      
      // Determine endDate with priority:
      // 1. next_billing_time from PayPal webhook (if available)
      // 2. existing endsAt from Firebase (if available and in future)
      // 3. existing renewsAt from Firebase (if available and in future)
      // 4. Timestamp.now() as last resort
      let endDate: Timestamp;
      const nextBillingTime = resource.billing_info?.next_billing_time;
      
      if (nextBillingTime) {
        // Priority 1: Use next_billing_time from PayPal
        endDate = Timestamp.fromDate(new Date(nextBillingTime));
        console.log("[DEBUG] Webhook CANCELLED: Using next_billing_time from PayPal:", endDate.toDate().toISOString());
      } else if (existingEndsAt) {
        // Priority 2: Use existing endsAt from Firebase
        if (existingEndsAt.toDate) {
          // Firebase Timestamp
          const existingDate = existingEndsAt.toDate();
          if (existingDate > new Date()) {
            endDate = existingEndsAt;
            console.log("[DEBUG] Webhook CANCELLED: Using existing endsAt from Firebase:", endDate.toDate().toISOString());
          } else {
            endDate = Timestamp.now();
            console.log("[DEBUG] Webhook CANCELLED: Existing endsAt is in past, using now()");
          }
        } else if (typeof existingEndsAt === 'string') {
          // String ISO format
          const existingDate = new Date(existingEndsAt);
          if (existingDate > new Date()) {
            endDate = Timestamp.fromDate(existingDate);
            console.log("[DEBUG] Webhook CANCELLED: Using existing endsAt (string) from Firebase:", endDate.toDate().toISOString());
          } else {
            endDate = Timestamp.now();
            console.log("[DEBUG] Webhook CANCELLED: Existing endsAt (string) is in past, using now()");
          }
        } else {
          endDate = Timestamp.now();
          console.log("[DEBUG] Webhook CANCELLED: Could not parse existing endsAt, using now()");
        }
      } else if (currentSub?.renewsAt) {
        // Priority 3: Use renewsAt from Firebase
        let renewsAtDate: Date;
        if (currentSub.renewsAt.toDate) {
          renewsAtDate = currentSub.renewsAt.toDate();
        } else if (typeof currentSub.renewsAt === 'string') {
          renewsAtDate = new Date(currentSub.renewsAt);
        } else if (currentSub.renewsAt._seconds) {
          renewsAtDate = new Date(currentSub.renewsAt._seconds * 1000);
        } else {
          renewsAtDate = new Date();
        }
        
        if (renewsAtDate > new Date()) {
          endDate = Timestamp.fromDate(renewsAtDate);
          console.log("[DEBUG] Webhook CANCELLED: Using renewsAt from Firebase:", endDate.toDate().toISOString());
        } else {
          endDate = Timestamp.now();
          console.log("[DEBUG] Webhook CANCELLED: renewsAt is in past, using now()");
        }
      } else {
        // Priority 4: Last resort - use now()
        endDate = Timestamp.now();
        console.log("[DEBUG] Webhook CANCELLED: No valid date found, using now() as fallback");
      }

      // #region agent log
      console.log("[DEBUG] Webhook CANCELLED: Calculated endDate", {
        subscriptionId: resource.id,
        userId,
        nextBillingTime,
        endDateISO: endDate.toDate().toISOString(),
        endDateFormatted: endDate.toDate().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        usedPayPalNextBilling: !!nextBillingTime,
        usedExistingEndsAt: !nextBillingTime && !!existingEndsAt,
        usedRenewsAt: !nextBillingTime && !existingEndsAt && !!currentSub?.renewsAt,
        usedFallback: !nextBillingTime && !existingEndsAt && !currentSub?.renewsAt
      });
      fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook/paypal/route.ts:115',message:'Webhook CANCELLED: Calculated endDate',data:{subscriptionId:resource.id,nextBillingTime,endDateISO:endDate.toDate().toISOString(),endDateTimestamp:endDate.toDate().getTime(),usedFallback:!nextBillingTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion

      // Check if we still have access (grace period)
      const stillHasAccess = endDate.toDate() > new Date();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook/paypal/route.ts:120',message:'Webhook CANCELLED: Before Firebase update',data:{subscriptionId:resource.id,userId,endDateISO:endDate.toDate().toISOString(),stillHasAccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion

      await userRef.set({
        isPro: stillHasAccess, // Keep pro if still in grace period
        subscription: {
          status: "cancelled",
          renewsAt: null,
          endsAt: endDate
        },
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      // #region agent log
      console.log("[DEBUG] Webhook CANCELLED: Firebase updated", {
        subscriptionId: resource.id,
        userId,
        endDateISO: endDate.toDate().toISOString(),
        endDateFormatted: endDate.toDate().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        stillHasAccess,
        status: 'cancelled'
      });
      fetch('http://127.0.0.1:7242/ingest/39deccfc-a667-4fb3-91cd-671c431fc418',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook/paypal/route.ts:133',message:'Webhook CANCELLED: Firebase updated',data:{subscriptionId:resource.id,userId,endDateISO:endDate.toDate().toISOString(),stillHasAccess,status:'cancelled'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      
      console.log("[PayPal Webhook] Updating Firestore: status=cancelled, endsAt=", endDate.toDate(), "isPro remains:", stillHasAccess);
    }

    // ==========================================
    // SUBSCRIPTION EXPIRED
    // ==========================================
    else if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      console.log("[PayPal Webhook] Handling EXPIRED event for subscription:", resource.id);
      await userRef.set({
        isPro: false,
        subscription: {
          status: "expired",
          renewsAt: null,
          endsAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      console.log("[PayPal Webhook] Updating Firestore: status=expired, endsAt=", Timestamp.now().toDate(), "isPro set to false");
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
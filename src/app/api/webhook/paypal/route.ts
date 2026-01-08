import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { PAYPAL_API_URL, PAYPAL_CREDENTIALS, PAYPAL_WEBHOOK_ID } from "@/lib/paypal-config";

async function getAccessToken() {
  const { clientId, clientSecret } = PAYPAL_CREDENTIALS;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured");

  const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to get PayPal access token: ${err}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

async function verifyWebhookSignature(rawBody: string, req: Request, accessToken: string) {
  if (!PAYPAL_WEBHOOK_ID) throw new Error("PAYPAL_WEBHOOK_ID is not set");

  const transmissionId = req.headers.get("paypal-transmission-id") || "";
  const transmissionTime = req.headers.get("paypal-transmission-time") || "";
  const certUrl = req.headers.get("paypal-cert-url") || "";
  const authAlgo = req.headers.get("paypal-auth-algo") || "";
  const transmissionSig = req.headers.get("paypal-transmission-sig") || "";

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    throw new Error("Missing PayPal webhook signature headers");
  }

  const verifyRes = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!verifyRes.ok) {
    const err = await verifyRes.text().catch(() => "");
    throw new Error(`PayPal signature verification failed: ${err}`);
  }

  const result = await verifyRes.json();
  if (result.verification_status !== "SUCCESS") {
    throw new Error(`PayPal signature verification status: ${result.verification_status}`);
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;
    const resource = payload.resource;

    const accessToken = await getAccessToken();
    await verifyWebhookSignature(rawBody, req, accessToken);

    console.log(`🔔 PayPal Webhook: ${eventType}`);

    const userId =
      resource.custom_id ||
      resource.subscriber?.custom_id ||
      resource.purchase_units?.[0]?.custom_id;

    if (!userId) {
      console.error("❌ No user ID found in webhook payload");
      return NextResponse.json({ error: "No User ID" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const nextBillingTime = resource.billing_info?.next_billing_time;
      const planId = resource.plan_id;

      await userRef.set(
        {
          isPro: true,
          subscription: {
            plan: "monthly",
            status: "active",
            provider: "paypal",
            paypalSubscriptionId: resource.id,
            paypalPlanId: planId,
            renewsAt: nextBillingTime ? Timestamp.fromDate(new Date(nextBillingTime)) : null,
            endsAt: null,
          },
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log(`✅ Monthly subscription activated for user: ${userId}`);
    } else if (eventType === "PAYMENT.SALE.COMPLETED") {
      const billingAgreementId = resource.billing_agreement_id;

      if (billingAgreementId) {
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 31);

        await userRef.set(
          {
            isPro: true,
            subscription: {
              status: "active",
              renewsAt: Timestamp.fromDate(nextBillingDate),
              endsAt: null,
            },
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );

        console.log(`✅ Subscription payment completed for user: ${userId}`);
      }
    } else if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "CHECKOUT.ORDER.COMPLETED") {
      const orderId = resource.id;

      await userRef.set(
        {
          isPro: true,
          subscription: {
            plan: "lifetime",
            status: "active",
            provider: "paypal",
            paypalOrderId: orderId,
            renewsAt: null,
            endsAt: null,
          },
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log(`✅ Lifetime purchase completed for user: ${userId}`);
    } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      const userDoc = await userRef.get();
      const currentData = userDoc.data();
      const currentSub = currentData?.subscription;
      const existingEndsAt = currentSub?.endsAt;

      let endDate: Timestamp;
      const nextBillingTime = resource.billing_info?.next_billing_time;

      if (nextBillingTime) {
        endDate = Timestamp.fromDate(new Date(nextBillingTime));
      } else if (existingEndsAt) {
        if (typeof (existingEndsAt as any).toDate === "function") {
          const existingDate = (existingEndsAt as any).toDate();
          endDate = existingDate > new Date() ? existingEndsAt : Timestamp.now();
        } else if (typeof existingEndsAt === "string") {
          const existingDate = new Date(existingEndsAt);
          endDate = existingDate > new Date() ? Timestamp.fromDate(existingDate) : Timestamp.now();
        } else {
          endDate = Timestamp.now();
        }
      } else if (currentSub?.renewsAt) {
        let renewsAtDate: Date;
        if (typeof (currentSub.renewsAt as any).toDate === "function") {
          renewsAtDate = (currentSub.renewsAt as any).toDate();
        } else if (typeof currentSub.renewsAt === "string") {
          renewsAtDate = new Date(currentSub.renewsAt);
        } else if ((currentSub.renewsAt as any)._seconds) {
          renewsAtDate = new Date((currentSub.renewsAt as any)._seconds * 1000);
        } else {
          renewsAtDate = new Date();
        }

        endDate = renewsAtDate > new Date() ? Timestamp.fromDate(renewsAtDate) : Timestamp.now();
      } else {
        endDate = Timestamp.now();
      }

      const stillHasAccess = endDate.toDate() > new Date();

      await userRef.set(
        {
          isPro: stillHasAccess,
          subscription: {
            status: "cancelled",
            renewsAt: null,
            endsAt: endDate,
          },
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log("[PayPal Webhook] CANCELLED -> status=cancelled, endsAt=", endDate.toDate(), "stillHasAccess:", stillHasAccess);
    } else if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      await userRef.set(
        {
          isPro: false,
          subscription: {
            status: "expired",
            renewsAt: null,
            endsAt: Timestamp.now(),
          },
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log("[PayPal Webhook] EXPIRED -> status=expired");
    } else if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await userRef.set(
        {
          isPro: false,
          subscription: {
            status: "suspended",
            renewsAt: null,
          },
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log(`⚠️ Subscription suspended for user: ${userId}`);
    } else {
      console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ PayPal Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

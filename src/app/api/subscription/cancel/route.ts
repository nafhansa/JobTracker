import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { checkIdempotencyKey, storeIdempotencyKey, recordSubscriptionHistory } from "@/lib/middleware/subscription-utils";
import { MIDTRANS_CONFIG } from "@/lib/midtrans-config";

export async function POST(req: Request) {
  try {
    const { subscriptionId, provider, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const { cached, response } = await checkIdempotencyKey(idempotencyKey);
      if (cached) {
        return NextResponse.json(response);
      }
    }

    const rateLimit = await checkRateLimit(`cancel:${userId}`);
    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    console.log('Cancel request received:', { subscriptionId, provider, userId });

    const { data: subscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found or does not belong to user" },
        { status: 404, headers }
      );
    }

    if (subscription.status === 'cancelled' || subscription.status === 'canceled') {
      return NextResponse.json(
        { error: "Subscription is already cancelled" },
        { status: 400, headers }
      );
    }

    const effectiveProvider = provider || "midtrans";
    let endDate: string | null = null;

    if (effectiveProvider === "midtrans") {
      if (subscription.midtrans_subscription_token) {
        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
        const MIDTRANS_API_URL = MIDTRANS_CONFIG.isProduction
          ? 'https://api.midtrans.com'
          : 'https://api.sandbox.midtrans.com';

        if (!MIDTRANS_SERVER_KEY) {
          return NextResponse.json(
            { error: "Midtrans configuration error" },
            { status: 500, headers }
          );
        }

        const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

        const cancelResponse = await fetch(
          `${MIDTRANS_API_URL}/v1/subscriptions/${subscription.midtrans_subscription_token}/cancel`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${authString}`,
            },
          }
        );

        if (!cancelResponse.ok) {
          const errorData = await cancelResponse.json().catch(() => ({}));
          console.error("Midtrans cancel error:", errorData);
        } else {
          console.log("Subscription cancelled in Midtrans");
        }
      }

      endDate = subscription.renews_at || subscription.ends_at || new Date().toISOString();

      await (supabaseAdmin as any)
        .from('subscriptions')
        .update({
          status: 'cancelled',
          ends_at: endDate,
          midtrans_subscription_token: null,
          last_cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      await (supabaseAdmin as any)
        .from('users')
        .update({
          subscription_plan: 'free',
          subscription_status: 'cancelled',
          is_pro: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.user_id);

      await recordSubscriptionHistory(userId, 'cancelled', {
        previousStatus: subscription.status,
        newStatus: 'cancelled',
        previousPlan: subscription.plan,
        newPlan: 'free',
        reason: 'User initiated cancellation',
        metadata: {
          subscriptionId: subscription.id,
          provider: effectiveProvider,
          endsAt: endDate,
        },
      });
    } else {
      throw new Error("Provider not supported");
    }

    const responseData = {
      success: true,
      message: "Subscription cancelled successfully",
      endsAt: endDate,
    };

    if (idempotencyKey) {
      await storeIdempotencyKey(idempotencyKey, userId, 'cancel', responseData);
    }

    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cancel API Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

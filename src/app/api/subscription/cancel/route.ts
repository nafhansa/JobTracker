import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { checkIdempotencyKey, storeIdempotencyKey, recordSubscriptionHistory } from "@/lib/middleware/subscription-utils";
import { verifyAuthOrUserId } from "@/lib/middleware/auth";
import { MIDTRANS_CONFIG } from "@/lib/midtrans-config";
import { updateWeeklyCoinAllocation } from "@/lib/supabase/ai-coins";

async function cancelInMidtrans(token: string, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
  const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
  const MIDTRANS_API_URL = MIDTRANS_CONFIG.isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

  if (!MIDTRANS_SERVER_KEY) {
    return { success: false, error: "Midtrans configuration error" };
  }

  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `${MIDTRANS_API_URL}/v1/subscriptions/${token}/cancel`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`,
          },
        }
      );

      if (response.ok) {
        console.log("Subscription cancelled in Midtrans on attempt", attempt);
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      console.error(`Midtrans cancel error (attempt ${attempt}):`, errorData);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Midtrans cancel network error (attempt ${attempt}):`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, error: "Failed to cancel in Midtrans after retries" };
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuthOrUserId(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const authenticatedUserId = authResult.userId;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { subscriptionId, provider } = body;
    const userId = authenticatedUserId;

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const { cached, response } = await checkIdempotencyKey(idempotencyKey);
      if (cached) {
        return NextResponse.json(response);
      }
    }

    const rateLimit = await checkRateLimit(`cancel:${userId}`);
    const headers = getRateLimitHeaders(5, rateLimit.remaining, rateLimit.resetAt);

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
        const midtransResult = await cancelInMidtrans(subscription.midtrans_subscription_token);
        
        if (!midtransResult.success) {
          console.error("Midtrans cancel failed, queueing for retry:", midtransResult.error);
          
          await (supabaseAdmin as any)
            .from('pending_midtrans_operations')
            .insert({
              user_id: userId,
              operation: 'cancel',
              subscription_id: subscription.id,
              payload: { token: subscription.midtrans_subscription_token },
              last_error: midtransResult.error,
              next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            });
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

      // Downgrade weekly coin allocation from 400 to 240 (free tier)
      try {
        await updateWeeklyCoinAllocation(subscription.user_id, 'free');
      } catch (coinError) {
        console.error('Failed to update weekly coin allocation on cancellation:', coinError);
      }

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

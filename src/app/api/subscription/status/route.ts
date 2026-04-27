import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { verifyAuthOrUserId } from "@/lib/middleware/auth";
import { checkIsPro } from "@/lib/supabase/subscriptions";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuthOrUserId(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;

    const rateLimit = await checkRateLimit(`status:${userId}`, {
      windowMs: 60 * 1000,
      maxRequests: 30,
    });
    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const { data: subscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: userData } = await (supabaseAdmin as any)
      .from('users')
      .select('subscription_plan, subscription_status, is_pro, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (!subscription && !userData) {
      return NextResponse.json({
        hasSubscription: false,
        plan: 'free',
        status: 'active',
        isPro: false,
        canReactivate: false,
        gracePeriodEndsAt: null,
        cooldownEndsAt: null,
        history: [],
      }, { status: 200, headers });
    }

    const subData = subscription || {
      plan: userData?.subscription_plan || 'free',
      status: userData?.subscription_status || 'active',
      renews_at: null,
      ends_at: null,
      last_cancelled_at: null,
      reactivation_count: 0,
      currency: 'IDR',
      billing_day: null,
    };

    const isPro = checkIsPro({
      plan: subData.plan,
      status: subData.status,
      renewsAt: subData.renews_at,
      endsAt: subData.ends_at,
    });

    const isCancelled = subData.status === 'cancelled' || subData.status === 'canceled';
    const now = new Date();

    let gracePeriodEndsAt: string | null = null;
    if (isCancelled && subData.ends_at) {
      const endsAt = new Date(subData.ends_at);
      if (now < endsAt) {
        gracePeriodEndsAt = endsAt.toISOString();
      }
    }

    let cooldownEndsAt: string | null = null;
    if (subData.last_cancelled_at) {
      const lastCancelled = new Date(subData.last_cancelled_at);
      const cooldownEnd = new Date(lastCancelled.getTime() + 24 * 60 * 60 * 1000);
      if (now < cooldownEnd) {
        cooldownEndsAt = cooldownEnd.toISOString();
      }
    }

    const canReactivate = isCancelled && !cooldownEndsAt;

    const { data: history } = await (supabaseAdmin as any)
      .from('subscription_history')
      .select('action, previous_status, new_status, previous_plan, new_plan, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      hasSubscription: !!subscription,
      plan: subData.plan || 'free',
      status: subData.status || 'active',
      isPro,
      renewsAt: subData.renews_at,
      endsAt: subData.ends_at,
      midtransSubscriptionId: subData.midtrans_subscription_id,
      midtransPaymentMethod: subData.midtrans_payment_method,
      reactivationCount: subData.reactivation_count || 0,
      canReactivate,
      gracePeriodEndsAt,
      cooldownEndsAt,
      lastCancelledAt: subData.last_cancelled_at,
      currency: subData.currency || 'IDR',
      billingDay: subData.billing_day,
      history: history || [],
    }, { status: 200, headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Subscription Status API Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

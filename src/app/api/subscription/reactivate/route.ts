import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { checkIdempotencyKey, storeIdempotencyKey, recordSubscriptionHistory } from "@/lib/middleware/subscription-utils";

export async function POST(req: Request) {
  try {
    const { userId, plan } = await req.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: "User ID and plan are required" }, { status: 400 });
    }

    if (!['monthly', 'lifetime'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const { cached, response } = await checkIdempotencyKey(idempotencyKey);
      if (cached) {
        return NextResponse.json(response);
      }
    }

    const rateLimit = await checkRateLimit(`reactivate:${userId}`);
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

    if (!subscription) {
      return NextResponse.json(
        { error: "No previous subscription found to reactivate" },
        { status: 404, headers }
      );
    }

    const isCancelled = subscription.status === 'cancelled' || subscription.status === 'canceled';
    const now = new Date();

    if (!isCancelled && subscription.status !== 'expired') {
      return NextResponse.json(
        { error: "Subscription is not cancelled. Current status: " + subscription.status },
        { status: 400, headers }
      );
    }

    if (subscription.last_cancelled_at) {
      const lastCancelled = new Date(subscription.last_cancelled_at);
      const cooldownHours = 24;
      const cooldownEnd = new Date(lastCancelled.getTime() + cooldownHours * 60 * 60 * 1000);

      if (now < cooldownEnd) {
        const hoursRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (60 * 60 * 1000));
        return NextResponse.json(
          {
            error: `Please wait before reactivating. Cooldown ends in ${hoursRemaining} hour(s).`,
            cooldownEndsAt: cooldownEnd.toISOString(),
          },
          { status: 429, headers }
        );
      }
    }

    const maxReactivationsPerQuarter = 3;
    const quarterStart = new Date(now);
    quarterStart.setMonth(quarterStart.getMonth() - 3);

    const { count: recentReactivations } = await (supabaseAdmin as any)
      .from('subscription_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'reactivated')
      .gte('created_at', quarterStart.toISOString());

    if (recentReactivations && recentReactivations >= maxReactivationsPerQuarter) {
      return NextResponse.json(
        { error: "Maximum reactivations reached for this quarter. Please contact support." },
        { status: 403, headers }
      );
    }

    const isInGracePeriod = isCancelled && subscription.ends_at && now < new Date(subscription.ends_at);

    let renewsAt: string | null = null;
    let endsAt: string | null = null;

    if (plan === 'monthly') {
      if (isInGracePeriod && subscription.ends_at) {
        const graceEnd = new Date(subscription.ends_at);
        renewsAt = new Date(graceEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      endsAt = null;
    } else if (plan === 'lifetime') {
      renewsAt = null;
      endsAt = null;
    }

    const newReactivationCount = (subscription.reactivation_count || 0) + 1;

    await (supabaseAdmin as any)
      .from('subscriptions')
      .update({
        status: 'active',
        plan: plan,
        renews_at: renewsAt,
        ends_at: endsAt,
        midtrans_subscription_token: null,
        midtrans_subscription_id: null,
        midtrans_payment_method: null,
        midtrans_account_id: null,
        reactivation_count: newReactivationCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await (supabaseAdmin as any)
      .from('users')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        is_pro: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await recordSubscriptionHistory(userId, 'reactivated', {
      previousStatus: subscription.status,
      newStatus: 'active',
      previousPlan: subscription.plan,
      newPlan: plan,
      reason: isInGracePeriod ? 'Reactivated during grace period' : 'Reactivated after subscription expired',
      metadata: {
        isInGracePeriod,
        gracePeriodEnd: subscription.ends_at,
        newRenewsAt: renewsAt,
        reactivationCount: newReactivationCount,
      },
    });

    const responseData = {
      success: true,
      message: "Subscription reactivated successfully",
      subscription: {
        plan,
        status: 'active',
        renewsAt,
        endsAt,
        reactivationCount: newReactivationCount,
      },
      isInGracePeriod,
    };

    if (idempotencyKey) {
      await storeIdempotencyKey(idempotencyKey, userId, 'reactivate', responseData);
    }

    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Reactivate API Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

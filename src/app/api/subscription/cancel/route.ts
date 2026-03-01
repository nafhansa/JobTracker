// src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { subscriptionId, provider, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log('Cancel request received:', { subscriptionId, provider, userId });

    const { data: subscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      console.error('Subscription not found for user:', userId);
      return NextResponse.json(
        { error: "Subscription not found or does not belong to user" },
        { status: 404 }
      );
    }

    console.log('Subscription found:', subscription.id);

    const effectiveProvider = provider || "midtrans";
    let endDate: string | null = null;

    if (effectiveProvider === "midtrans") {
      if (!subscription.midtrans_subscription_token) {
        console.log('No subscription token found, updating database only');
        endDate = subscription.renews_at || subscription.ends_at || new Date().toISOString();
      } else {
        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
        const MIDTRANS_API_URL = process.env.MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://api.midtrans.com'
          : 'https://api.sandbox.midtrans.com';

        if (!MIDTRANS_SERVER_KEY) {
          return NextResponse.json(
            { error: "Midtrans configuration error" },
            { status: 500 }
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
          console.error("❌ Midtrans cancel error:", errorData);
          throw new Error("Failed to cancel subscription in Midtrans");
        }

        console.log("✅ Subscription cancelled in Midtrans");
      }

      endDate = subscription.renews_at || subscription.ends_at || new Date().toISOString();

      await (supabaseAdmin as any)
        .from('subscriptions')
        .update({
          status: 'cancelled',
          ends_at: endDate,
          midtrans_subscription_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      await (supabaseAdmin as any)
        .from('users')
        .update({
          subscription_plan: 'free',
          subscription_status: 'active',
          is_pro: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.user_id);

    } else {
      throw new Error("Provider not supported");
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      endsAt: endDate,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("❌ Cancel API Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

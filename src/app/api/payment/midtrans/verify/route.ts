import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { addPurchasedCoins } from '@/lib/supabase/ai-coins';
import { COIN_PACKAGES } from '@/lib/ai/types';

function generateUUID(): string {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const isCoinPurchase = orderId.startsWith('JP-');

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
    const statusApiUrl = MIDTRANS_CONFIG.isProduction
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';

    const response = await fetch(`${statusApiUrl}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Midtrans API error: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const result = await response.json();

    console.log('Manual payment verification:', {
      order_id: result.order_id,
      transaction_status: result.transaction_status,
      gross_amount: result.gross_amount,
      custom_field1: result.custom_field1,
      custom_field2: result.custom_field2,
      payment_type: result.payment_type,
      isCoinPurchase,
    });

    if (result.transaction_status === 'settlement' || result.transaction_status === 'capture') {
      // === COIN PURCHASE VERIFICATION ===
      if (isCoinPurchase || (result.custom_field2 && result.custom_field2.startsWith('coins_'))) {
        return await handleCoinPurchaseVerification(result, orderId);
      }

      // === SUBSCRIPTION VERIFICATION ===
      const userId = result.custom_field1;
      const plan = result.custom_field2;
      const currency = result.custom_field3 || 'IDR';

      if (!userId || !plan) {
        return NextResponse.json(
          { error: 'Missing custom fields (userId/plan) in transaction' },
          { status: 400 }
        );
      }

      try {
        const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

        const { data: existingSubscription } = await (supabaseAdmin as any)
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const subscriptionData: any = {
          user_id: userId,
          plan: planType,
          status: 'active',
          midtrans_subscription_id: orderId,
          updated_at: new Date().toISOString(),
        };

        if (planType === 'monthly') {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          subscriptionData.renews_at = nextMonth.toISOString();
          subscriptionData.ends_at = null;
        } else if (planType === 'lifetime') {
          subscriptionData.renews_at = null;
          subscriptionData.ends_at = null;
        }

        if (!existingSubscription) {
          subscriptionData.id = generateUUID();
          subscriptionData.created_at = new Date().toISOString();
        }

        const { error: subscriptionError } = await (supabaseAdmin as any)
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error('Error upserting subscription:', subscriptionError);
          throw subscriptionError;
        }

        const { error: userError } = await (supabaseAdmin as any)
          .from('users')
          .upsert(
            {
              id: userId,
              subscription_plan: planType,
              subscription_status: 'active',
              is_pro: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (userError) {
          console.error('Error updating user subscription:', userError);
          throw userError;
        }

        if (plan === 'lifetime') {
          const { error: lifetimeError } = await (supabaseAdmin as any)
            .from('lifetime_access_purchases')
            .insert({
              user_id: userId,
              order_id: orderId,
              amount: result.gross_amount,
              currency: currency,
              purchased_at: new Date().toISOString(),
            });

          if (lifetimeError) {
            console.error('Error recording lifetime purchase:', lifetimeError);
          }
        }

        const { error: deleteError } = await (supabaseAdmin as any)
          .from('pending_midtrans_transactions')
          .delete()
          .eq('order_id', orderId);

        if (deleteError) {
          console.error('Error deleting pending transaction:', deleteError);
        }

        console.log('Subscription created successfully via manual verification for user:', userId);

        return NextResponse.json({
          success: true,
          type: 'subscription',
          transaction_status: result.transaction_status,
          plan: plan,
          userId: userId,
        });
      } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment not completed yet',
          transaction_status: result.transaction_status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Manual verification error:', error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

async function handleCoinPurchaseVerification(result: any, orderId: string): Promise<Response> {
  let userId: string | undefined = result.custom_field1;
  let packageId: string | undefined = result.custom_field2?.replace('coins_', '');

  // If custom_fields missing, look up from coin_purchases, then pending_midtrans_transactions
  if (!userId || !packageId) {
    const { data: cpData } = await (supabaseAdmin as any)
      .from('coin_purchases')
      .select('user_id, package_id, coins, status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (cpData) {
      if (!userId) userId = cpData.user_id;
      if (!packageId) packageId = cpData.package_id;

      // Already paid?
      if (cpData.status === 'paid') {
        return NextResponse.json({
          success: true,
          type: 'coin_purchase',
          message: 'Already processed',
          transaction_status: result.transaction_status,
          order_id: orderId,
          coins: cpData.coins,
        });
      }
    }
  }

  if (!userId || !packageId) {
    // Last fallback: pending_midtrans_transactions
    const { data: pendingTx } = await (supabaseAdmin as any)
      .from('pending_midtrans_transactions')
      .select('user_id, plan')
      .eq('order_id', orderId)
      .maybeSingle();

    if (pendingTx) {
      if (!userId) userId = pendingTx.user_id;
      if (!packageId && pendingTx.plan) packageId = pendingTx.plan.replace('coins_', '');
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Cannot resolve userId for order: ' + orderId }, { status: 400 });
  }

  const coinPkg = COIN_PACKAGES.find((p) => p.id === packageId)
    || (result.gross_amount ? COIN_PACKAGES.find((p) => p.price_idr === parseInt(result.gross_amount, 10)) : null);

  if (!coinPkg) {
    return NextResponse.json({ error: 'Cannot resolve coin package for order: ' + orderId }, { status: 400 });
  }

  // Check idempotency
  const { data: existingTx } = await (supabaseAdmin as any)
    .from('coin_transactions')
    .select('id')
    .eq('reference_id', orderId)
    .maybeSingle();

  if (existingTx) {
    // Update coin_purchases status just in case
    await (supabaseAdmin as any).from('coin_purchases').update({
      status: 'paid',
      payment_type: result.payment_type || null,
      midtrans_transaction_id: result.transaction_id || null,
      updated_at: new Date().toISOString(),
    }).eq('order_id', orderId);

    return NextResponse.json({
      success: true,
      type: 'coin_purchase',
      message: 'Already processed',
      transaction_status: result.transaction_status,
      order_id: orderId,
      coins: coinPkg.coins,
    });
  }

  try {
    await addPurchasedCoins(userId, coinPkg.coins, orderId);
    console.log(`[verify] JPs added: ${coinPkg.coins} for user ${userId}`);
  } catch (err) {
    console.error('[verify] Failed to add purchased coins:', err);
    return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
  }

  // Update coin_purchases status to paid
  await (supabaseAdmin as any).from('coin_purchases').update({
    status: 'paid',
    payment_type: result.payment_type || null,
    midtrans_transaction_id: result.transaction_id || null,
    credited_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('order_id', orderId);

  // Clean up pending transaction
  await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', orderId);

  return NextResponse.json({
    success: true,
    type: 'coin_purchase',
    transaction_status: result.transaction_status,
    order_id: orderId,
    coins: coinPkg.coins,
    userId,
    packageId: coinPkg.id,
  });
}

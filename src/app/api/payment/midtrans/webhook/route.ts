import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPaymentWithMidtrans } from '@/lib/middleware/webhook-verify';
import { recordSubscriptionHistory } from '@/lib/middleware/subscription-utils';
import { COIN_PACKAGES } from '@/lib/ai/types';
import { updateWeeklyCoinAllocation, addPurchasedCoins } from '@/lib/supabase/ai-coins';

function generateUUID(): string {
  return crypto.randomUUID();
}

function getNextBillingDate(currentDate: Date, billingDay: number): Date {
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const lastDayOfMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0
  ).getDate();
  
  const day = Math.min(billingDay, lastDayOfMonth);
  nextMonth.setDate(day);
  
  return nextMonth;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, status_code, gross_amount, custom_field1, custom_field2, custom_field3, signature_key, payment_type, subscription_id, saved_token_id, masked_card } = body;

    function getStatusCodeFromTransactionStatus(status: string): string {
      const statusMap: Record<string, string> = {
        'settlement': '200',
        'capture': '200',
        'deny': '202',
        'cancel': '201',
        'expire': '202',
        'pending': '201'
      };
      return statusMap[status] || '200';
    }

    console.log('Midtrans webhook received:', { order_id, transaction_status, status_code, gross_amount, custom_field1, custom_field2, custom_field3, payment_type, subscription_id, saved_token_id, masked_card });

    const statusCode = status_code || getStatusCodeFromTransactionStatus(transaction_status);
    const stringToSign = `${order_id}${statusCode}${gross_amount}${MIDTRANS_CONFIG.serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(stringToSign).digest('hex');

    if (signature_key && signature_key !== calculatedSignature) {
      console.error('Invalid signature, attempting direct verification');
      const { verified } = await verifyPaymentWithMidtrans(order_id);
      if (!verified) {
        console.error('Direct verification also failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
      console.log('Direct verification succeeded');
    } else if (!signature_key) {
      console.log('No signature key provided, attempting direct verification');
      const { verified } = await verifyPaymentWithMidtrans(order_id);
      if (!verified) {
        console.error('Direct verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
      console.log('Direct verification succeeded');
    }

    console.log('Midtrans webhook verified:', { order_id, transaction_status, custom_field1, custom_field2, custom_field3 });

    // Resolve userId and plan: custom_fields from Midtrans may be missing for e-wallets (GoPay, ShopeePay, etc.)
    // Always look up pending_midtrans_transactions for JP- orders as the primary source
    let resolvedUserId: string | undefined = custom_field1;
    let resolvedPlan: string | undefined = custom_field2;
    let resolvedCurrency: string | undefined = custom_field3;

    // For coin purchase orders (JP- prefix), look up coin_purchases FIRST, then pending transaction
    const isCoinPurchase = order_id?.startsWith('JP-');
    let coinPurchaseData: { user_id: string; package_id: string; coins: number; amount_idr: number; status: string } | null = null;

    if (isCoinPurchase) {
      const { data: cpData, error: cpError } = await (supabaseAdmin as any)
        .from('coin_purchases')
        .select('user_id, package_id, coins, amount_idr, status')
        .eq('order_id', order_id)
        .maybeSingle();

      if (cpError) {
        console.error('Error looking up coin_purchases:', cpError);
      }

      if (cpData) {
        coinPurchaseData = cpData;
        console.log('JP order: using coin_purchases data:', { order_id, cpUserId: cpData.user_id, cpPackageId: cpData.package_id, cpStatus: cpData.status });
        resolvedUserId = cpData.user_id;
        resolvedPlan = `coins_${cpData.package_id}`;
      } else {
        // Fallback to pending_midtrans_transactions
        const { data: pendingTx, error: pendingTxError } = await (supabaseAdmin as any)
          .from('pending_midtrans_transactions')
          .select('user_id, plan, currency')
          .eq('order_id', order_id)
          .maybeSingle();

        if (pendingTxError) {
          console.error('Error looking up pending transaction:', pendingTxError);
        }

        if (pendingTx) {
          console.log('JP order: using pending transaction fallback:', { order_id, pendingUserId: pendingTx.user_id, pendingPlan: pendingTx.plan });
          if (!resolvedUserId) resolvedUserId = pendingTx.user_id;
          if (!resolvedPlan) resolvedPlan = pendingTx.plan;
          if (!resolvedCurrency) resolvedCurrency = pendingTx.currency;
        } else {
          console.warn('JP order: no coin_purchases or pending transaction found, relying on custom_fields:', { order_id, custom_field1, custom_field2 });
        }
      }
    } else {
      // For subscription orders, prefer custom_fields, fallback to pending tx
      if (!resolvedUserId || !resolvedPlan) {
        const { data: pendingTx, error: pendingTxError } = await (supabaseAdmin as any)
          .from('pending_midtrans_transactions')
          .select('user_id, plan, currency')
          .eq('order_id', order_id)
          .maybeSingle();

        if (pendingTxError) {
          console.error('Error looking up pending transaction:', pendingTxError);
        }

        if (pendingTx) {
          if (!resolvedUserId) resolvedUserId = pendingTx.user_id;
          if (!resolvedPlan) resolvedPlan = pendingTx.plan;
          if (!resolvedCurrency) resolvedCurrency = pendingTx.currency;
        }
      }
    }

    console.log('Resolved webhook data:', { order_id, resolvedUserId, resolvedPlan, isCoinPurchase });

    if (transaction_status === 'settlement' && payment_type === 'recurring') {
      const { verified, transactionStatus: verifiedStatus } = await verifyPaymentWithMidtrans(order_id);
      if (!verified || verifiedStatus !== 'settlement') {
        console.error('Recurring payment verification failed:', { verified, verifiedStatus });
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      await handleRecurringPayment({
        subscriptionId: subscription_id,
        userId: resolvedUserId,
        order_id,
        gross_amount,
      });
      // Clean up pending transaction
      await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', order_id);
      return NextResponse.json({ status: 'OK' });
    }

    if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      // Mark coin_purchases as failed/expired for JP orders
      if (isCoinPurchase) {
        const failStatus = transaction_status === 'expire' ? 'expired' : 'failed';
        await (supabaseAdmin as any).from('coin_purchases').update({ status: failStatus, updated_at: new Date().toISOString() }).eq('order_id', order_id);
      }
      await handleFailedPayment({
        order_id,
        userId: resolvedUserId,
        transaction_status,
        payment_type,
        subscription_id,
      });
      // Clean up pending transaction for failed payments
      await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', order_id);
      return NextResponse.json({ status: 'OK' });
    }

    if (body.event === 'subscription.cancelled' || body.event === 'subscription.expired') {
      await handleSubscriptionCancellation({
        subscriptionId: subscription_id,
        userId: resolvedUserId,
      });
      await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', order_id);
      return NextResponse.json({ status: 'OK' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      // === COIN PURCHASE ===
      if (isCoinPurchase || (resolvedPlan && resolvedPlan.startsWith('coins_'))) {
        const packageId = resolvedPlan ? resolvedPlan.replace('coins_', '') : null;

        if (!resolvedUserId) {
          console.error('Coin purchase webhook: cannot resolve userId for order:', order_id);
          return NextResponse.json({ status: 'error', message: 'Missing userId' }, { status: 400 });
        }

        // Resolve coin package: from coinPurchaseData, then plan, then gross_amount
        let coinPkg = coinPurchaseData
          ? COIN_PACKAGES.find((p) => p.id === coinPurchaseData.package_id)
          : null;
        if (!coinPkg) coinPkg = packageId ? COIN_PACKAGES.find((p) => p.id === packageId) : null;
        if (!coinPkg && gross_amount) {
          const amount = parseInt(gross_amount, 10);
          coinPkg = COIN_PACKAGES.find((p) => p.price_idr === amount);
          console.log('Coin package resolved from gross_amount:', { gross_amount, amount, foundPkg: coinPkg?.id });
        }

        if (!coinPkg) {
          console.error('Coin purchase webhook: cannot resolve coin package for order:', order_id, 'plan:', resolvedPlan, 'gross_amount:', gross_amount);
          return NextResponse.json({ status: 'error', message: 'Unknown coin package' }, { status: 400 });
        }

        const coinsToCredit = coinPurchaseData?.coins || coinPkg.coins;
        console.log('=== COIN PURCHASE WEBHOOK ===', { order_id, userId: resolvedUserId, packageId: coinPkg.id, coinsToCredit });

        const { data: existingTx } = await (supabaseAdmin as any)
          .from('coin_transactions')
          .select('id')
          .eq('reference_id', order_id)
          .maybeSingle();

        if (existingTx) {
          console.log('Coin purchase already processed:', order_id);
          // Update coin_purchases status to paid if not already
          await (supabaseAdmin as any).from('coin_purchases').update({ status: 'paid', payment_type: payment_type || null, updated_at: new Date().toISOString() }).eq('order_id', order_id);
          await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', order_id);
          return NextResponse.json({ status: 'OK', message: 'Already processed' });
        }

        try {
          await addPurchasedCoins(resolvedUserId, coinsToCredit, order_id);
          console.log(`JPs added: ${coinsToCredit} for user ${resolvedUserId}`);
        } catch (err) {
          console.error('Failed to add purchased coins:', err);
          // Update coin_purchases status to failed
          await (supabaseAdmin as any).from('coin_purchases').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('order_id', order_id);
          return NextResponse.json({ status: 'error', message: 'Failed to credit coins' }, { status: 500 });
        }

        // Update coin_purchases status to paid + mark credited_at
        await (supabaseAdmin as any).from('coin_purchases').update({
          status: 'paid',
          payment_type: payment_type || null,
          midtrans_transaction_id: body.transaction_id || null,
          credited_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('order_id', order_id);

        // Clean up pending transaction after successful credit
        await (supabaseAdmin as any).from('pending_midtrans_transactions').delete().eq('order_id', order_id);

        return NextResponse.json({ status: 'OK' });
      }

      // === SUBSCRIPTION ===
      try {
        if (!resolvedUserId) {
          console.error('Subscription webhook: cannot resolve userId for order:', order_id);
          return NextResponse.json({ status: 'error', message: 'Missing userId' }, { status: 400 });
        }

        const { data: processedOrder } = await (supabaseAdmin as any)
          .from('subscriptions')
          .select('id, midtrans_subscription_id')
          .eq('midtrans_subscription_id', order_id)
          .maybeSingle();

        if (processedOrder) {
          console.log('Order already processed, skipping:', order_id);
          return NextResponse.json({ status: 'OK', message: 'Already processed' });
        }

        const planType = resolvedPlan === 'lifetime' ? 'lifetime' : 'monthly';

        console.log('=== WEBHOOK SUBSCRIPTION CREATION ===');
        console.log('User ID:', resolvedUserId);
        console.log('Plan:', planType);
        console.log('Order ID:', order_id);

        const { data: existingSubscription } = await (supabaseAdmin as any)
          .from('subscriptions')
          .select('id, user_id, plan, status, midtrans_subscription_id, midtrans_subscription_token, renews_at, ends_at, created_at, updated_at')
          .eq('user_id', resolvedUserId)
          .maybeSingle();

        console.log('Existing subscription found:', existingSubscription);

        if (existingSubscription?.plan === 'lifetime' && planType !== 'lifetime') {
          console.warn('Attempted to overwrite lifetime subscription:', resolvedUserId);
          return NextResponse.json({ status: 'OK', message: 'Lifetime subscription preserved' });
        }

        const isReactivation = existingSubscription && 
          (existingSubscription.status === 'cancelled' || existingSubscription.status === 'canceled');

        const billingDay = new Date().getDate();
        const subscriptionCurrency = resolvedCurrency || 'IDR';

        const subscriptionData: any = {
          user_id: resolvedUserId,
          plan: planType,
          status: 'active',
          midtrans_subscription_id: order_id,
          midtrans_subscription_token: null,
          midtrans_payment_method: null,
          midtrans_account_id: null,
          currency: subscriptionCurrency,
          billing_day: billingDay,
          payment_failure_count: 0,
          updated_at: new Date().toISOString(),
        };

        if (subscription_id) {
          subscriptionData.midtrans_subscription_token = subscription_id;
        } else if (saved_token_id) {
          subscriptionData.midtrans_subscription_token = saved_token_id;
        }

        if (payment_type) {
          subscriptionData.midtrans_payment_method = payment_type;
        }

        if (masked_card) {
          subscriptionData.midtrans_account_id = masked_card;
        } else if (saved_token_id) {
          subscriptionData.midtrans_account_id = saved_token_id;
        }

        if (planType === 'monthly') {
          subscriptionData.recurring_frequency = 'monthly';
          const now = new Date();
          const nextBilling = getNextBillingDate(now, billingDay);
          subscriptionData.renews_at = nextBilling.toISOString();
          subscriptionData.ends_at = null;
          console.log('Monthly plan: Set renews_at to:', nextBilling.toISOString());
        } else if (planType === 'lifetime') {
          subscriptionData.renews_at = null;
          subscriptionData.ends_at = null;
          console.log('Lifetime plan: Set renews_at and ends_at to null');
        }

        if (!existingSubscription) {
          subscriptionData.id = generateUUID();
          subscriptionData.created_at = new Date().toISOString();
          console.log('Creating new subscription with ID:', subscriptionData.id);
        } else {
          console.log('Updating existing subscription with ID:', existingSubscription.id);
        }

        const { error: subscriptionError, data: upsertedData } = await (supabaseAdmin as any)
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error('Error upserting subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Upsert result:', { success: !subscriptionError, data: upsertedData });

        const { error: userError } = await (supabaseAdmin as any)
          .from('users')
          .upsert(
            {
              id: resolvedUserId,
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

        try {
          await updateWeeklyCoinAllocation(resolvedUserId, planType);
        } catch (allocErr) {
          console.error('Failed to update weekly coin allocation:', allocErr);
        }

        if (isReactivation) {
          await recordSubscriptionHistory(resolvedUserId, 'reactivated', {
            previousStatus: existingSubscription.status,
            newStatus: 'active',
            previousPlan: existingSubscription.plan,
            newPlan: planType,
            reason: 'Reactivated via payment webhook',
            metadata: { orderId: order_id, paymentType: payment_type },
          });
        } else if (!existingSubscription) {
          await recordSubscriptionHistory(resolvedUserId, 'subscription_created', {
            previousStatus: null,
            newStatus: 'active',
            previousPlan: 'free',
            newPlan: planType,
            reason: 'New subscription via payment webhook',
            metadata: { orderId: order_id, paymentType: payment_type },
          });
        }

        if (resolvedPlan === 'lifetime') {
          const { error: lifetimeError } = await (supabaseAdmin as any)
            .from('lifetime_access_purchases')
            .insert({
              user_id: resolvedUserId,
              order_id: order_id,
              amount: gross_amount,
              currency: subscriptionCurrency,
              purchased_at: new Date().toISOString(),
            });

          if (lifetimeError) {
            if (lifetimeError.code === '23505') {
              console.log('Lifetime purchase already recorded for order:', order_id);
            } else {
              console.error('Error recording lifetime purchase:', lifetimeError);
            }
          }
        }

        console.log('Subscription created successfully for user:', resolvedUserId);
      } catch (error) {
        console.error('Error creating subscription:', error);
      }
    } else if (transaction_status === 'pending') {
      console.log('Transaction pending:', { order_id });
    }

    // Clean up pending transaction after all processing
    if (transaction_status !== 'pending') {
      await (supabaseAdmin as any)
        .from('pending_midtrans_transactions')
        .delete()
        .eq('order_id', order_id);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleRecurringPayment({
  subscriptionId,
  userId,
  order_id,
  gross_amount,
}: {
  subscriptionId: string;
  userId?: string;
  order_id: string;
  gross_amount: string;
}) {
  console.log('Handling recurring payment:', { subscriptionId, userId, order_id });

  const { data: subscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('midtrans_subscription_token', subscriptionId)
    .maybeSingle();

  if (!subscription) {
    console.error('Subscription not found for recurring payment:', subscriptionId);
    return;
  }

  const billingDay = subscription.billing_day || new Date().getDate();
  const nextBilling = getNextBillingDate(new Date(), billingDay);

  await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      renews_at: nextBilling.toISOString(),
      payment_failure_count: 0,
      last_payment_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_status: 'active',
      is_pro: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log('Recurring payment successful, next billing:', nextBilling.toISOString());
}

async function handleFailedPayment({
  order_id,
  userId,
  transaction_status,
  payment_type,
  subscription_id,
}: {
  order_id: string;
  userId?: string;
  transaction_status: string;
  payment_type: string;
  subscription_id: string;
}) {
  console.log('Handling failed payment:', { order_id, transaction_status, userId, payment_type });

  if (payment_type === 'recurring' || subscription_id) {
    const { data: subscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscription && subscription.plan === 'monthly') {
      const newFailureCount = (subscription.payment_failure_count || 0) + 1;
      
      await (supabaseAdmin as any)
        .from('subscriptions')
        .update({
          payment_failure_count: newFailureCount,
          last_payment_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (newFailureCount >= 3) {
        await (supabaseAdmin as any)
          .from('subscriptions')
          .update({
            status: 'expired',
            ends_at: new Date().toISOString(),
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
          .eq('id', userId);

        await recordSubscriptionHistory(userId!, 'expired', {
          previousStatus: subscription.status,
          newStatus: 'expired',
          previousPlan: 'monthly',
          newPlan: 'free',
          reason: `Recurring payment failed ${newFailureCount} times`,
          metadata: { failureCount: newFailureCount, transactionStatus: transaction_status },
        });

        console.log('Subscription expired after 3 failed payments:', userId);
      } else {
        console.log(`Recurring payment failed (attempt ${newFailureCount}/3):`, userId);
      }
    }
  }

  console.log('Failed payment handled:', { order_id, transaction_status });
}

async function handleSubscriptionCancellation({
  subscriptionId,
  userId,
}: {
  subscriptionId: string;
  userId?: string;
}) {
  console.log('Handling subscription cancellation:', { subscriptionId, userId });

  const now = new Date().toISOString();

  const { data: subscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('midtrans_subscription_token', subscriptionId)
    .maybeSingle();

  if (!subscription) {
    console.error('Subscription not found for cancellation:', subscriptionId);
    return;
  }

  const previousStatus = subscription.status;
  const previousPlan = subscription.plan;

  await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      status: 'cancelled',
      ends_at: subscription.renews_at || now,
      midtrans_subscription_token: null,
      last_cancelled_at: now,
      updated_at: now,
    })
    .eq('id', subscription.id);

  await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_plan: 'free',
      subscription_status: 'cancelled',
      is_pro: false,
      updated_at: now,
    })
    .eq('id', userId);

  await recordSubscriptionHistory(userId!, 'cancelled', {
    previousStatus,
    newStatus: 'cancelled',
    previousPlan,
    newPlan: 'free',
    reason: 'Cancelled via Midtrans webhook',
    metadata: { subscriptionId, midtransSubscriptionId: subscriptionId },
  });

  console.log('Subscription cancelled successfully');
}

async function handleFirstPaymentWithSaveCard({
  userId,
  order_id,
  gross_amount,
  plan,
  currency,
  saved_token_id,
  masked_card,
}: {
  userId: string;
  order_id: string;
  gross_amount: string;
  plan: string;
  currency: string;
  saved_token_id: string;
  masked_card: string;
}) {
  console.log('=== HANDLING FIRST PAYMENT WITH SAVE CARD ===');

  const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';
  const billingDay = new Date().getDate();
  const subscriptionCurrency = currency || 'IDR';

  const subscriptionData: any = {
    user_id: userId,
    plan: planType,
    status: 'active',
    midtrans_subscription_id: order_id,
    midtrans_subscription_token: saved_token_id,
    midtrans_payment_method: 'credit_card',
    midtrans_account_id: masked_card,
    recurring_frequency: 'monthly',
    currency: subscriptionCurrency,
    billing_day: billingDay,
    payment_failure_count: 0,
    updated_at: new Date().toISOString(),
  };

  if (planType === 'monthly') {
    const nextBilling = getNextBillingDate(new Date(), billingDay);
    subscriptionData.renews_at = nextBilling.toISOString();
    subscriptionData.ends_at = null;
  } else if (planType === 'lifetime') {
    subscriptionData.renews_at = null;
    subscriptionData.ends_at = null;
  }

  const { data: existingSubscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('id, user_id, plan, status')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSubscription?.plan === 'lifetime' && planType !== 'lifetime') {
    console.warn('Attempted to overwrite lifetime subscription:', userId);
    return;
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
    return;
  }

  await (supabaseAdmin as any)
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

  try {
    await updateWeeklyCoinAllocation(userId, planType);
  } catch (allocErr) {
    console.error('Failed to update weekly coin allocation:', allocErr);
  }

  const isReactivation = existingSubscription && 
    (existingSubscription.status === 'cancelled' || existingSubscription.status === 'canceled');

  if (isReactivation) {
    await recordSubscriptionHistory(userId, 'reactivated', {
      previousStatus: existingSubscription.status,
      newStatus: 'active',
      previousPlan: existingSubscription.plan,
      newPlan: planType,
      reason: 'Reactivated via save card payment',
      metadata: { orderId: order_id, paymentType: 'credit_card' },
    });
  } else if (!existingSubscription) {
    await recordSubscriptionHistory(userId, 'subscription_created', {
      previousStatus: null,
      newStatus: 'active',
      previousPlan: 'free',
      newPlan: planType,
      reason: 'New subscription via save card payment',
      metadata: { orderId: order_id, paymentType: 'credit_card' },
    });
  }

  if (plan === 'lifetime') {
    const { error: lifetimeError } = await (supabaseAdmin as any)
      .from('lifetime_access_purchases')
      .insert({
        user_id: userId,
        order_id: order_id,
        amount: gross_amount,
        currency: subscriptionCurrency,
        purchased_at: new Date().toISOString(),
      });

    if (lifetimeError) {
      if (lifetimeError.code === '23505') {
        console.log('Lifetime purchase already recorded for order:', order_id);
      } else {
        console.error('Error recording lifetime purchase:', lifetimeError);
      }
    }
  }

  if (planType === 'monthly') {
    try {
      const response = await fetch(`${MIDTRANS_CONFIG.isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'}/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          name: 'JobTracker Monthly Pro',
          amount: gross_amount,
          currency: subscriptionCurrency,
          payment_type: 'credit_card',
          token: saved_token_id,
          schedule: {
            interval: 1,
            interval_unit: 'month',
          },
          customer_details: {
            email: '',
            first_name: '',
            last_name: '',
            phone: '',
          },
          metadata: {
            user_id: userId,
            plan: 'monthly',
            order_id: order_id,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create Midtrans subscription:', errorText);
        return;
      }

      const result = await response.json();
      console.log('Midtrans subscription created:', result);

      await (supabaseAdmin as any)
        .from('subscriptions')
        .update({
          midtrans_subscription_token: result.id,
          renews_at: result.schedule?.next_execution_at || getNextBillingDate(new Date(), billingDay).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log('Subscription updated with Midtrans subscription token:', result.id);
    } catch (error) {
      console.error('Error creating Midtrans subscription:', error);
    }
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-callback-token, x-signature-key',
    },
  });
}

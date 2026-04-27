import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPaymentWithMidtrans } from '@/lib/middleware/webhook-verify';
import { recordSubscriptionHistory } from '@/lib/middleware/subscription-utils';

function generateUUID(): string {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, status_code, gross_amount, custom_field1: userId, custom_field2: plan, custom_field3: currency, signature_key, payment_type, subscription_id, saved_token_id, masked_card } = body;

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

    console.log('Midtrans webhook received:', { order_id, transaction_status, status_code, gross_amount, userId, plan, payment_type, subscription_id, saved_token_id, masked_card });

    if (signature_key) {
      const statusCode = status_code || getStatusCodeFromTransactionStatus(transaction_status);
      const stringToSign = `${order_id}${statusCode}${gross_amount}${MIDTRANS_CONFIG.serverKey}`;
      const calculatedSignature = crypto.createHash('sha512').update(stringToSign).digest('hex');

      console.log('Signature verification:', {
        received: signature_key,
        calculated: calculatedSignature,
        stringToSign: `${order_id}${statusCode}${gross_amount}[serverKey]`,
        serverKeyLength: MIDTRANS_CONFIG.serverKey?.length,
        statusCode: statusCode
      });

      if (signature_key !== calculatedSignature) {
        console.error('Invalid signature:', { received: signature_key, calculated: calculatedSignature });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    } else {
      console.log('No signature key provided, skipping verification');
    }

    console.log('Midtrans webhook verified:', { order_id, transaction_status, userId, plan });

    const isFinalStatus = ['settlement', 'capture', 'deny', 'cancel', 'expire'].includes(transaction_status);

    if ((transaction_status === 'settlement' || transaction_status === 'capture') && payment_type === 'credit_card' && saved_token_id) {
      console.log('=== CREDIT CARD PAYMENT WITH SAVE CARD DETECTED ===');
      console.log('Has saved_token_id:', !!saved_token_id);
      console.log('Has masked_card:', !!masked_card);

      const { verified, transactionStatus: verifiedStatus } = await verifyPaymentWithMidtrans(order_id);
      if (!verified || verifiedStatus !== transaction_status) {
        console.error('Payment verification failed:', { verified, verifiedStatus, expectedStatus: transaction_status });
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      console.log('=== HANDLING WITH SAVE CARD (AUTO-RENEWAL) ===');
      await handleFirstPaymentWithSaveCard({
        userId,
        order_id,
        gross_amount,
        plan,
        currency,
        saved_token_id,
        masked_card,
      });
      return NextResponse.json({ status: 'OK' });
    }

    if (transaction_status === 'settlement' && payment_type === 'recurring') {
      const { verified, transactionStatus: verifiedStatus } = await verifyPaymentWithMidtrans(order_id);
      if (!verified || verifiedStatus !== transaction_status) {
        console.error('Recurring payment verification failed:', { verified, verifiedStatus });
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      await handleRecurringPayment({
        subscriptionId: subscription_id,
        userId,
        order_id,
        gross_amount,
      });
      return NextResponse.json({ status: 'OK' });
    }

    if (isFinalStatus) {
      const { error: deleteError } = await (supabaseAdmin as any)
        .from('pending_midtrans_transactions')
        .delete()
        .eq('order_id', order_id);

      if (deleteError) {
        console.error('Error deleting pending transaction:', deleteError);
      }
    }

    if (transaction_status === 'settlement' && payment_type !== 'credit_card' && payment_type !== 'recurring') {
      console.log('=== OTHER PAYMENT TYPE DETECTED ===');
      console.log('Payment type:', payment_type);
      console.log('User ID:', userId);
      console.log('Plan:', plan);

      const { verified, transactionStatus: verifiedStatus } = await verifyPaymentWithMidtrans(order_id);
      if (!verified || verifiedStatus !== 'settlement') {
        console.error('Payment verification failed for non-CC payment:', { verified, verifiedStatus });
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }
    }

    if (body.event === 'subscription.cancelled' || body.event === 'subscription.expired') {
      await handleSubscriptionCancellation({
        subscriptionId: subscription_id,
        userId,
      });
      return NextResponse.json({ status: 'OK' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      try {
        const { data: processedOrder } = await (supabaseAdmin as any)
          .from('subscriptions')
          .select('id, midtrans_subscription_id')
          .eq('midtrans_subscription_id', order_id)
          .maybeSingle();

        if (processedOrder) {
          console.log('Order already processed, skipping:', order_id);
          return NextResponse.json({ status: 'OK', message: 'Already processed' });
        }

        const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

        console.log('=== WEBHOOK SUBSCRIPTION CREATION ===');
        console.log('User ID:', userId);
        console.log('Plan:', planType);
        console.log('Order ID:', order_id);

        const { data: existingSubscription } = await (supabaseAdmin as any)
          .from('subscriptions')
          .select('id, user_id, plan, status, midtrans_subscription_id, midtrans_subscription_token, renews_at, ends_at, created_at, updated_at')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('Existing subscription found:', existingSubscription);

        const isReactivation = existingSubscription && 
          (existingSubscription.status === 'cancelled' || existingSubscription.status === 'canceled');

        const subscriptionData: any = {
          user_id: userId,
          plan: planType,
          status: 'active',
          midtrans_subscription_id: order_id,
          midtrans_subscription_token: null,
          midtrans_payment_method: null,
          midtrans_account_id: null,
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

        console.log('New subscription data to insert:', subscriptionData);

        if (planType === 'monthly') {
          subscriptionData.recurring_frequency = 'monthly';
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          subscriptionData.renews_at = nextMonth.toISOString();
          subscriptionData.ends_at = null;
          console.log('Monthly plan: Set renews_at to:', nextMonth.toISOString());
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

        console.log('About to upsert to subscriptions table:', subscriptionData);

        const { error: subscriptionError, data: upsertedData } = await (supabaseAdmin as any)
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error('Error upserting subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Upsert result:', { success: !subscriptionError, data: upsertedData });
        console.log('Subscription upsert completed successfully');

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

        if (isReactivation) {
          await recordSubscriptionHistory(userId, 'reactivated', {
            previousStatus: existingSubscription.status,
            newStatus: 'active',
            previousPlan: existingSubscription.plan,
            newPlan: planType,
            reason: 'Reactivated via payment webhook',
            metadata: { orderId: order_id, paymentType },
          });
        } else if (!existingSubscription) {
          await recordSubscriptionHistory(userId, 'subscription_created', {
            previousStatus: null,
            newStatus: 'active',
            previousPlan: 'free',
            newPlan: planType,
            reason: 'New subscription via payment webhook',
            metadata: { orderId: order_id, paymentType },
          });
        }

        if (plan === 'lifetime') {
          const { error: lifetimeError } = await (supabaseAdmin as any)
            .from('lifetime_access_purchases')
            .insert({
              user_id: userId,
              order_id: order_id,
              amount: gross_amount,
              currency: currency || 'IDR',
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

        console.log('Subscription created successfully for user:', userId);
      } catch (error) {
        console.error('Error creating subscription:', error);
      }
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      console.log('Transaction failed:', { order_id, transaction_status });
    } else if (transaction_status === 'pending') {
      console.log('Transaction pending:', { order_id });
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
  userId: string;
  order_id: string;
  gross_amount: string;
}) {
  console.log('Handling recurring payment:', { subscriptionId, userId, order_id });

  const { data: subscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('midtrans_subscription_token', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found for recurring payment:', subscriptionId);
    return;
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const { error: updateError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      renews_at: nextMonth.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Failed to update subscription for recurring payment:', updateError);
  } else {
    console.log('Subscription renewed successfully until:', nextMonth.toISOString());
  }

  await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_status: 'active',
      is_pro: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

async function handleSubscriptionCancellation({
  subscriptionId,
  userId,
}: {
  subscriptionId: string;
  userId: string;
}) {
  console.log('Handling subscription cancellation:', { subscriptionId, userId });

  const now = new Date().toISOString();

  const { data: subscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('midtrans_subscription_token', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found for cancellation:', subscriptionId);
    return;
  }

  const previousStatus = subscription.status;
  const previousPlan = subscription.plan;

  const { error: updateError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .update({
      status: 'cancelled',
      ends_at: subscription.renews_at || now,
      midtrans_subscription_token: null,
      last_cancelled_at: now,
      updated_at: now,
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Failed to cancel subscription:', updateError);
    return;
  }

  const { error: userError } = await (supabaseAdmin as any)
    .from('users')
    .update({
      subscription_plan: 'free',
      subscription_status: 'cancelled',
      is_pro: false,
      updated_at: now,
    })
    .eq('id', userId);

  if (userError) {
    console.error('Failed to revert user to free plan:', userError);
  }

  await recordSubscriptionHistory(userId, 'cancelled', {
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
  console.log('User ID:', userId);
  console.log('Order ID:', order_id);
  console.log('Saved Token ID:', saved_token_id);
  console.log('Masked Card:', masked_card);

  const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

  const subscriptionData: any = {
    user_id: userId,
    plan: planType,
    status: 'active',
    midtrans_subscription_id: order_id,
    midtrans_subscription_token: saved_token_id,
    midtrans_payment_method: 'credit_card',
    midtrans_account_id: masked_card,
    recurring_frequency: 'monthly',
    updated_at: new Date().toISOString(),
  };

  if (planType === 'monthly') {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    subscriptionData.renews_at = nextMonth.toISOString();
    subscriptionData.ends_at = null;
    console.log('Monthly plan: Set renews_at to:', nextMonth.toISOString());
  } else if (planType === 'lifetime') {
    subscriptionData.renews_at = null;
    subscriptionData.ends_at = null;
    console.log('Lifetime plan: Set renews_at and ends_at to null');
  }

  const { data: existingSubscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('id, user_id, plan, status')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingSubscription) {
    subscriptionData.id = generateUUID();
    subscriptionData.created_at = new Date().toISOString();
  }

  console.log('Upserting subscription with saved_token_id:', subscriptionData);

  const { error: subscriptionError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' });

  if (subscriptionError) {
    console.error('Error upserting subscription:', subscriptionError);
    return;
  }

  console.log('Subscription upserted successfully');

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
        currency: currency || 'IDR',
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

  console.log('=== FIRST PAYMENT WITH SAVE CARD HANDLED ===');

  if (planType === 'monthly') {
    console.log('Creating Midtrans recurring subscription for user:', userId);

    try {
      const response = await fetch(`${process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'}/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          name: 'JobTracker Monthly Pro',
          amount: gross_amount,
          currency: currency || 'IDR',
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
          renews_at: result.schedule?.next_execution_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log('Subscription updated with Midtrans subscription token:', result.id);
    } catch (error) {
      console.error('Error creating Midtrans subscription:', error);
    }
  }
}

async function handleFirstPaymentWithoutSaveCard({
  userId,
  order_id,
  gross_amount,
  plan,
  currency,
}: {
  userId: string;
  order_id: string;
  gross_amount: string;
  plan: string;
  currency: string;
}) {
  console.log('=== HANDLING ONE-TIME PAYMENT WITHOUT SAVE CARD ===');
  console.log('User ID:', userId);
  console.log('Order ID:', order_id);
  console.log('Plan:', plan);

  const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

  const subscriptionData: any = {
    user_id: userId,
    plan: planType,
    status: 'active',
    midtrans_subscription_id: order_id,
    midtrans_subscription_token: null,
    midtrans_payment_method: 'credit_card',
    midtrans_account_id: null,
    recurring_frequency: null,
    updated_at: new Date().toISOString(),
  };

  if (planType === 'monthly') {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    subscriptionData.renews_at = nextMonth.toISOString();
    subscriptionData.ends_at = null;
    console.log('Monthly plan (one-time): Set renews_at to:', nextMonth.toISOString());
  } else if (planType === 'lifetime') {
    subscriptionData.renews_at = null;
    subscriptionData.ends_at = null;
    console.log('Lifetime plan: Set renews_at and ends_at to null');
  }

  const { data: existingSubscription } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('id, user_id, plan, status')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingSubscription) {
    subscriptionData.id = generateUUID();
    subscriptionData.created_at = new Date().toISOString();
  }

  console.log('Upserting subscription WITHOUT saved_token_id:', subscriptionData);

  const { error: subscriptionError } = await (supabaseAdmin as any)
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' });

  if (subscriptionError) {
    console.error('Error upserting subscription:', subscriptionError);
    return;
  }

  console.log('Subscription upserted successfully (one-time payment)');

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

  const isReactivation = existingSubscription && 
    (existingSubscription.status === 'cancelled' || existingSubscription.status === 'canceled');

  if (isReactivation) {
    await recordSubscriptionHistory(userId, 'reactivated', {
      previousStatus: existingSubscription.status,
      newStatus: 'active',
      previousPlan: existingSubscription.plan,
      newPlan: planType,
      reason: 'Reactivated via one-time payment',
      metadata: { orderId: order_id },
    });
  } else if (!existingSubscription) {
    await recordSubscriptionHistory(userId, 'subscription_created', {
      previousStatus: null,
      newStatus: 'active',
      previousPlan: 'free',
      newPlan: planType,
      reason: 'New subscription via one-time payment',
      metadata: { orderId: order_id },
    });
  }

  if (plan === 'lifetime') {
    const { error: lifetimeError } = await (supabaseAdmin as any)
      .from('lifetime_access_purchases')
      .insert({
        user_id: userId,
        order_id: order_id,
        amount: gross_amount,
        currency: currency || 'IDR',
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

  console.log('=== ONE-TIME PAYMENT HANDLED ===');
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

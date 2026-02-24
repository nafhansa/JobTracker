import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { createSubscription } from '@/lib/supabase/subscriptions';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signatureKey = req.headers.get('x-callback-token');

    if (!signatureKey) {
      return NextResponse.json(
        { error: 'No signature key' },
        { status: 403 }
      );
    }

    const { order_id, transaction_status, gross_amount, custom_field1: userId, custom_field2: plan } = body;

    const stringToSign = `${order_id}${transaction_status}${gross_amount}${MIDTRANS_CONFIG.serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(stringToSign).digest('hex');

    if (signatureKey !== calculatedSignature) {
      console.error('Invalid signature:', { received: signatureKey, calculated: calculatedSignature });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('Midtrans webhook:', { order_id, transaction_status, userId, plan });

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      try {
        await createSubscription(userId, plan === 'jobtracker_lifetime' ? 'lifetime' : 'monthly');

        if (plan === 'jobtracker_lifetime') {
          const { error: lifetimeError } = await (supabase.from('lifetime_access_purchases') as any)
            .insert({
              user_id: userId,
              order_id: order_id,
              amount: gross_amount,
              currency: 'IDR',
              purchased_at: new Date().toISOString(),
            });

          if (lifetimeError) {
            console.error('Error recording lifetime purchase:', lifetimeError);
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

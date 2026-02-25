import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { createSubscription } from '@/lib/supabase/subscriptions';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, gross_amount, custom_field1: userId, custom_field2: plan, signature_key } = body;

    console.log('Midtrans webhook received:', { order_id, transaction_status, gross_amount });

    const stringToSign = `${order_id}${transaction_status}${gross_amount}${MIDTRANS_CONFIG.serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(stringToSign).digest('hex');

    console.log('Signature verification:', { 
      received: signature_key, 
      calculated: calculatedSignature,
      stringToSign: `${order_id}${transaction_status}${gross_amount}`,
      serverKeyLength: MIDTRANS_CONFIG.serverKey?.length
    });

    if (signature_key !== calculatedSignature) {
      console.error('Invalid signature:', { received: signature_key, calculated: calculatedSignature });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('Midtrans webhook verified:', { order_id, transaction_status, userId, plan });

    const isFinalStatus = ['settlement', 'capture', 'deny', 'cancel', 'expire'].includes(transaction_status);

    if (isFinalStatus) {
      const { error: deleteError } = await (supabaseAdmin as any)
        .from('pending_midtrans_transactions')
        .delete()
        .eq('order_id', order_id);

      if (deleteError) {
        console.error('Error deleting pending transaction:', deleteError);
      }
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      try {
        await createSubscription(userId, plan === 'lifetime' ? 'lifetime' : 'monthly');

        if (plan === 'lifetime') {
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

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, status_code, gross_amount, custom_field1: userId, custom_field2: plan, signature_key } = body;

    console.log('Midtrans webhook received:', { order_id, transaction_status, status_code, gross_amount, userId, plan });

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
        const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

        console.log('Creating subscription for user:', userId, 'with plan:', planType);

        const { error: subscriptionError } = await (supabaseAdmin as any)
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: planType,
              status: 'active',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

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

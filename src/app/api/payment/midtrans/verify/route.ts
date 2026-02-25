import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabaseAdmin } from '@/lib/supabase/server';

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

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
    const statusApiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
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
    });

    if (result.transaction_status === 'settlement' || result.transaction_status === 'capture') {
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
          updated_at: new Date().toISOString(),
        };

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

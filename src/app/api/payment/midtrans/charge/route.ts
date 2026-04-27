import { NextResponse } from "next/server";
import crypto from 'crypto';
import { MIDTRANS_CONFIG, MIDTRANS_PRICES } from "@/lib/midtrans-config";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const { data: transaction, error } = await (supabaseAdmin as any)
      .from('pending_midtrans_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !transaction) {
      console.error('Transaction not found:', error);
      return NextResponse.json(
        { error: "Payment session expired or not found. Please go back and try again." },
        { status: 404 }
      );
    }

    console.log('GET /api/payment/midtrans/charge:', {
      orderId,
      snapToken: transaction.snap_token,
    });
    
    return NextResponse.json({
      success: true,
      orderId: transaction.order_id,
      amount: transaction.amount,
      token: transaction.snap_token,
      plan: transaction.plan,
    });
  } catch (error) {
    console.error('Payment GET error:', error);
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, plan, customerDetails, currency = 'IDR', enableAutoRenew } = body;

    if (!userId || !plan || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields: userId, plan, customerDetails" },
        { status: 400 }
      );
    }

    const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';

    const { data: existingSubscription } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('id, plan, status, ends_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSubscription?.plan === 'lifetime' && planType !== 'lifetime') {
      return NextResponse.json(
        { error: "You already have lifetime access. No need to subscribe again." },
        { status: 400 }
      );
    }

    if (existingSubscription?.plan === planType && existingSubscription.status === 'active') {
      if (planType === 'monthly' && existingSubscription.ends_at && new Date(existingSubscription.ends_at) > new Date()) {
        return NextResponse.json(
          { error: "You already have an active monthly subscription." },
          { status: 400 }
        );
      }
    }

    const { data: existingPending } = await (supabaseAdmin as any)
      .from('pending_midtrans_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan', planType)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingPending) {
      console.log('Returning existing pending transaction for user:', userId);
      return NextResponse.json({
        success: true,
        orderId: existingPending.order_id,
        token: existingPending.snap_token,
      });
    }

    const shouldAutoRenew = enableAutoRenew !== undefined ? enableAutoRenew : planType === 'monthly';
    const amount = currency === 'USD'
      ? (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeUSD : MIDTRANS_PRICES.monthlyUSD)
      : (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeIDR : MIDTRANS_PRICES.monthlyIDR);

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    const userIdShort = userId.substring(0, 12);
    const orderId = `JT-${userIdShort}-${timestamp}-${randomStr}`;

    const billingDay = new Date().getDate();

    return await createSnapTransaction({
      userId,
      planType,
      amount,
      currency,
      customerDetails,
      orderId,
      enableAutoRenew: shouldAutoRenew,
      billingDay,
    });
  } catch (error) {
    console.error('Midtrans charge error:', error);
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

async function createSnapTransaction({
  userId,
  planType,
  amount,
  currency,
  customerDetails,
  orderId,
  enableAutoRenew = false,
  billingDay,
}: {
  userId: string;
  planType: 'monthly' | 'lifetime';
  amount: number;
  currency: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderId: string;
  enableAutoRenew?: boolean;
  billingDay: number;
}) {
  const snapBody: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
      currency: currency,
    },
    customer_details: {
      first_name: customerDetails.firstName || 'JobTracker',
      last_name: customerDetails.lastName || 'User',
      email: customerDetails.email || '',
      phone: customerDetails.phone || '',
    },
    item_details: [
      {
        id: planType === 'lifetime' ? 'jobtracker_lifetime' : 'jobtracker_monthly',
        price: amount,
        quantity: 1,
        name: planType === 'lifetime' ? 'JobTracker Lifetime Pro' : 'JobTracker Monthly Pro',
        brand: 'JobTracker',
        currency: currency,
      },
    ],
    custom_field1: userId,
    custom_field2: planType,
    custom_field3: currency,
  };

  if (enableAutoRenew && planType === 'monthly') {
    snapBody.credit_card = {
      save_card: true,
    };
  }

  if (!MIDTRANS_CONFIG.serverKey) {
    console.error('Midtrans server key not configured');
    return NextResponse.json(
      { error: 'Midtrans server key not configured' },
      { status: 500 }
    );
  }

  const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
  const snapApiUrl = MIDTRANS_CONFIG.isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  console.log('Creating Midtrans transaction:', {
    orderId,
    amount,
    currency,
    snapApiUrl,
    serverKeyLength: MIDTRANS_CONFIG.serverKey.length,
    authStringLength: authString.length,
    enableAutoRenew,
    billingDay,
  });

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    response = await fetch(snapApiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(snapBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (fetchError) {
    console.error('Failed to connect to Midtrans API:', fetchError);
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Midtrans API request timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Failed to connect to Midtrans API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
      { status: 500 }
    );
  }

  const responseText = await response.text();
  console.log('Midtrans response status:', response.status);
  console.log('Midtrans response body:', responseText);

  if (!response.ok) {
    console.error('Midtrans API error:', response.status, responseText);
    return NextResponse.json(
      { error: `Midtrans API error: ${response.status} - ${responseText}` },
      { status: 500 }
    );
  }

  if (!responseText || responseText.trim() === '') {
    console.error('Midtrans API returned empty response body');
    return NextResponse.json(
      { error: 'Midtrans API returned empty response' },
      { status: 500 }
    );
  }

  const result = JSON.parse(responseText);

  if (!result.token) {
    console.error('Midtrans Snap error: No token in response', result);
    return NextResponse.json(
      { error: 'No token returned from Midtrans' },
      { status: 500 }
    );
  }

  const token = result.token;
  const redirectUrl = result.redirect_url;

  const transactionId = crypto.randomUUID();

  const { error: dbError } = await (supabaseAdmin as any)
    .from('pending_midtrans_transactions')
    .insert({
      id: transactionId,
      order_id: orderId,
      user_id: userId,
      plan: planType,
      amount: amount,
      snap_token: token,
      customer_email: customerDetails.email || null,
      currency: currency,
      billing_day: billingDay,
    });

  if (dbError) {
    console.error('Failed to store transaction in database:', dbError);
    return NextResponse.json(
      { error: `Failed to store transaction: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    orderId,
    token,
    redirectUrl,
  });
}

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
    const { userId, plan, customerDetails, currency = 'IDR', paymentMethod } = body;

    if (!userId || !plan || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields: userId, plan, customerDetails" },
        { status: 400 }
      );
    }

    if (paymentMethod && currency !== 'IDR') {
      return NextResponse.json(
        { error: "Recurring payments only support IDR currency" },
        { status: 400 }
      );
    }

    const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';
    const amount = currency === 'USD'
      ? (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeUSD : MIDTRANS_PRICES.monthlyUSD)
      : (planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeIDR : MIDTRANS_PRICES.monthlyIDR);

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    const userIdShort = userId.substring(0, 12);
    const orderId = `JT-${userIdShort}-${timestamp}-${randomStr}`;

    if (paymentMethod) {
      return await createSubscription({
        userId,
        planType,
        amount,
        currency,
        paymentMethod,
        customerDetails,
        orderId,
      });
    } else {
      return await createSnapTransaction({
        userId,
        planType,
        amount,
        currency,
        customerDetails,
        orderId,
      });
    }
  } catch (error) {
    console.error('Midtrans charge error:', error);
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

async function createSubscription({
  userId,
  planType,
  amount,
  currency,
  paymentMethod,
  customerDetails,
  orderId,
}: {
  userId: string;
  planType: 'monthly' | 'lifetime';
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'gopay_tokenization';
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderId: string;
}) {
  const subscriptionId = crypto.randomUUID();
  const internalToken = crypto.randomUUID();

  const subscriptionBody = {
    name: "JobTracker Monthly Pro",
    amount: amount.toString(),
    currency: "IDR",
    payment_type: paymentMethod === 'credit_card' ? 'credit_card' : 'gopay_tokenization',
    schedule: {
      interval: 1,
      interval_unit: "month",
    },
    customer_details: {
      first_name: customerDetails.firstName || 'JobTracker',
      last_name: customerDetails.lastName || 'User',
      email: customerDetails.email || '',
      phone: customerDetails.phone || '',
    },
    token: internalToken,
    user_id: userId,
    metadata: {
      user_id: userId,
      plan: planType,
      order_id: orderId,
    }
  };

  if (!MIDTRANS_CONFIG.serverKey) {
    console.error('Midtrans server key not configured');
    return NextResponse.json(
      { error: 'Midtrans server key not configured' },
      { status: 500 }
    );
  }

  const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
  const subscriptionApiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com/v1/subscriptions'
    : 'https://api.sandbox.midtrans.com/v1/subscriptions';

  console.log('Creating Midtrans subscription:', {
    orderId,
    amount,
    paymentMethod,
    subscriptionApiUrl,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(subscriptionApiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(subscriptionBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Midtrans Subscription API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Subscription API error: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const result = await response.json();

    console.log('Midtrans subscription response:', result);

    const { error: dbError } = await (supabaseAdmin as any)
      .from('pending_midtrans_transactions')
      .insert({
        id: subscriptionId,
        order_id: orderId,
        user_id: userId,
        plan: planType,
        amount: amount,
        snap_token: result.token || result.redirect_url,
        customer_email: customerDetails.email || null,
        payment_method: paymentMethod,
        subscription_token: internalToken,
        is_recurring: true,
      });

    if (dbError) {
      console.error('Failed to store subscription in database:', dbError);
      return NextResponse.json(
        { error: `Failed to store transaction: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      token: result.token,
      redirectUrl: result.redirect_url,
      subscriptionId: result.id,
      isRecurring: true,
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Midtrans API request timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create subscription' },
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
}) {
  const snapBody = {
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

  if (!MIDTRANS_CONFIG.serverKey) {
    console.error('Midtrans server key not configured');
    return NextResponse.json(
      { error: 'Midtrans server key not configured' },
      { status: 500 }
    );
  }

  const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');
  const snapApiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  console.log('Using Snap API URL:', snapApiUrl);

  console.log('Creating Midtrans transaction:', {
    orderId,
    amount,
    snapApiUrl,
    serverKeyLength: MIDTRANS_CONFIG.serverKey.length,
    authStringLength: authString.length,
    requestBody: JSON.stringify(snapBody),
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
  console.log('Midtrans response headers:', Object.fromEntries(response.headers.entries()));
  console.log('Midtrans response body:', responseText);
  console.log('Response body length:', responseText.length);

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

  console.log('Midtrans response parsed:', result);

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

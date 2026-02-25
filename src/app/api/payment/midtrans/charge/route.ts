import { NextResponse } from "next/server";
import crypto from 'crypto';
import { MIDTRANS_CONFIG, MIDTRANS_PRICES } from "@/lib/midtrans-config";

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

    const result = await response.json();

    if (result.status_code === '404') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.order_id,
      amount: parseInt(result.gross_amount),
      status: result.transaction_status,
      paymentType: result.payment_type,
      transactionTime: result.transaction_time,
    });
  } catch (error) {
    console.error('Midtrans GET transaction error:', error);
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
    const { userId, plan, customerDetails } = body;

    if (!userId || !plan || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields: userId, plan, customerDetails" },
        { status: 400 }
      );
    }

    const planType = plan === 'lifetime' ? 'lifetime' : 'monthly';
    const amount = planType === 'lifetime' ? MIDTRANS_PRICES.lifetimeIDR : MIDTRANS_PRICES.monthlyIDR;

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    const userIdShort = userId.substring(0, 12);
    const orderId = `JT-${userIdShort}-${timestamp}-${randomStr}`;

    const snapBody = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
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
        },
      ],
      custom_field1: userId,
      custom_field2: planType,
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
      ? 'https://api.midtrans.com/snap/v1/transactions'
      : 'https://api.sandbox.midtrans.com/snap/v1/transactions';

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

    return NextResponse.json({
      success: true,
      orderId,
      token,
      redirectUrl,
    });
  } catch (error) {
    console.error('Midtrans Snap charge error:', error);
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

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

    const response = await fetch(`${MIDTRANS_CONFIG.apiUrl}/v2/${orderId}/status`, {
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

    const orderId = `JT-${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const transactionDetails = {
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
    };

    const snapBody = {
      transaction_details: transactionDetails,
    };

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');

    const response = await fetch(`${MIDTRANS_CONFIG.apiUrl}/v1/snap/transactions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(snapBody),
    });

    const result = await response.json();

    if (!result.status_code || result.status_code !== '201') {
      console.error('Midtrans Snap error:', result);
      return NextResponse.json(
        { error: result.status_message || 'Failed to create transaction' },
        { status: result.status_code || 500 }
      );
    }

    const token = result.data?.token;
    const redirectUrl = result.data?.redirect_url;

    if (!token) {
      console.error('Midtrans Snap error: No token in response');
      return NextResponse.json(
        { error: 'No token returned from Midtrans' },
        { status: 500 }
      );
    }

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

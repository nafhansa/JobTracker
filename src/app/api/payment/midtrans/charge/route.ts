import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, orderId, amount, customerDetails, plan } = body;

    if (!userId || !orderId || !amount || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transactionDetails = {
      order_id: orderId,
      gross_amount: amount,
    };

    const customerInfo = {
      first_name: customerDetails?.firstName || 'JobTracker',
      last_name: customerDetails?.lastName || 'User',
      email: customerDetails?.email || '',
      phone: customerDetails?.phone || '',
    };

    const itemDetails = [
      {
        id: plan === 'monthly' ? 'jobtracker_monthly' : 'jobtracker_lifetime',
        price: amount,
        quantity: 1,
        name: plan === 'monthly' ? 'JobTracker Monthly Pro' : 'JobTracker Lifetime Pro',
      },
    ];

    const paymentType = 'bank_transfer';

    const bankTransferOptions = {
      bank: 'bca',
    };

    const transactionData = {
      payment_type: paymentType,
      transaction_details: transactionDetails,
      customer_details: customerInfo,
      item_details: itemDetails,
      bank_transfer: bankTransferOptions,
      custom_field1: userId,
      custom_field2: plan,
    };

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');

    const response = await fetch(`${MIDTRANS_CONFIG.apiUrl}/v2/charge`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(transactionData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Midtrans error:', result);
      return NextResponse.json(
        { error: result.message || 'Failed to create transaction' },
        { status: 500 }
      );
    }

    const vaNumber = result.va_numbers?.[0]?.va_number;
    const bank = result.va_numbers?.[0]?.bank;

    return NextResponse.json({
      success: true,
      orderId: result.order_id,
      transactionId: result.transaction_id,
      grossAmount: result.gross_amount,
      currency: result.currency,
      paymentType: result.payment_type,
      transactionTime: result.transaction_time,
      transactionStatus: result.transaction_status,
      fraudStatus: result.fraud_status,
      vaNumber,
      bank,
      expiryTime: result.expiry_time,
    });
  } catch (error) {
    console.error('Midtrans charge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

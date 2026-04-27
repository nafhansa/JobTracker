import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function verifyMidtransWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): Promise<boolean> {
  const crypto = await import('crypto');
  const { MIDTRANS_CONFIG } = await import('@/lib/midtrans-config');

  const stringToSign = `${orderId}${statusCode}${grossAmount}${MIDTRANS_CONFIG.serverKey}`;
  const calculatedSignature = crypto.createHash('sha512').update(stringToSign).digest('hex');

  return signatureKey === calculatedSignature;
}

export async function verifyPaymentWithMidtrans(orderId: string): Promise<{
  verified: boolean;
  transactionStatus: string | null;
  fraudStatus: string | null;
}> {
  const { MIDTRANS_CONFIG } = await import('@/lib/midtrans-config');

  if (!MIDTRANS_CONFIG.serverKey) {
    console.error('Midtrans server key not configured');
    return { verified: false, transactionStatus: null, fraudStatus: null };
  }

  try {
    const midtransApiUrl = MIDTRANS_CONFIG.isProduction
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');

    const response = await fetch(`${midtransApiUrl}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!response.ok) {
      console.error('Midtrans verification failed:', response.status);
      return { verified: false, transactionStatus: null, fraudStatus: null };
    }

    const data = await response.json();

    return {
      verified: true,
      transactionStatus: data.transaction_status || null,
      fraudStatus: data.fraud_status || null,
    };
  } catch (error) {
    console.error('Failed to verify payment with Midtrans:', error);
    return { verified: false, transactionStatus: null, fraudStatus: null };
  }
}

export async function verifyUserSubscription(userId: string): Promise<{
  valid: boolean;
  subscription: any | null;
}> {
  try {
    const { data: subscription, error } = await (supabaseAdmin as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error verifying subscription:', error);
      return { valid: false, subscription: null };
    }

    return { valid: !!subscription, subscription };
  } catch (error) {
    console.error('Failed to verify user subscription:', error);
    return { valid: false, subscription: null };
  }
}

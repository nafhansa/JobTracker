import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { MIDTRANS_CONFIG } from '@/lib/midtrans-config';
import { recordSubscriptionHistory } from '@/lib/middleware/subscription-utils';

export const runtime = 'nodejs';

async function verifyWithMidtrans(orderId: string): Promise<any> {
  if (!MIDTRANS_CONFIG.serverKey) {
    return null;
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
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to verify ${orderId}:`, error);
    return null;
  }
}

async function processPendingOperations() {
  console.log('Processing pending Midtrans operations...');

  const { data: pendingOps, error } = await (supabaseAdmin as any)
    .from('pending_midtrans_operations')
    .select('*')
    .lte('next_retry_at', new Date().toISOString())
    .lt('retry_count', 'max_retries');

  if (error || !pendingOps || pendingOps.length === 0) {
    console.log('No pending operations to process');
    return { processed: 0 };
  }

  let processed = 0;

  for (const op of pendingOps) {
    try {
      if (op.operation === 'cancel' && op.payload?.token) {
        const midtransApiUrl = MIDTRANS_CONFIG.isProduction
          ? 'https://api.midtrans.com'
          : 'https://api.sandbox.midtrans.com';

        const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString('base64');

        const response = await fetch(
          `${midtransApiUrl}/v1/subscriptions/${op.payload.token}/cancel`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${authString}`,
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (response.ok) {
          await (supabaseAdmin as any)
            .from('pending_midtrans_operations')
            .delete()
            .eq('id', op.id);
          processed++;
        } else {
          await (supabaseAdmin as any)
            .from('pending_midtrans_operations')
            .update({
              retry_count: op.retry_count + 1,
              next_retry_at: new Date(Date.now() + Math.pow(2, op.retry_count + 1) * 60000).toISOString(),
              last_error: `HTTP ${response.status}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', op.id);
        }
      }
    } catch (error) {
      console.error(`Failed to process operation ${op.id}:`, error);
      await (supabaseAdmin as any)
        .from('pending_midtrans_operations')
        .update({
          retry_count: op.retry_count + 1,
          next_retry_at: new Date(Date.now() + Math.pow(2, op.retry_count + 1) * 60000).toISOString(),
          last_error: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', op.id);
    }
  }

  return { processed };
}

async function cleanupExpiredData() {
  console.log('Cleaning up expired data...');

  const { count: pendingCount } = await (supabaseAdmin as any)
    .from('pending_midtrans_transactions')
    .delete()
    .lt('expires_at', new Date().toISOString());

  const { count: idempotencyCount } = await (supabaseAdmin as any)
    .from('subscription_idempotency_keys')
    .delete()
    .lt('expires_at', new Date().toISOString());

  const { count: historyCount } = await (supabaseAdmin as any)
    .from('subscription_history')
    .delete()
    .lt('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

  return {
    expiredPendingTransactions: pendingCount || 0,
    expiredIdempotencyKeys: idempotencyCount || 0,
    archivedHistoryRecords: historyCount || 0,
  };
}

async function reconcileActiveSubscriptions() {
  console.log('Reconciling active subscriptions...');

  const { data: subscriptions, error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('id, user_id, plan, status, midtrans_subscription_id, midtrans_subscription_token, renews_at')
    .eq('status', 'active')
    .eq('plan', 'monthly')
    .not('midtrans_subscription_token', 'is', null);

  if (error || !subscriptions || subscriptions.length === 0) {
    console.log('No active subscriptions to reconcile');
    return { reconciled: 0 };
  }

  let reconciled = 0;

  for (const sub of subscriptions) {
    try {
      const midtransStatus = await verifyWithMidtrans(sub.midtrans_subscription_id || sub.midtrans_subscription_token);

      if (!midtransStatus) {
        console.log(`Could not verify subscription ${sub.id}, skipping`);
        continue;
      }

      const midtransTransactionStatus = midtransStatus.transaction_status;

      if (midtransTransactionStatus === 'settlement' || midtransTransactionStatus === 'capture') {
        continue;
      }

      if (midtransTransactionStatus === 'cancel' || midtransTransactionStatus === 'expire') {
        await (supabaseAdmin as any)
          .from('subscriptions')
          .update({
            status: 'cancelled',
            ends_at: new Date().toISOString(),
            midtrans_subscription_token: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        await (supabaseAdmin as any)
          .from('users')
          .update({
            subscription_plan: 'free',
            subscription_status: 'cancelled',
            is_pro: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.user_id);

        await recordSubscriptionHistory(sub.user_id, 'expired', {
          previousStatus: 'active',
          newStatus: 'cancelled',
          previousPlan: 'monthly',
          newPlan: 'free',
          reason: 'Reconciliation: subscription cancelled/expired in Midtrans',
          metadata: { midtransStatus: midtransTransactionStatus },
        });

        reconciled++;
      }
    } catch (error) {
      console.error(`Failed to reconcile subscription ${sub.id}:`, error);
    }
  }

  return { reconciled };
}

export async function GET(req: Request) {
  const cronSecret = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting subscription reconciliation...');
  const startTime = Date.now();

  try {
    const [pendingOpsResult, cleanupResult, reconcileResult] = await Promise.all([
      processPendingOperations(),
      cleanupExpiredData(),
      reconcileActiveSubscriptions(),
    ]);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      pendingOperations: pendingOpsResult,
      cleanup: cleanupResult,
      reconciliation: reconcileResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Reconciliation failed:', error);
    return NextResponse.json(
      { error: 'Reconciliation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

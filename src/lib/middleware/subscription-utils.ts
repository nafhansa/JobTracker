import { supabaseAdmin } from '@/lib/supabase/server';

export async function checkIdempotencyKey(key: string): Promise<{ cached: boolean; response: any | null }> {
  if (!key) return { cached: false, response: null };

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('subscription_idempotency_keys')
      .select('response')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error checking idempotency key:', error);
      return { cached: false, response: null };
    }

    if (data && data.response) {
      return { cached: true, response: data.response };
    }

    return { cached: false, response: null };
  } catch (error) {
    console.error('Failed to check idempotency key:', error);
    return { cached: false, response: null };
  }
}

export async function storeIdempotencyKey(
  key: string,
  userId: string,
  action: string,
  response: any
): Promise<void> {
  if (!key) return;

  try {
    await (supabaseAdmin as any)
      .from('subscription_idempotency_keys')
      .upsert({
        key,
        user_id: userId,
        action,
        response,
        created_at: new Date().toISOString(),
      }, { onConflict: 'key' });
  } catch (error) {
    console.error('Failed to store idempotency key:', error);
  }
}

export async function recordSubscriptionHistory(
  userId: string,
  action: 'activated' | 'cancelled' | 'reactivated' | 'expired' | 'subscription_created' | 'upgraded_to_lifetime',
  options: {
    previousStatus?: string | null;
    newStatus?: string | null;
    previousPlan?: string | null;
    newPlan?: string | null;
    reason?: string | null;
    metadata?: Record<string, any>;
  } = {}
): Promise<void> {
  try {
    await (supabaseAdmin as any)
      .from('subscription_history')
      .insert({
        user_id: userId,
        action,
        previous_status: options.previousStatus || null,
        new_status: options.newStatus || null,
        previous_plan: options.previousPlan || null,
        new_plan: options.newPlan || null,
        reason: options.reason || null,
        metadata: options.metadata || {},
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to record subscription history:', error);
  }
}

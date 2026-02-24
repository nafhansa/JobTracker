import { supabase } from './client';
import { Timestamp } from 'firebase/firestore';

export interface SubscriptionData {
  status?: string;
  plan?: string;
  renewsAt?: Timestamp | Date | string | { _seconds?: number };
  endsAt?: Timestamp | Date | string | { _seconds?: number };
}

/**
 * Create or update subscription
 */
export const createSubscription = async (userId: string, plan: 'monthly' | 'lifetime') => {
  try {
    // Upsert subscription
    const { data: subscriptionData, error: subError } = await (supabase
      .from('subscriptions') as any)
      .upsert(
        {
          user_id: userId,
          plan,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subError) throw subError;

    // Update user record
    const { error: userError } = await (supabase
      .from('users') as any)
      .upsert(
        {
          id: userId,
          subscription_plan: plan,
          subscription_status: 'active',
          is_pro: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (userError) throw userError;

    return subscriptionData;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Get subscription for a user
 */
export const getSubscription = async (userId: string) => {
  try {
    // Get user record with subscription info
    const { data: userData, error: userError } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') throw userError; // PGRST116 = not found

    if (!userData) {
      // User doesn't exist, return null
      return null;
    }

    // Get subscription details if exists
    const { data: subscriptionData } = await (supabase
      .from('subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    // Transform to match Firebase format
    const subscription = subscriptionData
      ? {
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          renewsAt: subscriptionData.renews_at ? new Date(subscriptionData.renews_at) : undefined,
          endsAt: subscriptionData.ends_at ? new Date(subscriptionData.ends_at) : undefined,
        }
      : userData.subscription_plan
      ? {
          plan: userData.subscription_plan,
          status: userData.subscription_status || 'active',
        }
      : null;

    return {
      subscription,
      updatedAt: userData.updated_at ? new Date(userData.updated_at) : null,
      createdAt: userData.created_at ? new Date(userData.created_at) : null,
      isPro: userData.is_pro || false,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

/**
 * Check if user is Pro (has active subscription)
 */
export const checkIsPro = (subscription: SubscriptionData | null | undefined): boolean => {
  if (!subscription) return false;

  const { status, plan, renewsAt, endsAt } = subscription;

  // Free plan is never Pro
  if (plan === 'free') return false;

  // Lifetime = Auto Pro
  if (plan === 'lifetime') return true;

  // Status Active = Pro (but not free)
  if (status === 'active' && plan !== 'free') return true;

  // Status Cancelled = Check Grace Period using endsAt (priority) or renewsAt
  if (status === 'cancelled' || status === 'canceled') {
    const candidate = endsAt || renewsAt;
    if (!candidate) return false;

    let endDate: Date;
    if (candidate instanceof Timestamp) {
      endDate = candidate.toDate();
    } else if (candidate instanceof Date) {
      endDate = candidate;
    } else if (typeof candidate === 'string') {
      endDate = new Date(candidate);
    } else if (typeof candidate === 'object' && '_seconds' in candidate && typeof candidate._seconds === 'number') {
      endDate = new Date(candidate._seconds * 1000);
    } else {
      return false; // Unknown format
    }

    const now = new Date();
    return now < endDate; // Still Pro if not past target date
  }

  return false;
};

/**
 * Check if user is admin
 */
export const isAdminUser = (email: string | null | undefined): boolean => {
  const ADMIN_EMAILS = ['nafhan1723@gmail.com', 'nafhan.sh@gmail.com'];
  const lowerEmail = (email || '').toLowerCase().trim();
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(lowerEmail);
};

/**
 * Get plan limits
 */
export const getPlanLimits = (plan: string | null | undefined, isAdmin = false): number => {
  if (isAdmin) {
    return Infinity;
  }
  if (!plan || plan === 'free') {
    return 20; // FREE_PLAN_JOB_LIMIT
  }
  // Pro plans have unlimited
  return Infinity;
};

/**
 * Check if user can add a new job
 */
export const checkCanAddJob = (
  plan: string | null | undefined,
  currentJobCount: number,
  isAdmin = false
): boolean => {
  if (isAdmin) {
    return true;
  }
  const limit = getPlanLimits(plan, isAdmin);
  return currentJobCount < limit;
};

/**
 * Check if user can edit/delete jobs
 */
export const canEditDelete = (plan: string | null | undefined, isAdmin = false): boolean => {
  if (isAdmin) {
    return true;
  }
  // Free plan users are allowed to edit/delete
  return true;
};

/**
 * Auto-assign free plan to user if they don't have a subscription
 */
export const ensureFreePlan = async (userId: string, userEmail?: string): Promise<void> => {
  try {
    // Check if user exists
    const { data: userData } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (!userData) {
      // New user - create with free plan
      await (supabase
        .from('users') as any)
        .insert({
          id: userId,
          email: userEmail || null,
          subscription_plan: 'free',
          subscription_status: 'active',
          is_pro: false,
        });
    } else {
      // Existing user without subscription - assign free plan
      if (!userData.subscription_plan) {
        await (supabase
          .from('users') as any)
          .update({
            subscription_plan: 'free',
            subscription_status: 'active',
            is_pro: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }
  } catch (error) {
    console.error('Error ensuring free plan:', error);
    // Don't throw - let user continue even if assignment fails
  }
};
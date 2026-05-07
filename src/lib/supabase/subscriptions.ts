import { supabase } from './client';
import { Timestamp } from 'firebase/firestore';

export interface SubscriptionData {
  id?: string;
  status?: string;
  plan?: string;
  renewsAt?: Timestamp | Date | string | { _seconds?: number } | null;
  endsAt?: Timestamp | Date | string | { _seconds?: number } | null;
  midtransSubscriptionId?: string | null;
  midtransSubscriptionToken?: string | null;
  midtransPaymentMethod?: string | null;
  lastCancelledAt?: string | null;
  reactivationCount?: number;
  currency?: string;
  billingDay?: number;
}

export interface SubscriptionHistoryEntry {
  action: string;
  previous_status: string | null;
  new_status: string | null;
  previous_plan: string | null;
  new_plan: string | null;
  reason: string | null;
  created_at: string;
}

export interface SubscriptionStatusResponse {
  hasSubscription: boolean;
  plan: string;
  status: string;
  isPro: boolean;
  renewsAt: string | null;
  endsAt: string | null;
  midtransSubscriptionId: string | null;
  midtransPaymentMethod: string | null;
  reactivationCount: number;
  canReactivate: boolean;
  gracePeriodEndsAt: string | null;
  cooldownEndsAt: string | null;
  lastCancelledAt: string | null;
  history: SubscriptionHistoryEntry[];
}

/**
 * Create or update subscription
 * Uses API route to bypass CORS (since users authenticate with Firebase, not Supabase)
 */
export const createSubscription = async (userId: string, plan: 'monthly' | 'lifetime') => {
  try {
    const response = await fetch('/api/subscription/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, plan }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subscription');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Get subscription for a user
 * Uses API route to bypass CORS (since users authenticate with Firebase, not Supabase)
 */
export const getSubscription = async (userId: string) => {
  try {
    const response = await fetch(`/api/subscription/status?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get subscription');
    }

    const data = await response.json();
    return data;
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
  if (status === 'cancelled' || status === 'canceled' || status === 'expired') {
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
const ADMIN_EMAILS = new Set(['nafhan1723@gmail.com', 'nafhan.sh@gmail.com']);

export const isAdminUser = (email: string | null | undefined): boolean => {
  const lowerEmail = (email || '').toLowerCase().trim();
  return ADMIN_EMAILS.has(lowerEmail);
};

/**
 * Get plan limits
 */
export const getPlanLimits = (plan: string | null | undefined, isAdmin = false): number => {
  if (isAdmin) {
    return Infinity;
  }
  if (!plan || plan === 'free') {
    return 10; // FREE_PLAN_JOB_LIMIT
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
 * Uses API route to bypass CORS (since users authenticate with Firebase, not Supabase)
 */
export const ensureFreePlan = async (userId: string, userEmail?: string): Promise<void> => {
  try {
    const response = await fetch('/api/subscription/ensure-free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userEmail }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error ensuring free plan:', error);
    }
  } catch (error) {
    console.error('Error ensuring free plan:', error);
  }
};

export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatusResponse | null> => {
  try {
    const response = await fetch(`/api/subscription/status?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch subscription status');
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
};

export function getNextBillingDate(currentDate: Date, billingDay: number): Date {
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const lastDayOfMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0
  ).getDate();
  
  const day = Math.min(billingDay, lastDayOfMonth);
  nextMonth.setDate(day);
  
  return nextMonth;
}
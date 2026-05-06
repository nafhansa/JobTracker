import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 5,
};

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const resetAt = now + config.windowMs;

  try {
    const { data, error } = await (supabaseAdmin as any)
      .rpc('check_rate_limit', {
        p_identifier: identifier,
        p_max_requests: config.maxRequests,
        p_window_ms: config.windowMs,
      });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === '42883') {
        console.warn('rate_limits table or function not found. Run migration 028. Allowing request.');
      } else {
        console.error('Rate limit check error:', error);
      }
      return { allowed: true, remaining: config.maxRequests, resetAt };
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetAt: data.reset_at ? new Date(data.reset_at).getTime() : resetAt,
    };
  } catch (err) {
    console.error('Rate limit check failed:', err);
    return { allowed: true, remaining: config.maxRequests, resetAt };
  }
}

export function getRateLimitHeaders(remaining: number, resetAt: number) {
  return {
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toUTCString(),
  };
}

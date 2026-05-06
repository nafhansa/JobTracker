import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryFallback = new Map<string, MemoryEntry>();

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 5,
};

function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryFallback.get(identifier);

  if (!entry || now >= entry.resetAt) {
    memoryFallback.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count += 1;
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  if (entry.count > config.maxRequests * 2) {
    memoryFallback.delete(identifier);
  }

  return { allowed, remaining, resetAt: entry.resetAt };
}

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
        console.warn('rate_limits table or function not found. Run migration 028. Using memory fallback.');
      } else {
        console.error('Rate limit check error, using memory fallback:', error);
      }
      return checkMemoryRateLimit(identifier, config);
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetAt: data.reset_at ? new Date(data.reset_at).getTime() : resetAt,
    };
  } catch (err) {
    console.error('Rate limit check failed, using memory fallback:', err);
    return checkMemoryRateLimit(identifier, config);
  }
}

export function getRateLimitHeaders(maxRequests: number, remaining: number, resetAt: number) {
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toUTCString(),
  };
}

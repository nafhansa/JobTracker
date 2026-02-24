import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { LIFETIME_ACCESS_LIMIT } from '@/lib/pricing-config';

export async function GET() {
  try {
    const { data, error } = await (supabase
      .from('lifetime_access_purchases') as any)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching lifetime purchases count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lifetime purchases count' },
        { status: 500 }
      );
    }

    const count = data || 0;
    const remaining = Math.max(0, LIFETIME_ACCESS_LIMIT - count);
    const isAvailable = remaining > 0;

    return NextResponse.json({
      totalPurchased: count,
      limit: LIFETIME_ACCESS_LIMIT,
      remaining,
      isAvailable,
    });
  } catch (error) {
    console.error('Error in lifetime availability endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

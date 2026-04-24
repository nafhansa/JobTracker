import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await (supabase
      .from('lifetime_access_purchases') as any)
      .select('id, user_id, order_id, amount, currency, purchased_at', { count: 'exact' })
      .order('purchased_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching lifetime purchases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lifetime purchases' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in lifetime purchases endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

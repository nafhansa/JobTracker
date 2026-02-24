import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data, error } = await (supabase
      .from('lifetime_access_purchases') as any)
      .select('*')
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Error fetching lifetime purchases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lifetime purchases' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in lifetime purchases endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

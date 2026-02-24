import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Call the PostgreSQL function directly
    const { data, error } = await supabase.rpc('increment_daily_streak', { userId });

    if (error) {
      console.error("Error calling increment_daily_streak:", error);
      return NextResponse.json({ error: error.message || "Failed to increment streak" }, { status: 500 });
    }

    return NextResponse.json(data || {
      current: 0,
      best: 0,
    });
  } catch (error) {
    console.error("Error in increment streak API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

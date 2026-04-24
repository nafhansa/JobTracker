import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Call the PostgreSQL function directly
    const { data, error } = await (supabaseAdmin as any).rpc('increment_daily_streak', { userId });

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

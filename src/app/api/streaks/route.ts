import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('user_streaks')
      .select('current_streak, best_streak')
      .eq('user_id', userId);

    if (error && error.code !== 'PGRST116') {
      console.error("Error accessing user_streaks table:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        current: 0,
        best: 0,
      });
    }

    const streakRecord = (data as any[])[0];

    const currentStreak = streakRecord?.current_streak || 0;
    const bestStreak = streakRecord?.best_streak || 0;

    return NextResponse.json({
      current: currentStreak,
      best: bestStreak,
    });
  } catch (error) {
    console.error("Error in streaks API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
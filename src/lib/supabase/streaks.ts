import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserStreak {
  current: number;
  best: number;
}

export async function incrementDailyStreak(userId: string): Promise<void> {
  try {
    await fetch('/api/streaks/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type: 'daily' }),
    });
  } catch (error) {
    console.error("Failed to increment daily streak:", error);
  }
}

export async function getUserStreaks(userId: string): Promise<UserStreak> {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching streaks:", error);
      return {
        current: 0,
        best: 0,
      };
    }

    return {
      current: data?.current_streak || 0,
      best: data?.best_streak || 0,
    };
  } catch (error) {
    console.error("Error fetching streaks:", error);
    return {
      current: 0,
      best: 0,
    };
  }
}

import { supabase } from './client';

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
    const { data, error } = await (supabase
      .from('user_streaks') as any)
      .select('current_streak, best_streak')
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

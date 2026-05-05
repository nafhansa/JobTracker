import { supabaseAdmin } from "./server";
import { WEEKLY_COINS_BY_PLAN, COINS_PER_GENERATION, CoinsBalance } from "../ai/types";

export async function getOrCreateCoins(userId: string, plan?: string): Promise<CoinsBalance> {
  console.log('[getOrCreateCoins] called for user:', userId);

  let { data, error } = await (supabaseAdmin as any)
    .from("ai_coins")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    console.log('[getOrCreateCoins] no row found, creating new for user:', userId);
    const allocation = plan ? (WEEKLY_COINS_BY_PLAN[plan] ?? 240) : 240;
    const { data: newData, error: insertError } = await (supabaseAdmin as any)
      .from("ai_coins")
      .insert({
        user_id: userId,
        weekly_coins: allocation,
        purchased_coins: 0,
        weekly_coin_allocation: allocation,
        weekly_reset_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[getOrCreateCoins] insert error:', insertError);
      throw insertError;
    }
    data = newData;
  } else if (error) {
    console.error('[getOrCreateCoins] select error:', error);
    throw error;
  }

  if (!data) throw new Error("Failed to get coins");

  let needsReset = false;
  const now = new Date();
  const resetAt = new Date(data.weekly_reset_at);

  if (resetAt <= now) {
    needsReset = true;
    const weeksPassed = Math.max(Math.floor((now.getTime() - resetAt.getTime()) / (7 * 24 * 60 * 60 * 1000)), 1);
    const newAllocation = data.weekly_coin_allocation;

    const { data: updatedData, error: updateError } = await (supabaseAdmin as any)
      .from("ai_coins")
      .update({
        weekly_coins: newAllocation,
        weekly_reset_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    data = updatedData;

    await (supabaseAdmin as any).from("coin_transactions").insert({
      user_id: userId,
      amount: newAllocation,
      type: "weekly_reset",
      metadata: { weeks_passed: weeksPassed },
    });
  }

  const finalData = needsReset ? (await (supabaseAdmin as any).from("ai_coins").select("*").eq("user_id", userId).single()).data : data;

  if (!finalData) throw new Error("Failed to get coins after reset");

  return {
    weekly_coins: finalData.weekly_coins,
    purchased_coins: finalData.purchased_coins,
    total_coins: finalData.weekly_coins + finalData.purchased_coins,
    weekly_coin_allocation: finalData.weekly_coin_allocation,
    weekly_reset_at: finalData.weekly_reset_at,
  };
}

export async function deductCoins(userId: string, amount: number = COINS_PER_GENERATION): Promise<boolean> {
  const balance = await getOrCreateCoins(userId);

  if (balance.weekly_coins >= amount) {
    const { error } = await (supabaseAdmin as any)
      .from("ai_coins")
      .update({ weekly_coins: balance.weekly_coins - amount })
      .eq("user_id", userId);

    if (error) throw error;
  } else if (balance.total_coins >= amount) {
    const remaining = amount - balance.weekly_coins;
    const { error } = await (supabaseAdmin as any)
      .from("ai_coins")
      .update({
        weekly_coins: 0,
        purchased_coins: balance.purchased_coins - remaining,
      })
      .eq("user_id", userId);

    if (error) throw error;
  } else {
    return false;
  }

  await (supabaseAdmin as any).from("coin_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "usage",
  });

  return true;
}

export async function addPurchasedCoins(userId: string, amount: number, referenceId?: string): Promise<void> {
  console.log('[addPurchasedCoins] called:', { userId, amount, referenceId });

  const balance = await getOrCreateCoins(userId);
  console.log('[addPurchasedCoins] current balance:', { purchased_coins: balance.purchased_coins, weekly_coins: balance.weekly_coins, total_coins: balance.total_coins });

  const newPurchased = balance.purchased_coins + amount;
  console.log('[addPurchasedCoins] updating purchased_coins to:', newPurchased);

  const { data: updateData, error: updateError } = await (supabaseAdmin as any)
    .from("ai_coins")
    .update({ purchased_coins: newPurchased })
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error('[addPurchasedCoins] update error:', updateError);
    throw updateError;
  }
  console.log('[addPurchasedCoins] update result:', updateData);

  const { data: txData, error: txError } = await (supabaseAdmin as any).from("coin_transactions").insert({
    user_id: userId,
    amount,
    type: "purchase",
    reference_id: referenceId || null,
  }).select().single();

  if (txError) {
    console.error('[addPurchasedCoins] coin_transactions insert error:', txError);
    throw txError;
  }
  console.log('[addPurchasedCoins] transaction recorded:', txData);
}

export async function updateWeeklyCoinAllocation(userId: string, plan: string): Promise<void> {
  const allocation = WEEKLY_COINS_BY_PLAN[plan] ?? 240;

  const { error } = await (supabaseAdmin as any)
    .from("ai_coins")
    .update({ weekly_coin_allocation: allocation })
    .eq("user_id", userId);

  if (error) throw error;
}
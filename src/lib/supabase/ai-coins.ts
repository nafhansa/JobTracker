import { supabaseAdmin } from "./server";
import { WEEKLY_COINS_BY_PLAN, COINS_PER_GENERATION, CoinsBalance } from "../ai/types";

export async function getOrCreateCoins(userId: string, plan?: string): Promise<CoinsBalance> {
  console.log('[getOrCreateCoins] called for user:', userId);

  const allocation = plan ? (WEEKLY_COINS_BY_PLAN[plan] ?? 240) : 240;

  // Use atomic RPC that handles concurrent creation safely via INSERT ... ON CONFLICT
  const { data, error } = await (supabaseAdmin as any)
    .rpc("get_or_create_coins_atomic", {
      p_user_id: userId,
      p_plan: plan || "free",
    });

  if (error) {
    console.error('[getOrCreateCoins] RPC error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to get or create coins");
  }

  const row = data[0];

  let needsReset = false;
  const now = new Date();
  const resetAt = new Date(row.weekly_reset_at);

  if (resetAt <= now) {
    needsReset = true;
    const weeksPassed = Math.max(Math.floor((now.getTime() - resetAt.getTime()) / (7 * 24 * 60 * 60 * 1000)), 1);
    const currentAllocation = row.weekly_coin_allocation;

    const { data: updatedData, error: updateError } = await (supabaseAdmin as any)
      .from("ai_coins")
      .update({
        weekly_coins: currentAllocation,
        weekly_reset_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    row.weekly_coins = updatedData.weekly_coins;
    row.weekly_reset_at = updatedData.weekly_reset_at;

    await (supabaseAdmin as any).from("coin_transactions").insert({
      user_id: userId,
      amount: currentAllocation,
      type: "weekly_reset",
      metadata: { weeks_passed: weeksPassed },
    });
  }

  const finalData = needsReset
    ? (await (supabaseAdmin as any).from("ai_coins").select("*").eq("user_id", userId).single()).data
    : row;

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
  // Ensure row exists first (atomic RPC handles concurrent creation)
  await getOrCreateCoins(userId);

  // Fetch balance BEFORE deduction to accurately record metadata
  const balanceBefore = await getOrCreateCoins(userId);
  const weeklyBeforeDeduct = balanceBefore.weekly_coins;
  const purchasedBeforeDeduct = balanceBefore.purchased_coins;

  // Use atomic RPC with SELECT ... FOR UPDATE to prevent race conditions
  const { data: success, error } = await (supabaseAdmin as any)
    .rpc("deduct_coins_atomic", {
      p_user_id: userId,
      p_amount: amount,
    });

  if (error) throw error;

  if (!success) {
    return false;
  }

  // Determine deduction source from PRE-deduct balance
  let deductSource: string;
  if (weeklyBeforeDeduct >= amount) {
    deductSource = "weekly_only";
  } else if (weeklyBeforeDeduct > 0 && purchasedBeforeDeduct >= amount - weeklyBeforeDeduct) {
    deductSource = "mixed";
  } else {
    deductSource = "purchased_only";
  }

  // Record accurate metadata based on pre-deduct state
  const weeklyUsed = deductSource === "weekly_only" ? amount : deductSource === "mixed" ? weeklyBeforeDeduct : 0;

  await (supabaseAdmin as any).from("coin_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "usage",
    metadata: {
      deducted_from: deductSource,
      weekly_before: weeklyBeforeDeduct,
      purchased_before: purchasedBeforeDeduct,
      weekly_used: weeklyUsed,
      purchased_used: amount - weeklyUsed,
    },
  });

  return true;
}

export async function addPurchasedCoins(userId: string, amount: number, referenceId?: string): Promise<void> {
  console.log('[addPurchasedCoins] called:', { userId, amount, referenceId });

  const { data: balance, error: balanceError } = await (supabaseAdmin as any)
    .rpc("add_purchased_coins_atomic", {
      p_user_id: userId,
      p_amount: amount,
    });

  if (balanceError) {
    console.error('[addPurchasedCoins] atomic RPC error:', balanceError);
    throw balanceError;
  }

  console.log('[addPurchasedCoins] atomic update result:', balance);

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

  const balance = await getOrCreateCoins(userId);

  // If upgrading, immediately top up weekly_coins to the new allocation
  // (only if current weekly_coins is less than new allocation)
  const newWeeklyCoins = Math.max(balance.weekly_coins, allocation);

  const { error } = await (supabaseAdmin as any)
    .from("ai_coins")
    .update({
      weekly_coin_allocation: allocation,
      weekly_coins: newWeeklyCoins,
    })
    .eq("user_id", userId);

  if (error) throw error;
}
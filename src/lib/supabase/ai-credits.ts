import { supabaseAdmin } from "./server";
import { WEEKLY_CREDITS_BY_PLAN, CreditsBalance } from "../ai/types";

export async function getOrCreateCredits(userId: string, plan?: string): Promise<CreditsBalance> {
  let { data, error } = await (supabaseAdmin as any)
    .from("ai_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    const allocation = plan ? (WEEKLY_CREDITS_BY_PLAN[plan] ?? 1) : 1;
    const { data: newData, error: insertError } = await (supabaseAdmin as any)
      .from("ai_credits")
      .insert({
        user_id: userId,
        weekly_credits: allocation,
        purchased_credits: 0,
        weekly_allocation: allocation,
        weekly_reset_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    data = newData;
  } else if (error) {
    throw error;
  }

  if (!data) throw new Error("Failed to get credits");

  let needsReset = false;
  const now = new Date();
  const resetAt = new Date(data.weekly_reset_at);

  if (resetAt <= now) {
    needsReset = true;
    const weeksPassed = Math.max(Math.floor((now.getTime() - resetAt.getTime()) / (7 * 24 * 60 * 60 * 1000)), 1);
    const newAllocation = data.weekly_allocation;

    const { data: updatedData, error: updateError } = await (supabaseAdmin as any)
      .from("ai_credits")
      .update({
        weekly_credits: newAllocation,
        weekly_reset_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    data = updatedData;

    await (supabaseAdmin as any).from("credit_transactions").insert({
      user_id: userId,
      amount: newAllocation,
      type: "weekly_reset",
      metadata: { weeks_passed: weeksPassed },
    });
  }

  const finalData = needsReset ? (await (supabaseAdmin as any).from("ai_credits").select("*").eq("user_id", userId).single()).data : data;

  if (!finalData) throw new Error("Failed to get credits after reset");

  return {
    weekly_credits: finalData.weekly_credits,
    purchased_credits: finalData.purchased_credits,
    total_credits: finalData.weekly_credits + finalData.purchased_credits,
    weekly_allocation: finalData.weekly_allocation,
    weekly_reset_at: finalData.weekly_reset_at,
  };
}

export async function deductCredit(userId: string): Promise<boolean> {
  const balance = await getOrCreateCredits(userId);

  if (balance.weekly_credits > 0) {
    const { error } = await (supabaseAdmin as any)
      .from("ai_credits")
      .update({ weekly_credits: balance.weekly_credits - 1 })
      .eq("user_id", userId);

    if (error) throw error;
  } else if (balance.purchased_credits > 0) {
    const { error } = await (supabaseAdmin as any)
      .from("ai_credits")
      .update({ purchased_credits: balance.purchased_credits - 1 })
      .eq("user_id", userId);

    if (error) throw error;
  } else {
    return false;
  }

  await (supabaseAdmin as any).from("credit_transactions").insert({
    user_id: userId,
    amount: -1,
    type: "usage",
  });

  return true;
}

export async function addPurchasedCredits(userId: string, amount: number, referenceId?: string): Promise<void> {
  const balance = await getOrCreateCredits(userId);

  const { error } = await (supabaseAdmin as any)
    .from("ai_credits")
    .update({ purchased_credits: balance.purchased_credits + amount })
    .eq("user_id", userId);

  if (error) throw error;

  await (supabaseAdmin as any).from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "purchase",
    reference_id: referenceId || null,
  });
}

export async function updateWeeklyAllocation(userId: string, plan: string): Promise<void> {
  const allocation = WEEKLY_CREDITS_BY_PLAN[plan] ?? 1;

  const { error } = await (supabaseAdmin as any)
    .from("ai_credits")
    .update({ weekly_allocation: allocation })
    .eq("user_id", userId);

  if (error) throw error;
}
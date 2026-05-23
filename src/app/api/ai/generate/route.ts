import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getOrCreateCoins, deductCoins } from "@/lib/supabase/ai-coins";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { saveGeneratedDocument } from "@/lib/supabase/generated-docs";
import { generateContent } from "@/lib/ai/anthropic";
import { supabaseAdmin } from "@/lib/supabase/server";
import { GenerateRequest, GenerationType, COINS_PER_GENERATION, ApplicationStage, CompanyInfo, MessageIntent } from "@/lib/ai/types";
import { formatCompanyInfoForPrompt } from "@/lib/ai/company-extraction";
import { isAdminUser } from "@/lib/supabase/subscriptions";
import PQueue from "p-queue";

export const maxDuration = 60;

// Concurrency-controlled queue for Anthropic API calls
// Prevents hitting Anthropic rate limits (~50 req/min for Haiku)
// and avoids Vercel serverless timeout (60s max)
const aiQueue = new PQueue({
  concurrency: 10,
  timeout: 55000,
});

// Per-user cooldown to prevent spam (30 seconds between generations)
const userCooldowns = new Map<string, number>();
const USER_COOLDOWN_MS = 30_000;

// Cleanup expired cooldowns periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of userCooldowns.entries()) {
    if (now - timestamp > USER_COOLDOWN_MS * 2) {
      userCooldowns.delete(userId);
    }
  }
}, 60_000);

async function refundCoins(userId: string, amount: number, reason: string) {
  try {
    await (supabaseAdmin as any)
      .rpc("refund_coins_atomic", {
        p_user_id: userId,
        p_amount: amount,
      });
    console.log(`Coins refunded: ${amount} for user ${userId}, reason: ${reason}`);
  } catch (refundError) {
    console.error("Failed to refund coins:", refundError);
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const isAdmin = isAdminUser(authResult.email || "");

    const body: GenerateRequest = await req.json();
    const { type, targetName, targetCompany, targetRole, targetStage, jobId, channel, tone, format, customContext, language, companyInfo, intent } = body;

    const validTypes: GenerationType[] = ["cover_letter", "cold_email", "cold_dm_instagram", "cold_wa", "cold_linkedin"];
    const validStages: ApplicationStage[] = ["applied", "emailed", "responded", "interview", "offer", "rejected"];
    const validIntents: MessageIntent[] = ["opportunistic_reach", "follow_up", "quick_call", "interview_thank_you", "keep_warm"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
    }
    if (intent && !validIntents.includes(intent)) {
      return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
    }

    // Per-user rate limiting (cooldown)
    if (!isAdmin) {
      const lastCall = userCooldowns.get(authResult.userId);
      if (lastCall && Date.now() - lastCall < USER_COOLDOWN_MS) {
        const remaining = Math.ceil((USER_COOLDOWN_MS - (Date.now() - lastCall)) / 1000);
        return NextResponse.json({
          error: `Please wait ${remaining}s before generating again`,
        }, { status: 429 });
      }
    }

    // Deduct coins before queueing (prevents free usage)
    if (!isAdmin) {
      const coinsDeducted = await deductCoins(authResult.userId);
      if (!coinsDeducted) {
        const balance = await getOrCreateCoins(authResult.userId);
        return NextResponse.json({
          error: "Insufficient JPs",
          coins: balance,
        }, { status: 402 });
      }
    }

    let userProfileData;
    try {
      userProfileData = await getUserProfile(authResult.userId);
    } catch {
      userProfileData = null;
    }

    const userProfile = userProfileData
      ? {
          fullName: userProfileData.full_name || undefined,
          email: userProfileData.email || undefined,
          phone: userProfileData.phone || undefined,
          skills: userProfileData.skills || undefined,
          experience: userProfileData.experience || undefined,
          education: userProfileData.education || undefined,
          summary: userProfileData.summary || undefined,
        }
      : undefined;

    const target = (targetName || targetCompany || targetRole)
      ? { name: targetName, company: targetCompany, role: targetRole }
      : undefined;

    let companyInfoPrompt: string | undefined;
    if (companyInfo) {
      companyInfoPrompt = formatCompanyInfoForPrompt(companyInfo as CompanyInfo, type as GenerationType);
    }

    // Queue the AI generation call with concurrency control
    let content: string;
    try {
      content = await aiQueue.add(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000);

        try {
          return await generateContent({
            type,
            userProfile,
            target,
            targetStage: targetStage as ApplicationStage | undefined,
            channel,
            tone: tone || "professional",
            format: format || (type === "cover_letter" ? "full_letter" : undefined),
            customContext,
            language,
            companyInfoPrompt,
            intent: intent as MessageIntent | undefined,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }, { timeout: 55000 });
    } catch (aiError) {
      console.error("AI generation failed, refunding coins:", aiError);
      if (!isAdmin) {
        const refundReason = aiError instanceof Error && aiError.name === "TimeoutError"
          ? "queue_timeout"
          : "ai_generation_failed";
        await refundCoins(authResult.userId, COINS_PER_GENERATION, refundReason);
      }
      const errorMessage = aiError instanceof Error && aiError.name === "TimeoutError"
        ? "Generation timed out due to high demand. Your JPs have been refunded. Please try again."
        : "AI generation failed. Your JPs have been refunded.";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Set user cooldown after successful generation
    userCooldowns.set(authResult.userId, Date.now());

    const savedDoc = await saveGeneratedDocument({
      user_id: authResult.userId,
      job_id: jobId || null,
      type,
      target_name: targetName || null,
      target_company: targetCompany || null,
      target_role: targetRole || null,
      content,
      prompt_data: {
        tone: tone || "professional",
        format: format || (type === "cover_letter" ? "full_letter" : undefined),
        channel,
        customContext,
        hadProfile: !!userProfileData,
        intent: intent || null,
      },
      intent: intent || null,
    });

    const updatedBalance = await getOrCreateCoins(authResult.userId);

    return NextResponse.json({
      content,
      type,
      coins: updatedBalance,
      documentId: savedDoc.id,
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

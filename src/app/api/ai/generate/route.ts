import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getOrCreateCoins, deductCoins } from "@/lib/supabase/ai-coins";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { saveGeneratedDocument } from "@/lib/supabase/generated-docs";
import { generateContent } from "@/lib/ai/anthropic";
import { supabaseAdmin } from "@/lib/supabase/server";
import { GenerateRequest, GenerationType, COINS_PER_GENERATION, ApplicationStage } from "@/lib/ai/types";
import { isAdminUser } from "@/lib/supabase/subscriptions";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const isAdmin = isAdminUser(authResult.email || "");

    const body: GenerateRequest = await req.json();
    const { type, targetName, targetCompany, targetRole, targetStage, jobId, channel, tone, format, customContext, language } = body;

    const validTypes: GenerationType[] = ["cover_letter", "cold_email", "cold_dm_instagram", "cold_wa", "cold_linkedin"];
    const validStages: ApplicationStage[] = ["applied", "emailed", "responded", "interview", "offer", "rejected"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
    }

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

    let content: string;
    try {
      content = await generateContent({
        type,
        userProfile,
        target,
        targetStage: targetStage as ApplicationStage | undefined,
        channel,
        tone: tone || "professional",
        format: format || (type === "cover_letter" ? "full_letter" : undefined),
        customContext,
        language,
      });
    } catch (aiError) {
      console.error("AI generation failed, refunding coins:", aiError);
      if (!isAdmin) {
        try {
          const { data: coinData } = await (supabaseAdmin as any)
            .from("ai_coins")
            .select("weekly_coins, purchased_coins")
            .eq("user_id", authResult.userId)
            .single();

          if (coinData) {
            const currentWeekly = coinData.weekly_coins || 0;
            const currentPurchased = coinData.purchased_coins || 0;
            const weeklyBeforeDeduct = currentWeekly + COINS_PER_GENERATION;

            if (weeklyBeforeDeduct >= COINS_PER_GENERATION) {
              await (supabaseAdmin as any)
                .from("ai_coins")
                .update({ weekly_coins: weeklyBeforeDeduct })
                .eq("user_id", authResult.userId);
            } else {
              const purchasedBeforeDeduct = currentPurchased + (COINS_PER_GENERATION - weeklyBeforeDeduct);
              await (supabaseAdmin as any)
                .from("ai_coins")
                .update({
                  weekly_coins: Math.max(0, weeklyBeforeDeduct),
                  purchased_coins: purchasedBeforeDeduct,
                })
                .eq("user_id", authResult.userId);
            }
          }
        } catch (refundError) {
          console.error("Failed to refund coins:", refundError);
        }
      }
      return NextResponse.json({ error: "AI generation failed. Your JPs have been refunded." }, { status: 500 });
    }

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
      },
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
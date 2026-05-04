import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getOrCreateCredits, deductCredit } from "@/lib/supabase/ai-credits";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { saveGeneratedDocument } from "@/lib/supabase/generated-docs";
import { generateContent } from "@/lib/ai/anthropic";
import { supabaseAdmin } from "@/lib/supabase/server";
import { GenerateRequest, GenerationType } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body: GenerateRequest = await req.json();
    const { type, targetName, targetCompany, targetRole, jobId, channel, tone, format, customContext } = body;

    const validTypes: GenerationType[] = ["cover_letter", "cold_email", "cold_dm_instagram", "cold_wa", "cold_linkedin"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
    }

    const creditDeducted = await deductCredit(authResult.userId);
    if (!creditDeducted) {
      const balance = await getOrCreateCredits(authResult.userId);
      return NextResponse.json({
        error: "Insufficient credits",
        credits: balance,
      }, { status: 402 });
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
        channel,
        tone: tone || "professional",
        format: format || (type === "cover_letter" ? "full_letter" : undefined),
        customContext,
      });
    } catch (aiError) {
      console.error("AI generation failed, refunding credit:", aiError);
      try {
        const { data: creditData } = await (supabaseAdmin as any)
          .from("ai_credits")
          .select("weekly_credits, purchased_credits")
          .eq("user_id", authResult.userId)
          .single();

        if (creditData) {
          const wasWeekly = creditData.weekly_credits >= 0;
          if (wasWeekly) {
            await (supabaseAdmin as any)
              .from("ai_credits")
              .update({ weekly_credits: creditData.weekly_credits + 1 })
              .eq("user_id", authResult.userId);
          } else {
            await (supabaseAdmin as any)
              .from("ai_credits")
              .update({ purchased_credits: creditData.purchased_credits + 1 })
              .eq("user_id", authResult.userId);
          }
        }
      } catch (refundError) {
        console.error("Failed to refund credit:", refundError);
      }
      return NextResponse.json({ error: "AI generation failed. Your credit has been refunded." }, { status: 500 });
    }

    await saveGeneratedDocument({
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

    const updatedBalance = await getOrCreateCredits(authResult.userId);

    return NextResponse.json({
      content,
      type,
      credits: updatedBalance,
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
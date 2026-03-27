import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data: userData, error: userError } = await (supabaseAdmin as any)
      .from("users")
      .select("onboarding_completed, language")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({
        completed: false,
        language: "id",
        data: null,
      });
    }

    if (!userData.onboarding_completed) {
      return NextResponse.json({
        completed: false,
        language: userData.language || "id",
        data: null,
      });
    }

    const { data: onboardingData, error: onboardingError } = await (supabaseAdmin as any)
      .from("user_onboarding")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (onboardingError) {
      console.error("Error fetching onboarding:", onboardingError);
    }

    return NextResponse.json({
      completed: true,
      language: userData.language || "id",
      data: onboardingData || null,
    });
  } catch (error) {
    console.error("Error in onboarding GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      language,
      jobSearchStage,
      targetRoles,
      workPreferences,
      experienceLevel,
    } = body;

    if (!userId || !jobSearchStage || !experienceLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error: userUpdateError } = await (supabaseAdmin as any)
      .from("users")
      .update({
        language: language || "id",
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userUpdateError) {
      console.error("Error updating user:", userUpdateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    const { error: onboardingError } = await (supabaseAdmin as any)
      .from("user_onboarding")
      .upsert({
        id: userId,
        user_id: userId,
        job_search_stage: jobSearchStage,
        target_roles: targetRoles || [],
        work_preferences: workPreferences || [],
        experience_level: experienceLevel,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (onboardingError) {
      console.error("Error saving onboarding:", onboardingError);
      return NextResponse.json(
        { error: "Failed to save onboarding" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("Error in onboarding POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
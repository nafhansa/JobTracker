import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getUserProfile, upsertUserProfile } from "@/lib/supabase/user-profile";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const profile = await getUserProfile(authResult.userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { full_name, email, phone, linkedin_url, skills, experience, education, summary } = body;

    const profile = await upsertUserProfile({
      user_id: authResult.userId,
      full_name,
      email,
      phone,
      linkedin_url,
      skills,
      experience,
      education,
      summary,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
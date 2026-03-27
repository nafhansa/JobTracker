import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, language } = body;

    if (!userId || !language) {
      return NextResponse.json(
        { error: "Missing required fields: userId, language" },
        { status: 400 }
      );
    }

    if (!["id", "en"].includes(language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'id' or 'en'" },
        { status: 400 }
      );
    }

    const { error } = await (supabaseAdmin as any)
      .from("users")
      .update({
        language,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating language:", error);
      return NextResponse.json(
        { error: "Failed to update language" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      language,
    });
  } catch (error) {
    console.error("Error in language PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
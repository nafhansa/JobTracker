import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: userData } = await (supabaseAdmin as any)
      .from("users")
      .select("id, subscription_plan")
      .eq("id", userId)
      .single();

    if (!userData) {
      await (supabaseAdmin as any)
        .from("users")
        .insert({
          id: userId,
          email: userEmail || null,
          subscription_plan: "free",
          subscription_status: "active",
          is_pro: false,
        });
    } else {
      if (!userData.subscription_plan) {
        await (supabaseAdmin as any)
          .from("users")
          .update({
            subscription_plan: "free",
            subscription_status: "active",
            is_pro: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in ensure-free API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

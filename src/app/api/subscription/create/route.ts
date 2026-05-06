import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 });
    }

    const { data: subscriptionData, error: subError } = await (supabaseAdmin as any)
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (subError) throw subError;

    const { error: userError } = await (supabaseAdmin as any)
      .from("users")
      .upsert(
        {
          id: userId,
          subscription_plan: plan,
          subscription_status: "active",
          is_pro: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (userError) throw userError;

    return NextResponse.json({ success: true, data: subscriptionData });
  } catch (error) {
    console.error("Error in create subscription API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

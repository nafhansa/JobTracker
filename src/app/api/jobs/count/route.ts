import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { count, error } = await (supabaseAdmin as any)
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authResult.userId);

    if (error) {
      return NextResponse.json({ error: "Failed to get job count" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error in job count API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

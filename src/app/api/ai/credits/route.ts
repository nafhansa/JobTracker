import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getOrCreateCredits } from "@/lib/supabase/ai-credits";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const balance = await getOrCreateCredits(authResult.userId);
    return NextResponse.json({ credits: balance });
  } catch (error) {
    console.error("Error getting credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
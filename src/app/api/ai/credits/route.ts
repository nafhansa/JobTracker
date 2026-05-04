import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getOrCreateCoins } from "@/lib/supabase/ai-coins";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const balance = await getOrCreateCoins(authResult.userId);
    return NextResponse.json({ coins: balance });
  } catch (error) {
    console.error("Error getting coins:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Delete job via API route (bypasses RLS using service role)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    const { error } = await (supabaseAdmin
      .from('jobs') as any)
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error("Error deleting job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

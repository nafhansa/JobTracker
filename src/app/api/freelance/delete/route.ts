import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required field: jobId" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('freelance_jobs' as any)
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error("Error deleting freelance job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete freelance job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete freelance job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
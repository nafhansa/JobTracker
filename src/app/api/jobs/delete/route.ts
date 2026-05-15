import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerPostHog } from "@/lib/posthog/server";

/**
 * Delete job via API route (bypasses RLS using service role)
 */
export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    // Ownership check: verify job belongs to authenticated user
    const { data: existingJob } = await (supabaseAdmin as any)
      .from('jobs')
      .select('user_id')
      .eq('id', jobId)
      .single();

    if (!existingJob || existingJob.user_id !== authResult.userId) {
      return NextResponse.json(
        { error: "Job not found or access denied" },
        { status: 403 }
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

    getServerPostHog().capture({
      distinctId: authResult.userId,
      event: 'job_deleted',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

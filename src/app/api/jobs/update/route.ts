import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Update job via API route (bypasses RLS using service role)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, data } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields if provided
    if (data.jobTitle) updateData.job_title = data.jobTitle;
    if (data.company) updateData.company = data.company;
    if (data.industry) updateData.industry = data.industry;
    if (data.recruiterEmail !== undefined) updateData.recruiter_email = data.recruiterEmail || null;
    if (data.applicationUrl !== undefined) updateData.application_url = data.applicationUrl || null;
    if (data.jobType !== undefined) updateData.job_type = data.jobType || null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.potentialSalary !== undefined) updateData.potential_salary = data.potentialSalary || null;
    if (data.currency) updateData.currency = data.currency;

    // Map status object
    if (data.status) {
      if (data.status.applied !== undefined) updateData.status_applied = data.status.applied;
      if (data.status.emailed !== undefined) updateData.status_emailed = data.status.emailed;
      if (data.status.cvResponded !== undefined) updateData.status_cv_responded = data.status.cvResponded;
      if (data.status.interviewEmail !== undefined) updateData.status_interview_email = data.status.interviewEmail;
      if (data.status.contractEmail !== undefined) updateData.status_contract_email = data.status.contractEmail;
      if (data.status.rejected !== undefined) updateData.status_rejected = data.status.rejected;
    }

    const { error } = await (supabaseAdmin
      .from('jobs') as any)
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      console.error("Error updating job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

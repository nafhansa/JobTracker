import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JobApplication, JobStatus } from "@/types";

const JOB_COLUMNS = "id,user_id,job_title,company,industry,recruiter_email,application_url,job_type,location,potential_salary,potential_salary_min,potential_salary_max,salary_type,currency,status_applied,status_emailed,status_cv_responded,status_interview_email,status_contract_email,status_rejected,created_at,updated_at";

function transformJobRow(row: Record<string, unknown>): JobApplication {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    jobTitle: row.job_title as string,
    company: row.company as string,
    industry: row.industry as string,
    recruiterEmail: (row.recruiter_email as string) || undefined,
    applicationUrl: (row.application_url as string) || undefined,
    jobType: (row.job_type as string) || undefined,
    location: (row.location as string) || undefined,
    potentialSalary: (row.potential_salary as number) || undefined,
    potentialSalaryMin: (row.potential_salary_min as number) || undefined,
    potentialSalaryMax: (row.potential_salary_max as number) || undefined,
    salaryType: (row.salary_type as "exact" | "range" | "unspecified" | undefined) || undefined,
    currency: (row.currency as string) || "IDR",
    status: {
      applied: (row.status_applied as boolean) || false,
      emailed: (row.status_emailed as boolean) || false,
      cvResponded: (row.status_cv_responded as boolean) || false,
      interviewEmail: (row.status_interview_email as boolean) || false,
      contractEmail: (row.status_contract_email as boolean) || false,
      rejected: (row.status_rejected as boolean) || false,
    } as JobStatus,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const cursor = url.searchParams.get("cursor");

    let query = (supabaseAdmin as any)
      .from("jobs")
      .select(JOB_COLUMNS)
      .eq("user_id", authResult.userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    const jobs: JobApplication[] = (data || []).map(transformJobRow);
    const nextCursor = jobs.length === limit ? jobs[jobs.length - 1].createdAt : null;

    return NextResponse.json({ jobs, nextCursor, hasMore: jobs.length === limit });
  } catch (error) {
    console.error("Error in jobs list API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
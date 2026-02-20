import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JobApplication } from "@/types";

/**
 * Add job via API route (bypasses RLS using service role)
 * This is needed because users authenticate with Firebase, not Supabase Auth
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jobTitle, company, industry, recruiterEmail, applicationUrl, jobType, location, potentialSalary, currency, status } = body;

    if (!userId || !jobTitle || !company) {
      return NextResponse.json(
        { error: "Missing required fields: userId, jobTitle, company" },
        { status: 400 }
      );
    }

    // Generate Firebase-like ID
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const jobId = generateId();

    const { data, error } = await (supabaseAdmin
      .from('jobs') as any)
      .insert({
        id: jobId,
        user_id: userId,
        job_title: jobTitle,
        company: company,
        industry: industry || company,
        recruiter_email: recruiterEmail || null,
        application_url: applicationUrl || null,
        job_type: jobType || null,
        location: location || null,
        potential_salary: potentialSalary || null,
        currency: currency || 'IDR',
        status_applied: status?.applied || false,
        status_emailed: status?.emailed || false,
        status_cv_responded: status?.cvResponded || false,
        status_interview_email: status?.interviewEmail || false,
        status_contract_email: status?.contractEmail || false,
        status_rejected: status?.rejected || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in add job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

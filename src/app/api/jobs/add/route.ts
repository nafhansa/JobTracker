import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Add job via API route (bypasses RLS using service role)
 * This is needed because users authenticate with Firebase, not Supabase Auth
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received job data:", body); // Debug log
    
    const { userId, jobTitle, company, industry, recruiterEmail, applicationUrl, jobType, location, potentialSalary, potentialSalaryMin, potentialSalaryMax, salaryType, currency, status } = body;

    // Debug: Check what we received
    if (!userId || !jobTitle || !company) {
      console.error("Missing fields:", { 
        hasUserId: !!userId, 
        hasJobTitle: !!jobTitle, 
        hasCompany: !!company, 
        bodyKeys: Object.keys(body),
        body 
      });
      return NextResponse.json(
        { 
          error: "Missing required fields: userId, jobTitle, company", 
          received: body,
          missing: {
            userId: !userId,
            jobTitle: !jobTitle,
            company: !company
          }
        },
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
        potential_salary_min: potentialSalaryMin || null,
        potential_salary_max: potentialSalaryMax || null,
        salary_type: salaryType || 'exact',
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

    // Increment daily streak after successfully adding job (atomic via RPC)
    try {
      const { error: streakRpcError } = await (supabaseAdmin as any).rpc('increment_daily_streak', {
        p_user_id: userId,
        p_current_date: new Date().toISOString().split('T')[0],
      });

      if (streakRpcError) {
        console.error("Failed to increment streak via RPC:", streakRpcError);

        // Fallback: try the API endpoint
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/streaks/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
        } catch (fallbackError) {
          console.error("Fallback streak increment also failed:", fallbackError);
        }
      }
    } catch (streakError) {
      console.error("Failed to increment streak:", streakError);
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

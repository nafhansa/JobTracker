import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdminUser, checkIsPro, getSubscriptionStatus } from "@/lib/supabase/subscriptions";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

/**
 * Add job via API route (bypasses RLS using service role)
 * This is needed because users authenticate with Firebase, not Supabase Auth
 */
export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    console.log("Received job data:", body);
    
    const { jobTitle, company, industry, recruiterEmail, applicationUrl, jobType, location, potentialSalary, potentialSalaryMin, potentialSalaryMax, salaryType, currency, status } = body;

    // Use authenticated userId, ignore body.userId
    const userId = authResult.userId;

    // Debug: Check what we received
    if (!jobTitle || !company) {
      console.error("Missing fields:", { 
        hasJobTitle: !!jobTitle, 
        hasCompany: !!company, 
        bodyKeys: Object.keys(body),
        body 
      });
      return NextResponse.json(
        { 
          error: "Missing required fields: jobTitle, company", 
          received: body,
          missing: {
            jobTitle: !jobTitle,
            company: !company
          }
        },
        { status: 400 }
      );
    }

    // Validate salary range
    if (salaryType === 'range' && potentialSalaryMin != null && potentialSalaryMax != null) {
      if (Number(potentialSalaryMin) > Number(potentialSalaryMax)) {
        return NextResponse.json(
          { error: "Minimum salary cannot exceed maximum salary" },
          { status: 400 }
        );
      }
    }

    // Check free plan limit (server-side enforcement)
    const isAdmin = isAdminUser(authResult.email);
    let isPro = false;
    
    try {
      const subStatus = await getSubscriptionStatus(userId);
      if (subStatus) {
        isPro = subStatus.isPro;
      }
    } catch {
      // If subscription check fails, default to free plan
    }

    if (!isPro && !isAdmin) {
      const { count } = await (supabaseAdmin as any)
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if ((count || 0) >= FREE_PLAN_JOB_LIMIT) {
        return NextResponse.json(
          { error: `Free plan limit reached (${FREE_PLAN_JOB_LIMIT} jobs). Upgrade to add more.` },
          { status: 403 }
        );
      }
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

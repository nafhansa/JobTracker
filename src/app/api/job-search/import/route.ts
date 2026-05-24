import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerPostHog } from "@/lib/posthog/server";
import { isAdminUser } from "@/lib/supabase/subscriptions";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;
    const body = await req.json();

    if (!body.title || !body.company) {
      return NextResponse.json({ error: "title and company are required" }, { status: 400 });
    }

    const isAdmin = isAdminUser(authResult.email);
    let isPro = false;

    try {
      const { data: subData } = await (supabaseAdmin as any)
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subData && (subData.status === "active" || subData.status === "trialing")) {
        isPro = subData.plan === "monthly" || subData.plan === "lifetime";
      }
    } catch {}

    if (!isPro && !isAdmin) {
      const { count } = await (supabaseAdmin as any)
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if ((count || 0) >= FREE_PLAN_JOB_LIMIT) {
        return NextResponse.json(
          { error: `Free plan limit reached (${FREE_PLAN_JOB_LIMIT} jobs). Upgrade to add more.` },
          { status: 403 }
        );
      }
    }

    const generateId = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 20; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };

    const jobId = generateId();

    const salaryType = body.min_amount && body.max_amount && body.min_amount !== body.max_amount
      ? "range"
      : body.min_amount ? "exact" : "unspecified";

    const { data, error } = await (supabaseAdmin as any)
      .from("jobs")
      .insert({
        id: jobId,
        user_id: userId,
        job_title: body.title,
        company: body.company,
        industry: body.company,
        application_url: body.job_url_direct || body.job_url || null,
        job_type: body.job_type || null,
        location: body.location || (body.is_remote ? "Remote" : [body.city, body.state, body.country].filter(Boolean).join(", ") || null),
        potential_salary: body.min_amount || null,
        potential_salary_min: body.min_amount || null,
        potential_salary_max: body.max_amount || null,
        salary_type: salaryType,
        currency: body.currency || "USD",
        status_applied: false,
        status_emailed: false,
        status_cv_responded: false,
        status_interview_email: false,
        status_contract_email: false,
        status_rejected: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error importing job:", error);
      return NextResponse.json({ error: "Failed to import job" }, { status: 500 });
    }

    try {
      await (supabaseAdmin as any).rpc("increment_daily_streak", {
        p_user_id: userId,
        p_current_date: new Date().toISOString().split("T")[0],
      });
    } catch (streakError) {
      console.error("Failed to increment streak:", streakError);
    }

    getServerPostHog().capture({
      distinctId: userId,
      event: "job_search_imported",
      properties: { source: "job_search", site: body.site || "unknown" },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in import job API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
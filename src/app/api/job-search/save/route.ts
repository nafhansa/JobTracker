import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerPostHog } from "@/lib/posthog/server";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;
    const body = await req.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from("saved_jobs")
      .insert({
        user_id: userId,
        title: body.title,
        company: body.company || null,
        location: body.location || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        job_url: body.job_url || null,
        job_url_direct: body.job_url_direct || null,
        description: body.description || null,
        job_type: body.job_type || null,
        is_remote: Boolean(body.is_remote),
        min_amount: body.min_amount ?? null,
        max_amount: body.max_amount ?? null,
        currency: body.currency || "USD",
        salary_source: body.salary_source || null,
        salary_interval: body.salary_interval || null,
        date_posted: body.date_posted || null,
        site: body.site || null,
        company_url: body.company_url || null,
        company_industry: body.company_industry || null,
        company_logo: body.company_logo || null,
        source_data: body.source_data || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving job:", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "Job already saved" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
    }

    getServerPostHog().capture({
      distinctId: userId,
      event: "job_search_bookmarked",
      properties: { site: body.site, title: body.title },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in save job API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await (supabaseAdmin as any)
      .from("saved_jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting saved job:", error);
      return NextResponse.json({ error: "Failed to delete saved job" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete saved job API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
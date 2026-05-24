import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";

const JOBSPY_SERVICE_URL = process.env.JOBSPY_SERVICE_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();

    if (!body.search_term || typeof body.search_term !== "string" || body.search_term.trim().length === 0) {
      return NextResponse.json({ error: "search_term is required" }, { status: 400 });
    }

    if (!body.site_name || !Array.isArray(body.site_name) || body.site_name.length === 0) {
      return NextResponse.json({ error: "site_name must be a non-empty array" }, { status: 400 });
    }

    const validSites = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google", "bayt", "bdjobs", "naukri"];
    for (const site of body.site_name) {
      if (!validSites.includes(site)) {
        return NextResponse.json({ error: `Invalid site: ${site}` }, { status: 400 });
      }
    }

    const payload: Record<string, unknown> = {
      site_name: body.site_name,
      search_term: body.search_term.trim(),
      results_wanted: Math.min(Math.max(Number(body.results_wanted) || 15, 1), 100),
      distance: Math.min(Math.max(Number(body.distance) || 25, 1), 500),
      is_remote: Boolean(body.is_remote),
      enforce_annual_salary: Boolean(body.enforce_annual_salary),
      description_format: body.description_format === "html" ? "html" : "markdown",
      linkedin_fetch_description: Boolean(body.linkedin_fetch_description),
      offset: Math.max(Number(body.offset) || 0, 0),
    };

    if (body.google_search_term) payload.google_search_term = String(body.google_search_term);
    if (body.location) payload.location = String(body.location);
    if (body.job_type) payload.job_type = String(body.job_type);
    if (body.hours_old && Number(body.hours_old) > 0) payload.hours_old = Number(body.hours_old);
    if (body.country_indeed) payload.country_indeed = String(body.country_indeed);

    const response = await fetch(`${JOBSPY_SERVICE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("JobSpy service error:", response.status, errorText);
      return NextResponse.json(
        { error: "Job search service error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in job search API:", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Job search timed out. Try reducing results or sites." }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
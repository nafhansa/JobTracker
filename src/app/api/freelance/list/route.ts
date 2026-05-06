import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { FreelanceJob, FreelanceJobStatus } from "@/types";

const FREELANCE_JOB_COLUMNS = "id,user_id,client_name,client_contact,service_type,product,potential_price,actual_price,currency,start_date,end_date,duration_days,status,created_at,updated_at";

function transformFreelanceJobRow(row: Record<string, unknown>): FreelanceJob {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    clientName: row.client_name as string,
    clientContact: (row.client_contact as string) || '',
    serviceType: row.service_type as string,
    product: row.product as string,
    potentialPrice: (row.potential_price as number) || 0,
    actualPrice: (row.actual_price as number) || undefined,
    currency: (row.currency as string) || 'IDR',
    startDate: (row.start_date as string) || undefined,
    endDate: (row.end_date as string) || undefined,
    durationDays: (row.duration_days as number) || undefined,
    status: row.status as FreelanceJobStatus,
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
      .from("freelance_jobs")
      .select(FREELANCE_JOB_COLUMNS)
      .eq("user_id", authResult.userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching freelance jobs:", error);
      return NextResponse.json({ error: "Failed to fetch freelance jobs" }, { status: 500 });
    }

    const jobs: FreelanceJob[] = (data || []).map(transformFreelanceJobRow);
    const nextCursor = jobs.length === limit ? jobs[jobs.length - 1].createdAt : null;

    return NextResponse.json({ jobs, nextCursor, hasMore: jobs.length === limit });
  } catch (error) {
    console.error("Error in freelance jobs list API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

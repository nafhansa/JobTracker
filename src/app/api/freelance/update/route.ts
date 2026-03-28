import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, data } = body;

    if (!jobId || !data) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, data" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    
    if (data.clientName !== undefined) updateData.client_name = data.clientName;
    if (data.clientContact !== undefined) updateData.client_contact = data.clientContact;
    if (data.serviceType !== undefined) updateData.service_type = data.serviceType;
    if (data.product !== undefined) updateData.product = data.product;
    if (data.potentialPrice !== undefined) updateData.potential_price = data.potentialPrice;
    if (data.actualPrice !== undefined) updateData.actual_price = data.actualPrice;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;
    if (data.durationDays !== undefined) updateData.duration_days = data.durationDays;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await (supabaseAdmin as any)
      .from('freelance_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      console.error("Error updating freelance job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update freelance job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update freelance job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
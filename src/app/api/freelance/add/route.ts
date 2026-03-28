import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { FreelanceJob } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { userId, clientName, clientContact, serviceType, product, potentialPrice, actualPrice, currency, startDate, endDate, durationDays, status } = body;

    if (!userId || !clientName || !serviceType || !product) {
      return NextResponse.json(
        { error: "Missing required fields: userId, clientName, serviceType, product" },
        { status: 400 }
      );
    }

    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const jobId = generateId();

    const { data, error } = await (supabaseAdmin as any)
      .from('freelance_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        client_name: clientName,
        client_contact: clientContact || null,
        service_type: serviceType,
        product: product,
        potential_price: potentialPrice || null,
        actual_price: actualPrice || null,
        currency: currency || 'IDR',
        start_date: startDate || null,
        end_date: endDate || null,
        duration_days: durationDays || null,
        status: status || 'ongoing',
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding freelance job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add freelance job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in add freelance job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
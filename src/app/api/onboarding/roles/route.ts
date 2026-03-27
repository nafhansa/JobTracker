import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);

    let supabaseQuery = (supabaseAdmin as any)
      .from("job_roles")
      .select("id, name, name_id, category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (category) {
      supabaseQuery = supabaseQuery.eq("category", category);
    }

    if (query && query.length >= 1) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,name_id.ilike.%${query}%`);
    }

    supabaseQuery = supabaseQuery.limit(limit);

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error("Error fetching job roles:", error);
      return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }

    return NextResponse.json({
      roles: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("Error in roles GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
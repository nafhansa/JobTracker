import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, value, sessionId, page } = body;

    if (!type || !["pricing_click", "scroll_depth", "time_on_page", "cta_click"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid micro-conversion type" },
        { status: 400 }
      );
    }

    const timestamp = new Date();

    interface MicroConversionData {
      type: string;
      timestamp: Date;
      page: string;
      sessionId?: string;
      value?: number;
    }
    const eventData: MicroConversionData = {
      type,
      timestamp,
      page: page || "home",
    };

    if (sessionId) eventData.sessionId = sessionId;
    if (value !== undefined) eventData.value = value;

    // Write to Supabase (primary)
    try {
      await supabaseAdmin.from('analytics_micro_conversions').insert({
        type,
        value: value || null,
        session_id: sessionId || null,
        page: page || "home",
      } as any);
    } catch (supabaseError) {
      console.error("Supabase micro-conversion error (non-fatal):", supabaseError);
    }

    // Fallback: Also write to Firebase (dual-write during migration)
    try {
      const eventsRef = adminDb.collection("analytics_micro_conversions");
      await eventsRef.add(eventData);
    } catch (firebaseError) {
      console.error("Firebase micro-conversion error (non-fatal):", firebaseError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { message?: string };
    console.error("Error tracking micro-conversion:", error);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

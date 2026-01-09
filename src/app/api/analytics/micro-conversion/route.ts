import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

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

    const eventData: any = {
      type,
      timestamp,
      page: page || "home",
    };

    if (sessionId) eventData.sessionId = sessionId;
    if (value !== undefined) eventData.value = value;

    // Store in micro_conversions collection
    const eventsRef = adminDb.collection("analytics_micro_conversions");
    await eventsRef.add(eventData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking micro-conversion:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

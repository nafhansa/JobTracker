import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, rating, message } = body;

    if (!userId || !type || !message || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, rating, message" },
        { status: 400 }
      );
    }

    const validTypes = ["general", "bug", "feature"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabaseAdmin
      .from("feedback") as any)
      .insert({
        user_id: userId,
        type,
        rating,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting feedback:", error);
      return NextResponse.json(
        { error: error.message || "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in feedback API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
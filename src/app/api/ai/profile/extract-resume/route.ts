import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { extractResumeData } from "@/lib/ai/anthropic";
import { saveResumeExtraction } from "@/lib/supabase/user-profile";

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const VALID_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    if (!VALID_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Supported: PNG, JPEG, WebP, PDF." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    let extractedData;
    try {
      extractedData = await extractResumeData({
        fileBuffer: buffer,
        mimeType: file.type,
        signal: controller.signal,
      });
    } catch (extractError) {
      console.error("Resume extraction failed:", extractError);
      return NextResponse.json({ error: "Failed to extract resume data. Please try again or fill in your profile manually." }, { status: 500 });
    } finally {
      clearTimeout(timeoutId);
    }

    try {
      await saveResumeExtraction(authResult.userId, extractedData as Record<string, unknown>);

      const { getUserProfile } = await import("@/lib/supabase/user-profile");
      const updatedProfile = await getUserProfile(authResult.userId);

      return NextResponse.json({
        extracted: extractedData,
        profile: updatedProfile,
      });
    } catch (saveError) {
      console.error("Failed to save extracted data:", saveError);
      return NextResponse.json({
        extracted: extractedData,
        warning: "Extracted data could not be saved. Please save your profile manually.",
      });
    }
  } catch (error) {
    console.error("Error in resume extraction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

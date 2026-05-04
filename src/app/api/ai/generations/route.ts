import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getGeneratedDocuments, updateGeneratedDocument } from "@/lib/supabase/generated-docs";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const documents = await getGeneratedDocuments(authResult.userId, limit);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error getting generations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { id, content } = body;

    if (!id || typeof id !== "string" || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing id or content" }, { status: 400 });
    }

    let updated;
    try {
      updated = await updateGeneratedDocument(authResult.userId, id, content);
    } catch (dbError: any) {
      console.error("[PATCH generations] DB error:", dbError?.message || dbError);
      return NextResponse.json({ error: "Failed to save: " + (dbError?.message || "unknown error") }, { status: 500 });
    }
    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("Error updating generation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    const { deleteGeneratedDocument } = await import("@/lib/supabase/generated-docs");
    await deleteGeneratedDocument(authResult.userId, docId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting generation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
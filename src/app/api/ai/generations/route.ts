import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getGeneratedDocuments } from "@/lib/supabase/generated-docs";

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
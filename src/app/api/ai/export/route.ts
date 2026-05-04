import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { generateDocx, generatePdf, getExportFilename } from "@/lib/ai/export";
import { GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { content, type, format, targetCompany, targetRole, targetName } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (!type || !GENERATION_TYPE_LABELS[type as GenerationType]) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!["docx", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Use 'docx' or 'pdf'" }, { status: 400 });
    }

    const filename = getExportFilename(type as GenerationType, format, targetCompany);

    if (format === "docx") {
      const buffer = await generateDocx({
        content,
        type: type as GenerationType,
        targetCompany,
        targetRole,
        targetName,
      });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      const buffer = await generatePdf({
        content,
        type: type as GenerationType,
        targetCompany,
        targetRole,
        targetName,
      });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error in export API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
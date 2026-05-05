import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { scrapeCompanyWebsite, extractCompanyInfoFromMarkdown, isValidUrl, normalizeUrl } from "@/lib/ai/company-extraction";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    let markdown: string;
    try {
      markdown = await scrapeCompanyWebsite(normalizedUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to scrape website";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    let companyInfo;
    try {
      companyInfo = await extractCompanyInfoFromMarkdown(markdown, normalizedUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract company info";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ companyInfo });
  } catch (error) {
    console.error("Error in company-info API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
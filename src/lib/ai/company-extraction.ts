import Anthropic from "@anthropic-ai/sdk";
import { GenerationType } from "./types";

export interface CompanyInfo {
  description: string;
  mission: string | null;
  values: string[];
  products: string[];
  culture: string | null;
  recentNews: string[];
  industry: string | null;
  companySize: string | null;
  headquarters: string | null;
}

export const EMPTY_COMPANY_INFO: CompanyInfo = {
  description: "",
  mission: null,
  values: [],
  products: [],
  culture: null,
  recentNews: [],
  industry: null,
  companySize: null,
  headquarters: null,
};

const EXTRACTION_SYSTEM_PROMPT = `You are an expert at analyzing company websites and extracting structured business information. Extract the following details from the provided website content and return them as a JSON object with exactly these fields:

- description: A clear 2-3 sentence description of what the company does
- mission: The company's mission statement or purpose (null if not found)
- values: Array of core values or principles mentioned (empty array if not found)
- products: Array of key products or services offered (empty array if not found)
- culture: Brief description of company culture or work environment (null if not found)
- recentNews: Array of any recent news, announcements, or milestones mentioned (empty array if none found)
- industry: The industry the company operates in (null if unclear)
- companySize: Company size indication like "startup", "mid-size", "enterprise", or employee count (null if not found)
- headquarters: Company headquarters location (null if not found)

IMPORTANT:
- Only include information you are confident about from the content
- Use null for fields where no relevant information is found
- Use empty arrays for fields where no items are found
- Return ONLY valid JSON, no markdown, no explanation, no code fences`;

export async function extractCompanyInfoFromMarkdown(
  markdown: string,
  url: string
): Promise<CompanyInfo> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Extract company information from the following website content scraped from ${url}:\n\n${markdown.slice(0, 12000)}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in extraction response");
  }

  try {
    const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      description: parsed.description || "",
      mission: parsed.mission || null,
      values: Array.isArray(parsed.values) ? parsed.values : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      culture: parsed.culture || null,
      recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews : [],
      industry: parsed.industry || null,
      companySize: parsed.companySize || null,
      headquarters: parsed.headquarters || null,
    };
  } catch {
    throw new Error("Failed to parse company extraction result");
  }
}

export function formatCompanyInfoForPrompt(info: CompanyInfo, type: GenerationType): string {
  const parts: string[] = [];

  if (info.description) {
    parts.push(`Company Description: ${info.description}`);
  }
  if (info.mission) {
    parts.push(`Mission: ${info.mission}`);
  }
  if (info.values?.length) {
    parts.push(`Values: ${info.values.join(", ")}`);
  }
  if (info.products?.length) {
    parts.push(`Products/Services: ${info.products.join(", ")}`);
  }
  if (info.culture) {
    parts.push(`Culture: ${info.culture}`);
  }
  if (info.recentNews?.length) {
    parts.push(`Recent News: ${info.recentNews.join("; ")}`);
  }
  if (info.industry) {
    parts.push(`Industry: ${info.industry}`);
  }
  if (info.companySize) {
    parts.push(`Company Size: ${info.companySize}`);
  }
  if (info.headquarters) {
    parts.push(`Headquarters: ${info.headquarters}`);
  }

  if (parts.length === 0) return "";

  const label = type === "cover_letter" ? "COMPANY WEBSITE INTELLIGENCE" : "TARGET COMPANY INTELLIGENCE";
  return `${label} (extracted from their website — use this to make your message more specific and compelling):\n${parts.join("\n")}`;
}

export async function scrapeCompanyWebsite(url: string): Promise<string> {
  const encodedUrl = encodeURIComponent(url);
  const jinaUrl = `https://r.jina.ai/${encodedUrl}`;

  const headers: Record<string, string> = {
    Accept: "text/markdown",
  };

  if (process.env.JINA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const response = await fetch(jinaUrl, { headers, signal: AbortSignal.timeout(30000) });

  if (!response.ok) {
    throw new Error(`Failed to scrape website: ${response.status} ${response.statusText}`);
  }

  const markdown = await response.text();

  if (!markdown || markdown.length < 50) {
    throw new Error("Scraped content is too short or empty");
  }

  return markdown;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}
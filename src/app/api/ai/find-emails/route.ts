import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import Anthropic from "@anthropic-ai/sdk";

interface EmailResult {
  name: string;
  email: string;
  role: string;
  linkedinUrl: string;
  confidence: number;
  source: string;
  verificationStatus?: string;
}

interface FindEmailsRequest {
  companyName: string;
  companyUrl?: string;
  linkedinUrl?: string;
  roleType: "hr" | "founder" | "both";
}

const HR_KEYWORDS = [
  "HR", "Human Resources", "Recruiter", "Talent Acquisition",
  "People Operations", "People Ops", "HRBP", "HR Manager",
  "Head of People", "VP of People", "Chief People Officer",
  "Recruiting", "Talent", "Hiring"
];

const FOUNDER_KEYWORDS = [
  "Founder", "Co-Founder", "CEO", "Chief Executive",
  "Managing Director", "President", "Owner", "Director",
  "Head of", "VP", "Vice President"
];

const EMAIL_PATTERNS = [
  "{first}.{last}",
  "{first}{last}",
  "{f}{last}",
  "{first}.{l}",
  "{first}",
  "{first}{l}",
  "{f}.{last}"
];

function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const first = firstName.toLowerCase();
  const last = lastName.toLowerCase();
  const f = first.charAt(0);
  const l = last.charAt(0);

  return EMAIL_PATTERNS.map(pattern =>
    pattern
      .replace("{first}", first)
      .replace("{last}", last)
      .replace("{f}", f)
      .replace("{l}", l) + "@" + domain
  );
}

function extractDomainFromUrl(url: string): string {
  try {
    let normalized = url;
    if (!normalized.startsWith("http")) {
      normalized = "https://" + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
  }
}

function extractDomainFromCompanyName(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned + ".com";
}

async function verifyEmailWithHunter(email: string): Promise<{ status: string; score: number } | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      status: data.data?.status || "unknown",
      score: data.data?.score || 0,
    };
  } catch {
    return null;
  }
}

async function tryHunterIo(domain: string, _roleType: string): Promise<EmailResult[]> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=100&api_key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) return [];

    const data = await response.json();
    const results: EmailResult[] = [];

    if (data.data?.emails) {
      for (const emailData of data.data.emails) {
        const position = emailData.position || "";
        const firstName = emailData.first_name || "";
        const lastName = emailData.last_name || "";
        const name = firstName && lastName ? `${firstName} ${lastName}`.trim() : (emailData.value || "Unknown");

        results.push({
          name,
          email: emailData.value,
          role: position,
          linkedinUrl: emailData.linkedin_url || emailData.linkedin || "",
          confidence: emailData.confidence || 50,
          source: "hunter",
          verificationStatus: emailData.verification?.status || "unknown",
        });
      }
    }

    return results;
  } catch (err) {
    console.error("Hunter.io domain-search error:", err);
    return [];
  }
}

async function _tryHunterEmailFinder(domain: string, firstName: string, lastName: string): Promise<EmailResult | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.data?.email) return null;

    return {
      name: `${data.data.first_name || ""} ${data.data.last_name || ""}`.trim(),
      email: data.data.email,
      role: data.data.position || "Unknown",
      linkedinUrl: data.data.linkedin_url || "",
      confidence: data.data.score || 50,
      source: "hunter-email-finder",
      verificationStatus: data.data.verification?.status || "unknown",
    };
  } catch {
    return null;
  }
}

async function trySerpApiAndClaude(companyName: string, roleType: string): Promise<EmailResult[]> {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) return [];

  try {
    const keywords = roleType === "hr" ? "HR OR Recruiter" :
                     roleType === "founder" ? "Founder OR CEO" :
                     "HR OR Founder OR CEO";

    const serpUrl = `https://serpapi.com/search.json?q=site:linkedin.com/in+"${encodeURIComponent(companyName)}"+${encodeURIComponent(keywords)}&num=10&api_key=${serpApiKey}`;
    const response = await fetch(serpUrl, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) return [];

    const data = await response.json();
    const results: EmailResult[] = [];

    if (data.organic_results) {
      for (const result of data.organic_results.slice(0, 10)) {
        const linkedinMatch = result.link?.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/);
        if (linkedinMatch) {
          const profileId = linkedinMatch[1];
          const name = profileId.replace(/[-_]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

          results.push({
            name: result.snippet?.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)?.[0] || name,
            email: "",
            role: result.snippet || "Unknown",
            linkedinUrl: `https://www.linkedin.com/in/${profileId}`,
            confidence: 30,
            source: "serpapi"
          });
        }
      }
    }

    if (results.length > 0) {
      const domain = extractDomainFromCompanyName(companyName);
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: `You are an email finder assistant. Given a list of LinkedIn profiles, extract names and roles, then generate the most likely email addresses using common patterns (first.last@domain.com, firstlast@domain.com, etc.). Return ONLY valid JSON array with objects containing: name, email, role, linkedinUrl, confidence (0-100), source. Domain: ${domain}`,
        messages: [
          {
            role: "user",
            content: `Find emails for these people at ${companyName}:\n${JSON.stringify(results.map(r => ({ name: r.name, role: r.role, linkedin: r.linkedinUrl })))}`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (textBlock?.text) {
        try {
          const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            return parsed.map((item: unknown) => {
              const obj = item as Record<string, unknown>;
              return {
                name: (obj.name as string) || "",
                email: (obj.email as string) || "",
                role: (obj.role as string) || "Unknown",
                linkedinUrl: (obj.linkedinUrl as string) || "",
                confidence: (obj.confidence as number) || 30,
                source: "serpapi+claude"
              } as EmailResult;
            });
          }
        } catch {
          // Claude response parsing failed, return serpapi results
        }
      }
    }

    return results;
  } catch (err) {
    console.error("SerpAPI+Claude error:", err);
    return [];
  }
}

async function tryPatternGuessing(companyName: string, companyUrl?: string): Promise<EmailResult[]> {
  const domain = companyUrl ? extractDomainFromUrl(companyUrl) : extractDomainFromCompanyName(companyName);

  const commonNames = [
    { first: "hr", last: "team", role: "HR Team" },
    { first: "recruiting", last: "team", role: "Recruiting Team" },
    { first: "talent", last: "acquisition", role: "Talent Acquisition" },
    { first: "people", last: "ops", role: "People Operations" },
    { first: "careers", last: "team", role: "Careers Team" },
    { first: "founder", last: "team", role: "Founder" },
    { first: "ceo", last: "office", role: "CEO Office" },
    { first: "hello", last: "team", role: "General Contact" },
    { first: "contact", last: "us", role: "Contact" },
    { first: "info", last: "team", role: "General Info" },
  ];

  const results: EmailResult[] = [];

  for (const name of commonNames) {
    const emails = generateEmailPatterns(name.first, name.last, domain);
    results.push({
      name: name.role,
      email: emails[0],
      role: name.role,
      linkedinUrl: "",
      confidence: 20,
      source: "pattern_guessing"
    });
  }

  return results;
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body: FindEmailsRequest = await req.json();
    const { companyName, companyUrl, roleType } = body;

    if (!companyName || typeof companyName !== "string") {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const validRoleTypes = ["hr", "founder", "both"];
    if (!roleType || !validRoleTypes.includes(roleType)) {
      return NextResponse.json({ error: "Invalid role type. Must be: hr, founder, or both" }, { status: 400 });
    }

    const domain = companyUrl ? extractDomainFromUrl(companyUrl) : extractDomainFromCompanyName(companyName);

    // Strategy 1: Hunter.io domain-search (gets all emails for the domain)
    let results = await tryHunterIo(domain, roleType);

    // Strategy 2: SerpAPI + Claude (if no results from Hunter)
    if (results.length === 0) {
      const serpResults = await trySerpApiAndClaude(companyName, roleType);
      results.push(...serpResults);
    }

    // Strategy 3: Pattern guessing (always available fallback)
    if (results.length === 0) {
      const patternResults = await tryPatternGuessing(companyName, companyUrl);
      results.push(...patternResults);
    }

    // Filter by role type keywords
    const keywords = roleType === "hr" ? HR_KEYWORDS :
                     roleType === "founder" ? FOUNDER_KEYWORDS :
                     [...HR_KEYWORDS, ...FOUNDER_KEYWORDS];

    const filteredResults = results.filter(r => {
      const roleLower = (r.role || "").toLowerCase();
      const nameLower = (r.name || "").toLowerCase();
      return keywords.some(kw => roleLower.includes(kw.toLowerCase()) || nameLower.includes(kw.toLowerCase()));
    });

    // Verify emails with Hunter.io (if API key exists)
    const verifiedResults = await Promise.all(
      filteredResults.map(async (r) => {
        if (r.email && r.source !== "hunter" && process.env.HUNTER_API_KEY) {
          const verification = await verifyEmailWithHunter(r.email);
          if (verification) {
            return {
              ...r,
              verificationStatus: verification.status,
              confidence: verification.score,
            };
          }
        }
        return r;
      })
    );

    // Remove duplicates by email
    const seen = new Set<string>();
    const uniqueResults = verifiedResults.filter(r => {
      if (!r.email || seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });

    // Sort by confidence
    uniqueResults.sort((a, b) => b.confidence - a.confidence);

    const usedStrategy = results.length > 0 && results[0].source.startsWith("hunter") ? "hunter" :
                         results.length > 0 && results[0].source.includes("serpapi") ? "serpapi+claude" :
                         "pattern_guessing";

    return NextResponse.json({
      emails: uniqueResults,
      company: companyName,
      domain: domain,
      strategy: usedStrategy,
      count: uniqueResults.length
    });

  } catch (error) {
    console.error("Error in find-emails API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

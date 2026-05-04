import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { GenerationType, ToneType, ColdChannel, GenerationFormat, OutputLanguage } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 2048;
const COVER_LETTER_MAX_TOKENS = 1024;

interface GenerateContentParams {
  type: GenerationType;
  userProfile?: {
    fullName?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: Array<{ company: string; role: string; duration: string; description: string }>;
    education?: Array<{ institution: string; degree: string; field: string; year: string }>;
    summary?: string;
  };
  target?: {
    name?: string;
    company?: string;
    role?: string;
    recruiterName?: string;
  };
  channel?: ColdChannel;
  tone?: ToneType;
  format?: GenerationFormat;
  customContext?: string;
  language?: OutputLanguage;
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const { language } = params;
  const systemPrompt = buildSystemPrompt(params.type, language);
  const userPrompt = buildUserPrompt(params);

  const maxTokens = params.type === "cover_letter" ? COVER_LETTER_MAX_TOKENS : MAX_TOKENS;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in response");
  }

  return textBlock.text;
}

interface ExtractResumeParams {
  fileBuffer: Buffer;
  mimeType: string;
}

export interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
}

export async function extractResumeData(
  params: ExtractResumeParams
): Promise<ExtractedResumeData> {
  const { fileBuffer, mimeType } = params;

  const mediaType = mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are an expert resume parser. Extract all information from the provided resume document and return it as a JSON object with the following structure. Be thorough and accurate:

{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "linkedinUrl": "string or null",
  "summary": "string professional summary or null",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string (e.g. Jan 2022 - Present)",
      "description": "string brief description of achievements"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "year": "string"
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanation.`,
    messages: [
      {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType,
              data: fileBuffer.toString("base64"),
            },
          },
          {
            type: "text" as const,
            text: "Extract all information from this resume and return as JSON.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in response");
  }

  try {
    const cleanedText = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Failed to parse resume extraction result");
  }
}
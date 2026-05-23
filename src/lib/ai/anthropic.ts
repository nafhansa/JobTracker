import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { GenerationType, ToneType, ColdChannel, GenerationFormat, OutputLanguage, ApplicationStage, MessageIntent } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
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
  targetStage?: ApplicationStage;
  channel?: ColdChannel;
  tone?: ToneType;
  format?: GenerationFormat;
  customContext?: string;
  language?: OutputLanguage;
  companyInfoPrompt?: string;
  intent?: MessageIntent;
  signal?: AbortSignal;
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const systemPrompt = buildSystemPrompt(params.type, params.language, params.targetStage, params.intent);
  const userPrompt = buildUserPrompt(params);

  const maxTokens = params.type === "cover_letter" ? COVER_LETTER_MAX_TOKENS : MAX_TOKENS;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  }, { signal: params.signal });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in response");
  }

  return textBlock.text;
}

interface ExtractResumeParams {
  fileBuffer: Buffer;
  mimeType: string;
  signal?: AbortSignal;
}

interface ExtractResumeTextParams {
  resumeText: string;
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

const RESUME_SYSTEM_PROMPT = `You are an expert resume parser. Extract all information from the provided resume and return it as a JSON object with the following structure. Be thorough and accurate:

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

Return ONLY valid JSON, no markdown, no explanation.`;

export async function extractResumeData(
  params: ExtractResumeParams
): Promise<ExtractedResumeData> {
  const { fileBuffer, mimeType, signal } = params;

  const isPdf = mimeType === "application/pdf";
  const base64Data = fileBuffer.toString("base64");

  const fileContent = isPdf
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64Data,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
          data: base64Data,
        },
      };

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: RESUME_SYSTEM_PROMPT,
    messages: [
      {
        role: "user" as const,
        content: [
          fileContent,
          {
            type: "text" as const,
            text: "Extract all information from this resume and return as JSON.",
          },
        ],
      },
    ],
  }, { signal });

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

export async function extractResumeFromText(
  params: ExtractResumeTextParams
): Promise<ExtractedResumeData> {
  const { resumeText } = params;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: RESUME_SYSTEM_PROMPT,
    messages: [
      {
        role: "user" as const,
        content: `Here is the resume text to extract information from:\n\n${resumeText}`,
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
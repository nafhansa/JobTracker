import { GenerationType, ToneType, ColdChannel, GenerationFormat, OutputLanguage, ApplicationStage } from "./types";

const LANGUAGE_INSTRUCTIONS: Record<OutputLanguage, string> = {
  en: "Write the entire output in English.",
  id: "Write the entire output in Bahasa Indonesia (Indonesian). Use formal Indonesian for professional/formal tones, and casual Indonesian for casual/friendly tones.",
};

const STAGE_CONTEXT: Record<ApplicationStage, string> = {
  applied: "The user has applied but has received no response yet. This is initial outreach — make a strong first impression and express genuine enthusiasm for the role and company.",
  emailed: "The user has already sent an email to this company. This could be a follow-up email or a new angle of approach — acknowledge any prior contact if appropriate, and add new value rather than repeating previous messages.",
  responded: "The company has responded to the user's application. Build on this existing conversation — reference the response positively, reinforce the user's fit, and move the conversation forward toward next steps.",
  interview: "The user has an interview scheduled or recently completed one. Write something that reinforces their candidacy — express continued interest, reference the interview discussion, or follow up with additional context that strengthens their case.",
  offer: "The user has received a job offer. Write a professional message for offer negotiation, acceptance, or asking clarifying questions about terms. Be positive but strategic.",
  rejected: "The user was rejected for this position. Write a graceful, professional follow-up message — thank them for the opportunity, ask for constructive feedback, and keep the door open for future opportunities. Be humble, not desperate.",
};

export function buildSystemPrompt(type: GenerationType, language?: OutputLanguage, targetStage?: ApplicationStage): string {
  const langInstruction = language ? LANGUAGE_INSTRUCTIONS[language] : "";

  const basePrompt = `You are an expert professional writer specializing in career outreach and cover letters. You write compelling, personalized content that helps job seekers stand out. Your writing should be:
* Authentic and genuine, never generic or templated
* Tailored to the specific context, company, and role
* Concise but impactful
* Free of cliches and overused phrases
* Professional yet approachable

${langInstruction}

IMPORTANT: Do NOT use em dashes (the long dash character). Use commas, periods, or rephrase instead. For example, do NOT write "I am writing to you - a leader in..." Instead use "I am writing to you, a leader in..." or "I am writing to you because you are a leader in..." Always write in the same language as the user's input context. If the job/target details suggest a specific region, adapt the tone and language accordingly.

${targetStage ? `APPLICATION STAGE CONTEXT: The user's job application is at the "${targetStage}" stage. ${STAGE_CONTEXT[targetStage]}` : ""}`;

  switch (type) {
    case "cover_letter":
      return `${basePrompt}

You are writing a ONE-PAGE cover letter. This is critical: the entire letter MUST fit on a single page (250-300 words maximum). The page has a header with the letter title, so you have LESS space than a full page. Be extremely concise and impactful. Every word must earn its place.

Include:
* Today's date at the top
* Sender's ACTUAL name, email, and phone from the SENDER PROFILE (do NOT invent or guess contact details; use exactly what is provided)
* Recipient's name and company
* A formal salutation
* 3 short, compelling paragraphs (opening hook, key experience/fit, call to action) — MAXIMUM 2-3 sentences each
* Professional closing (Sincerely, Best regards, etc.)
* Sender name

IMPORTANT: Use the sender's real email and phone number from the profile. Do NOT use placeholder text like "+62 (your phone number)" or fake email addresses.

The letter should be personalized, specific, and demonstrate genuine interest in the role and company. Avoid generic phrases like "I am writing to apply for". Instead, start with a compelling hook.

Keep every paragraph to 2-3 sentences maximum. Do NOT exceed one page. Do NOT exceed 300 words.`;

    case "cold_email":
      return `${basePrompt}

You are writing a cold outreach email. Guidelines:
* Subject line: Short, intriguing, personalized (not clickbait)
* Keep it concise (150-250 words max)
* Lead with value proposition or shared connection
* Include a clear, low-commitment call to action
* No formal letter formatting. This is a direct email.
* Make it feel like it was written specifically for this person
* Avoid salesy language or desperate tones`;

    case "cold_dm_instagram":
      return `${basePrompt}

You are writing a cold Instagram DM. Guidelines:
* Maximum 300 characters for the main message (Instagram DMs should be punchy)
* Start with a genuine, specific compliment or shared interest
* Be authentic and conversational
* One clear ask or call to action
* NO formal letter formatting
* NO subject line
* Use natural, human language. This is a casual platform.
* Can use 1-2 relevant emojis if it fits the tone, but don't overdo it`;

    case "cold_wa":
      return `${basePrompt}

You are writing a cold WhatsApp message. Guidelines:
* Short and direct (100-200 words max)
* Start with a warm, personalized greeting
* Get to the point quickly
* End with a clear, simple question or call to action
* NO formal letter formatting
* NO subject line
* Conversational but professional
* Acknowledge that this is an unexpected message briefly
* Keep it friendly and approachable`;

    case "cold_linkedin":
      return `${basePrompt}

You are writing a cold LinkedIn message. Guidelines:
* Connection note style: concise and compelling
* If writing a longer message: still keep it under 300 words
* Reference something specific about their work, company, or shared interests
* Lead with curiosity, not a pitch
* Clear, low-pressure call to action
* NO formal letter formatting
* NO subject line
* Professional but warm tone
* Make it feel like you did your research (because you should have)`;

    default:
      return basePrompt;
  }
}

interface BuildUserPromptParams {
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
}

export function buildUserPrompt(params: BuildUserPromptParams): string {
  const { type, userProfile, target, tone, format, customContext, language, companyInfoPrompt, targetStage } = params;

  const senderInfo = userProfile
    ? `SENDER PROFILE:
* Name: ${userProfile.fullName || "Not provided"}
* Email: ${userProfile.email || "Not provided"}
* Phone: ${userProfile.phone || "Not provided"}
* Skills: ${userProfile.skills?.join(", ") || "Not provided"}
* Summary: ${userProfile.summary || "Not provided"}
* Experience: ${userProfile.experience?.map((e) => `${e.role} at ${e.company} (${e.duration}). ${e.description}`).join("\n") || "Not provided"}
* Education: ${userProfile.education?.map((e) => `${e.degree} in ${e.field} from ${e.institution} (${e.year})`).join("\n") || "Not provided"}`
    : "";

  const targetInfo = target
    ? `TARGET:
* Recipient Name: ${target.recruiterName || target.name || "Not provided"}
* Company: ${target.company || "Not provided"}
* Role: ${target.role || "Not provided"}${targetStage ? `\n* Application Stage: ${targetStage} — ${STAGE_CONTEXT[targetStage]}` : ""}`
    : "";

  const toneInstruction = tone ? `TONE: ${tone}` : "TONE: professional";
  const formatInstruction = type === "cover_letter" && format ? `FORMAT: ${format}` : "";

  switch (type) {
    case "cover_letter":
      return `Please write a cover letter with the following details:

${senderInfo}

${targetInfo}

${companyInfoPrompt || ""}
${toneInstruction}
${formatInstruction}
${language ? `LANGUAGE: ${LANGUAGE_INSTRUCTIONS[language]}` : ""}
${customContext ? `ADDITIONAL CONTEXT: ${customContext}` : ""}

IMPORTANT: Do NOT use em dashes. Use commas, periods, or rephrase instead.

Write the complete cover letter now.`;

    case "cold_email":
    case "cold_dm_instagram":
    case "cold_wa":
    case "cold_linkedin":
      return `Please write a ${type === "cold_email" ? "cold outreach email" : type === "cold_dm_instagram" ? "cold Instagram DM" : type === "cold_wa" ? "cold WhatsApp message" : "cold LinkedIn message"} with the following details:

${senderInfo}

${targetInfo}

${companyInfoPrompt || ""}
${toneInstruction}
${language ? `LANGUAGE: ${LANGUAGE_INSTRUCTIONS[language]}` : ""}
${customContext ? `ADDITIONAL CONTEXT: ${customContext}` : ""}

IMPORTANT: Do NOT use em dashes. Use commas, periods, or rephrase instead.

Write the message now.`;

    default:
      return `Write a professional outreach message.`;
  }
}
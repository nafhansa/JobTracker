import { GenerationType, ToneType, ColdChannel, GenerationFormat } from "./types";

export function buildSystemPrompt(type: GenerationType): string {
  const basePrompt = `You are an expert professional writer specializing in career outreach and cover letters. You write compelling, personalized content that helps job seekers stand out. Your writing should be:
- Authentic and genuine, never generic or templated
- Tailored to the specific context, company, and role
- Concise but impactful
- Free of clichés and overused phrases
- Professional yet approachable

Always write in the same language as the user's input context. If the job/target details suggest a specific region, adapt the tone and language accordingly.`;

  switch (type) {
    case "cover_letter":
      return `${basePrompt}\n\nYou are writing a FULL cover letter. Include:
- Today's date at the top
- Sender's name and contact info
- Recipient's name and company
- A formal salutation
- 3-4 compelling paragraphs (opening hook, relevant experience, value proposition, call to action)
- Professional closing (Sincerely, Best regards, etc.)
- Sender name

The letter should be personalized, specific, and demonstrate genuine interest in the role and company. Avoid generic phrases like "I am writing to apply for" - instead, start with a compelling hook.`;

    case "cold_email":
      return `${basePrompt}\n\nYou are writing a cold outreach email. Guidelines:
- Subject line: Short, intriguing, personalized (not clickbait)
- Keep it concise (150-250 words max)
- Lead with value proposition or shared connection
- Include a clear, low-commitment call to action
- No formal letter formatting - this is a direct email
- Make it feel like it was written specifically for this person
- Avoid salesy language or desperate tones`;

    case "cold_dm_instagram":
      return `${basePrompt}\n\nYou are writing a cold Instagram DM. Guidelines:
- Maximum 300 characters for the main message (Instagram DMs should be punchy)
- Start with a genuine, specific compliment or shared interest
- Be authentic and conversational
- One clear ask or call to action
- NO formal letter formatting
- NO subject line
- Use natural, human language - this is a casual platform
- Can use 1-2 relevant emojis if it fits the tone, but don't overdo it`;

    case "cold_wa":
      return `${basePrompt}\n\nYou are writing a cold WhatsApp message. Guidelines:
- Short and direct (100-200 words max)
- Start with a warm, personalized greeting
- Get to the point quickly
- End with a clear, simple question or call to action
- NO formal letter formatting
- NO subject line
- Conversational but professional
- Acknowledge that this is an unexpected message briefly
- Keep it friendly and approachable`;

    case "cold_linkedin":
      return `${basePrompt}\n\nYou are writing a cold LinkedIn message. Guidelines:
- Connection note style: concise and compelling
- If writing a longer message: still keep it under 300 words
- Reference something specific about their work, company, or shared interests
- Lead with curiosity, not a pitch
- Clear, low-pressure call to action
- NO formal letter formatting
- NO subject line
- Professional but warm tone
- Make it feel like you did your research (because you should have)`;

    default:
      return basePrompt;
  }
}

interface BuildUserPromptParams {
  type: GenerationType;
  userProfile?: {
    fullName?: string;
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
}

export function buildUserPrompt(params: BuildUserPromptParams): string {
  const { type, userProfile, target, tone, format, customContext } = params;

  const senderInfo = userProfile
    ? `SENDER PROFILE:
- Name: ${userProfile.fullName || "Not provided"}
- Skills: ${userProfile.skills?.join(", ") || "Not provided"}
- Summary: ${userProfile.summary || "Not provided"}
- Experience: ${userProfile.experience?.map((e) => `${e.role} at ${e.company} (${e.duration}) - ${e.description}`).join("\n") || "Not provided"}
- Education: ${userProfile.education?.map((e) => `${e.degree} in ${e.field} from ${e.institution} (${e.year})`).join("\n") || "Not provided"}`
    : "";

  const targetInfo = target
    ? `TARGET:
- Recipient Name: ${target.recruiterName || target.name || "Not provided"}
- Company: ${target.company || "Not provided"}
- Role: ${target.role || "Not provided"}`
    : "";

  const toneInstruction = tone ? `TONE: ${tone}` : "TONE: professional";
  const formatInstruction = type === "cover_letter" && format ? `FORMAT: ${format}` : "";

  switch (type) {
    case "cover_letter":
      return `Please write a cover letter with the following details:

${senderInfo}

${targetInfo}

${toneInstruction}
${formatInstruction}
${customContext ? `ADDITIONAL CONTEXT: ${customContext}` : ""}

Write the complete cover letter now.`;

    case "cold_email":
    case "cold_dm_instagram":
    case "cold_wa":
    case "cold_linkedin":
      return `Please write a ${type === "cold_email" ? "cold outreach email" : type === "cold_dm_instagram" ? "cold Instagram DM" : type === "cold_wa" ? "cold WhatsApp message" : "cold LinkedIn message"} with the following details:

${senderInfo}

${targetInfo}

${toneInstruction}
${customContext ? `ADDITIONAL CONTEXT: ${customContext}` : ""}

Write the message now.`;

    default:
      return `Write a professional outreach message.`;
  }
}
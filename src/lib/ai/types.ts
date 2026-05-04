export type GenerationType =
  | "cover_letter"
  | "cold_email"
  | "cold_dm_instagram"
  | "cold_wa"
  | "cold_linkedin";

export type ColdChannel = "email" | "instagram" | "whatsapp" | "linkedin";

export type ToneType = "formal" | "casual" | "friendly" | "professional";

export type GenerationFormat = "full_letter" | "body_only";

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  skills?: string[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  summary?: string | null;
  resume_url?: string | null;
  extracted_resume_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface AiCredits {
  id?: string;
  user_id: string;
  weekly_credits: number;
  purchased_credits: number;
  weekly_allocation: number;
  weekly_reset_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_idr: number;
  price_usd: number;
  is_active: boolean;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "usage" | "weekly_reset" | "admin_adjust";
  reference_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface GeneratedDocument {
  id: string;
  user_id: string;
  job_id?: string | null;
  type: GenerationType;
  target_name?: string | null;
  target_company?: string | null;
  target_role?: string | null;
  content: string;
  prompt_data?: Record<string, unknown>;
  created_at: string;
}

export interface GenerateRequest {
  type: GenerationType;
  targetName?: string;
  targetCompany?: string;
  targetRole?: string;
  jobId?: string;
  channel?: ColdChannel;
  tone?: ToneType;
  format?: GenerationFormat;
  customContext?: string;
}

export interface CreditsBalance {
  weekly_credits: number;
  purchased_credits: number;
  total_credits: number;
  weekly_allocation: number;
  weekly_reset_at: string;
}

export const WEEKLY_CREDITS_BY_PLAN: Record<string, number> = {
  free: 1,
  monthly: 5,
  lifetime: 10,
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", name: "Starter", credits: 5, price_idr: 9900, price_usd: 0.99, is_active: true },
  { id: "popular", name: "Popular", credits: 15, price_idr: 24900, price_usd: 2.49, is_active: true },
  { id: "best-value", name: "Best Value", credits: 50, price_idr: 64900, price_usd: 5.99, is_active: true },
];

export const GENERATION_TYPE_LABELS: Record<GenerationType, string> = {
  cover_letter: "Cover Letter",
  cold_email: "Cold Email",
  cold_dm_instagram: "Cold DM (Instagram)",
  cold_wa: "Cold Message (WhatsApp)",
  cold_linkedin: "Cold Message (LinkedIn)",
};

export const CHANNEL_OPTIONS: { value: ColdChannel; label: string; type: GenerationType }[] = [
  { value: "email", label: "Email", type: "cold_email" },
  { value: "linkedin", label: "LinkedIn", type: "cold_linkedin" },
  { value: "instagram", label: "Instagram DM", type: "cold_dm_instagram" },
  { value: "whatsapp", label: "WhatsApp", type: "cold_wa" },
];

export const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
];
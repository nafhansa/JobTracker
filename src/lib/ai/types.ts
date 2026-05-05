export type GenerationType =
  | "cover_letter"
  | "cold_email"
  | "cold_dm_instagram"
  | "cold_wa"
  | "cold_linkedin";

export type ColdChannel = "email" | "instagram" | "whatsapp" | "linkedin";

export type ToneType = "formal" | "casual" | "friendly" | "professional";

export type GenerationFormat = "full_letter" | "body_only";

export type OutputLanguage = "en" | "id";

export const LANGUAGE_OPTIONS: { value: OutputLanguage; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

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

export interface AiCoins {
  id?: string;
  user_id: string;
  weekly_coins: number;
  purchased_coins: number;
  weekly_coin_allocation: number;
  weekly_reset_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  label: string;
  coins: number;
  price_idr: number;
  is_active: boolean;
  description: string;
}

export interface CoinTransaction {
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

export type ApplicationStage = "applied" | "emailed" | "responded" | "interview" | "offer" | "rejected";

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: "Applied",
  emailed: "Emailed",
  responded: "Responded",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export interface GenerateRequest {
  type: GenerationType;
  targetName?: string;
  targetCompany?: string;
  targetRole?: string;
  targetStage?: ApplicationStage;
  jobId?: string;
  channel?: ColdChannel;
  tone?: ToneType;
  format?: GenerationFormat;
  customContext?: string;
  language?: OutputLanguage;
}

export interface CoinsBalance {
  weekly_coins: number;
  purchased_coins: number;
  total_coins: number;
  weekly_coin_allocation: number;
  weekly_reset_at: string;
}

export const COINS_PER_GENERATION = 80;

export const WEEKLY_COINS_BY_PLAN: Record<string, number> = {
  free: 240,
  monthly: 400,
  lifetime: 400,
};

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: "jalur-doa",
    name: "Jalur Doa",
    label: "Jalur Doa",
    coins: 1000,
    price_idr: 10000,
    is_active: true,
    description: "12x generate",
  },
  {
    id: "mulai-panik",
    name: "Mulai Panik",
    label: "Mulai Panik",
    coins: 2200,
    price_idr: 20000,
    is_active: true,
    description: "27x generate",
  },
  {
    id: "budak-korporat",
    name: "Budak Korporat",
    label: "Budak Korporat",
    coins: 4500,
    price_idr: 40000,
    is_active: true,
    description: "56x generate",
  },
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
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

export interface AutofillData {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  skills: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  latest_company: string;
  latest_role: string;
  latest_education_institution: string;
  latest_education_degree: string;
  latest_education_field: string;
  latest_education_year: string;
}

export function profileToAutofill(profile: UserProfile): AutofillData {
  const parts = (profile.full_name || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const latestExp = profile.experience?.[0];
  const latestEdu = profile.education?.[0];

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: profile.full_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    linkedin_url: profile.linkedin_url || "",
    skills: profile.skills?.join(", ") || "",
    summary: profile.summary || "",
    experience: profile.experience || [],
    education: profile.education || [],
    latest_company: latestExp?.company || "",
    latest_role: latestExp?.role || "",
    latest_education_institution: latestEdu?.institution || "",
    latest_education_degree: latestEdu?.degree || "",
    latest_education_field: latestEdu?.field || "",
    latest_education_year: latestEdu?.year || "",
  };
}

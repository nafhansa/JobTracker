const PROFILE_KEY = "jt_profile";

interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
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

function profileToAutofill(profile: Record<string, unknown>): AutofillData {
  const fullName = ((profile.full_name as string) || "").trim();
  const parts = fullName.split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const experience = profile.experience as ExperienceEntry[] | undefined;
  const education = profile.education as EducationEntry[] | undefined;
  const latestExp = experience?.[0];
  const latestEdu = education?.[0];
  const skills = profile.skills as string[] | undefined;

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: (profile.email as string) || "",
    phone: (profile.phone as string) || "",
    linkedin_url: (profile.linkedin_url as string) || "",
    skills: skills?.join(", ") || "",
    summary: (profile.summary as string) || "",
    experience: experience || [],
    education: education || [],
    latest_company: latestExp?.company || "",
    latest_role: latestExp?.role || "",
    latest_education_institution: latestEdu?.institution || "",
    latest_education_degree: latestEdu?.degree || "",
    latest_education_field: latestEdu?.field || "",
    latest_education_year: latestEdu?.year || "",
  };
}

export async function readProfileFromStorage(): Promise<AutofillData | null> {
  try {
    const result = await chrome.storage.local.get(PROFILE_KEY);
    const stored = result[PROFILE_KEY] as {
      profile: Record<string, unknown>;
      cachedAt: number;
    } | undefined;

    if (!stored || !stored.profile) return null;

    return profileToAutofill(stored.profile);
  } catch {
    return null;
  }
}

export function watchStorageChanges(
  callback: (profile: AutofillData | null) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(PROFILE_KEY in changes)) return;

    const newValue = changes[PROFILE_KEY].newValue as {
      profile: Record<string, unknown>;
      cachedAt: number;
    } | undefined;

    if (!newValue || !newValue.profile) {
      callback(null);
      return;
    }

    callback(profileToAutofill(newValue.profile));
  });
}

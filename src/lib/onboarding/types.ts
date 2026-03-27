export type JobSearchStage = 
  | "just_started" 
  | "applied_some" 
  | "actively_interviewing" 
  | "employed_looking";

export type WorkPreference = "remote" | "onsite" | "hybrid" | "flexible";

export type ExperienceLevel = 
  | "no_experience" 
  | "internship_only" 
  | "less_than_1_year" 
  | "one_to_three_years" 
  | "three_plus_years";

export type Language = "id" | "en";

export interface TargetRole {
  type: "predefined" | "custom";
  id?: string;
  name: string;
}

export interface JobRole {
  id: string;
  name: string;
  name_id: string | null;
  category: string;
}

export interface OnboardingFormData {
  jobSearchStage: JobSearchStage | null;
  targetRoles: TargetRole[];
  workPreferences: WorkPreference[];
  experienceLevel: ExperienceLevel | null;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  job_search_stage: JobSearchStage;
  target_roles: TargetRole[];
  work_preferences: WorkPreference[];
  experience_level: ExperienceLevel;
  created_at: string;
  updated_at: string;
}

export const JOB_SEARCH_STAGES: { value: JobSearchStage; labelKey: string }[] = [
  { value: "just_started", labelKey: "onboarding.q1.just_started" },
  { value: "applied_some", labelKey: "onboarding.q1.applied_some" },
  { value: "actively_interviewing", labelKey: "onboarding.q1.actively_interviewing" },
  { value: "employed_looking", labelKey: "onboarding.q1.employed_looking" },
];

export const WORK_PREFERENCES: { value: WorkPreference; labelKey: string }[] = [
  { value: "remote", labelKey: "onboarding.q3.remote" },
  { value: "onsite", labelKey: "onboarding.q3.onsite" },
  { value: "hybrid", labelKey: "onboarding.q3.hybrid" },
  { value: "flexible", labelKey: "onboarding.q3.flexible" },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; labelKey: string }[] = [
  { value: "no_experience", labelKey: "onboarding.q4.no_experience" },
  { value: "internship_only", labelKey: "onboarding.q4.internship" },
  { value: "less_than_1_year", labelKey: "onboarding.q4.less_1_year" },
  { value: "one_to_three_years", labelKey: "onboarding.q4.one_to_three" },
  { value: "three_plus_years", labelKey: "onboarding.q4.three_plus" },
];

export const INITIAL_FORM_DATA: OnboardingFormData = {
  jobSearchStage: null,
  targetRoles: [],
  workPreferences: [],
  experienceLevel: null,
};
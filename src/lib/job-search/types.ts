export type JobSite = "indeed" | "linkedin" | "zip_recruiter" | "glassdoor" | "google" | "bayt" | "bdjobs" | "naukri";

export type JobTypeFilter = "fulltime" | "parttime" | "internship" | "contract";

export type SalaryInterval = "yearly" | "monthly" | "weekly" | "daily" | "hourly";

export interface SearchParams {
  site_name: JobSite[];
  search_term: string;
  google_search_term?: string;
  location?: string;
  distance?: number;
  job_type?: JobTypeFilter | "";
  is_remote?: boolean;
  results_wanted?: number;
  hours_old?: number;
  country_indeed?: string;
  enforce_annual_salary?: boolean;
  description_format?: "markdown" | "html";
  linkedin_fetch_description?: boolean;
  offset?: number;
}

export interface JobSearchResult {
  id: string;
  site: string;
  title: string;
  company: string;
  company_url: string | null;
  job_url: string | null;
  job_url_direct: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  is_remote: boolean;
  description: string | null;
  job_type: string | null;
  job_function: string | null;
  min_amount: number | null;
  max_amount: number | null;
  currency: string | null;
  salary_source: string | null;
  salary_interval: string | null;
  date_posted: string | null;
  emails: string[];
  company_industry: string | null;
  job_level: string | null;
  company_logo: string | null;
}

export interface SavedJob {
  id: string;
  user_id: string;
  title: string;
  company: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_url: string | null;
  job_url_direct: string | null;
  description: string | null;
  job_type: string | null;
  is_remote: boolean;
  min_amount: number | null;
  max_amount: number | null;
  currency: string | null;
  salary_source: string | null;
  salary_interval: string | null;
  date_posted: string | null;
  site: string | null;
  company_url: string | null;
  company_industry: string | null;
  company_logo: string | null;
  source_data: Record<string, unknown> | null;
  created_at: string;
}

export const SITE_CONFIG: Record<JobSite, { label: string; color: string; bgClass: string }> = {
  linkedin: { label: "LinkedIn", color: "#0A66C2", bgClass: "bg-[#0A66C2]/10 text-[#0A66C2]" },
  indeed: { label: "Indeed", color: "#2557A7", bgClass: "bg-[#2557A7]/10 text-[#2557A7]" },
  glassdoor: { label: "Glassdoor", color: "#0CAA41", bgClass: "bg-[#0CAA41]/10 text-[#0CAA41]" },
  google: { label: "Google", color: "#4285F4", bgClass: "bg-[#4285F4]/10 text-[#4285F4]" },
  zip_recruiter: { label: "ZipRecruiter", color: "#1D2B3A", bgClass: "bg-[#1D2B3A]/10 text-[#1D2B3A] dark:text-white/80" },
  bayt: { label: "Bayt", color: "#8B5CF6", bgClass: "bg-[#8B5CF6]/10 text-[#8B5CF6]" },
  bdjobs: { label: "BDJobs", color: "#F59E0B", bgClass: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  naukri: { label: "Naukri", color: "#3B82F6", bgClass: "bg-[#3B82F6]/10 text-[#3B82F6]" },
};

export const JOB_TYPE_OPTIONS: { value: JobTypeFilter | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "fulltime", label: "Full Time" },
  { value: "parttime", label: "Part Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

export const HOURS_OLD_OPTIONS: { value: number | 0; label: string }[] = [
  { value: 0, label: "Any time" },
  { value: 24, label: "Last 24 hours" },
  { value: 72, label: "Last 3 days" },
  { value: 168, label: "Last 7 days" },
  { value: 336, label: "Last 14 days" },
  { value: 720, label: "Last 30 days" },
];

export const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "USA", label: "USA" },
  { value: "UK", label: "United Kingdom" },
  { value: "Singapore", label: "Singapore" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "India", label: "India" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "Canada", label: "Canada" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "France", label: "France" },
  { value: "Brazil", label: "Brazil" },
  { value: "Philippines", label: "Philippines" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Thailand", label: "Thailand" },
];

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  site_name: ["indeed", "linkedin", "google"],
  search_term: "",
  location: "",
  distance: 25,
  job_type: "",
  is_remote: false,
  results_wanted: 15,
  hours_old: 0,
  country_indeed: "Indonesia",
  enforce_annual_salary: false,
  description_format: "markdown",
  linkedin_fetch_description: false,
  offset: 0,
};
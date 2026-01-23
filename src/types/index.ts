export interface JobStatus {
  applied: boolean;
  emailed: boolean;
  cvResponded: boolean;
  interviewEmail: boolean;
  contractEmail: boolean;
  rejected?: boolean;
}

export interface JobApplication {
  id?: string; 
  userId: string; 
  jobTitle: string;
  industry: string;
  recruiterEmail?: string;
  applicationUrl?: string;
  jobType?: string; // Full Time, Part Time, Contract, Internship, Freelance, etc.
  location?: string; // Remote/WFH, On-site/WFO, Hybrid
  potentialSalary?: number;
  currency: string; 
  status: JobStatus;
  createdAt: number; 
  updatedAt: number; 
}

export type AnalyticsEventType = "visit" | "login" | "dashboard";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: Date | string | number;
  userId?: string;
  userEmail?: string;
  page?: string;
}

export interface AnalyticsLogEntry {
  id: string;
  timestamp: string;
  userEmail?: string;
  userId?: string;
  page?: string;
  sessionId?: string;
  deviceInfo?: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    language?: string;
  };
  ipAddress?: string;
  country?: string;
  countryCode?: string;
}

export interface MicroConversionEvent {
  id: string;
  timestamp: string;
  type: "pricing_click" | "scroll_depth" | "time_on_page" | "cta_click";
  value?: number; // For scroll_depth (0-100), time_on_page (seconds)
  sessionId?: string;
  page?: string;
}

export interface AnalyticsStats {
  totalVisitors: number;
  loginAttempts: number;
  activeUsers: number;
  dashboardVisits: number;
  conversionRate: number;
  recentVisits: Array<{ timestamp: string; count: number }>;
  recentLogins: Array<{ timestamp: string; count: number }>;
  recentDashboardVisits: Array<{ timestamp: string; count: number }>;
  visitorLogs: AnalyticsLogEntry[];
  loginLogs: AnalyticsLogEntry[];
  microConversions: {
    pricingClicks: number;
    avgScrollDepth: number;
    avgTimeOnPage: number;
    ctaClicks: number;
    pricingClickRate: number;
    scrollDepthDistribution: Array<{ range: string; count: number }>;
  };
}

// Subscription Plan Types
export type SubscriptionPlan = "free" | "monthly" | "lifetime";

// Free Plan Constants
export const FREE_PLAN_JOB_LIMIT = 15;
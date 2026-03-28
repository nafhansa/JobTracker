export interface JobStatus {
  applied: boolean;
  emailed: boolean;
  cvResponded: boolean;
  interviewEmail: boolean;
  contractEmail: boolean;
  rejected?: boolean;
}

export type SalaryType = 'exact' | 'range' | 'unspecified';

export interface JobApplication {
  id?: string;
  userId: string;
  jobTitle: string;
  company: string;
  industry: string;
  recruiterEmail?: string;
  applicationUrl?: string;
  jobType?: string;
  location?: string;
  potentialSalary?: number;
  potentialSalaryMin?: number;
  potentialSalaryMax?: number;
  salaryType?: SalaryType;
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
export const FREE_PLAN_JOB_LIMIT = 10;

// Feedback Types
export type FeedbackType = "general" | "bug" | "feature";

export interface Feedback {
  id?: string;
  userId: string;
  type: FeedbackType;
  rating: number;
  message: string;
  createdAt?: string;
}

export type FreelanceJobStatus = "ongoing" | "completed" | "cancelled";

export interface FreelanceJob {
  id?: string;
  userId: string;
  clientName: string;
  clientContact: string;
  serviceType: string;
  product: string;
  potentialPrice: number;
  actualPrice?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  status: FreelanceJobStatus;
  createdAt: number;
  updatedAt: number;
}

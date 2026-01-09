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
  potentialSalary?: number;
  currency: string; 
  status: JobStatus;
  createdAt: number; 
  updatedAt: number; 
}

export type AnalyticsEventType = "visit" | "login" | "dashboard";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: any;
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
}
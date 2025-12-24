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
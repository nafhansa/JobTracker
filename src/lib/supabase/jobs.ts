import { supabase } from './client';
import { JobApplication, JobStatus } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Add a new job application
 */
export const addJob = async (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Generate Firebase-like ID if not provided (for new jobs)
    // Firebase uses 20-character alphanumeric IDs
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const jobId = (jobData as any).id || generateId();
    
    const { data, error } = await (supabase
      .from('jobs') as any)
      .insert({
        id: jobId,
        user_id: jobData.userId,
        job_title: jobData.jobTitle,
        company: jobData.company,
        industry: jobData.industry,
        recruiter_email: jobData.recruiterEmail || null,
        application_url: jobData.applicationUrl || null,
        job_type: jobData.jobType || null,
        location: jobData.location || null,
        potential_salary: jobData.potentialSalary || null,
        currency: jobData.currency || 'IDR',
        status_applied: jobData.status.applied || false,
        status_emailed: jobData.status.emailed || false,
        status_cv_responded: jobData.status.cvResponded || false,
        status_interview_email: jobData.status.interviewEmail || false,
        status_contract_email: jobData.status.contractEmail || false,
        status_rejected: jobData.status.rejected || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
};

/**
 * Update a job application
 */
export const updateJob = async (jobId: string, data: Partial<JobApplication>) => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields if provided
    if (data.jobTitle) updateData.job_title = data.jobTitle;
    if (data.company) updateData.company = data.company;
    if (data.industry) updateData.industry = data.industry;
    if (data.recruiterEmail !== undefined) updateData.recruiter_email = data.recruiterEmail || null;
    if (data.applicationUrl !== undefined) updateData.application_url = data.applicationUrl || null;
    if (data.jobType !== undefined) updateData.job_type = data.jobType || null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.potentialSalary !== undefined) updateData.potential_salary = data.potentialSalary || null;
    if (data.currency) updateData.currency = data.currency;

    // Map status object
    if (data.status) {
      if (data.status.applied !== undefined) updateData.status_applied = data.status.applied;
      if (data.status.emailed !== undefined) updateData.status_emailed = data.status.emailed;
      if (data.status.cvResponded !== undefined) updateData.status_cv_responded = data.status.cvResponded;
      if (data.status.interviewEmail !== undefined) updateData.status_interview_email = data.status.interviewEmail;
      if (data.status.contractEmail !== undefined) updateData.status_contract_email = data.status.contractEmail;
      if (data.status.rejected !== undefined) updateData.status_rejected = data.status.rejected;
    }

    const { error } = await (supabase
      .from('jobs') as any)
      .update(updateData)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Delete a job application
 */
export const deleteJob = async (jobId: string) => {
  try {
    const { error } = await (supabase
      .from('jobs') as any)
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

/**
 * Get job count for a user
 */
export const getJobCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await (supabase
      .from('jobs') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting job count:', error);
    throw error;
  }
};

/**
 * Transform Supabase job row to JobApplication format
 */
const transformJobRow = (row: any): JobApplication => {
  return {
    id: row.id,
    userId: row.user_id,
    jobTitle: row.job_title,
    company: row.company,
    industry: row.industry,
    recruiterEmail: row.recruiter_email || undefined,
    applicationUrl: row.application_url || undefined,
    jobType: row.job_type || undefined,
    location: row.location || undefined,
    potentialSalary: row.potential_salary || undefined,
    currency: row.currency || 'IDR',
    status: {
      applied: row.status_applied || false,
      emailed: row.status_emailed || false,
      cvResponded: row.status_cv_responded || false,
      interviewEmail: row.status_interview_email || false,
      contractEmail: row.status_contract_email || false,
      rejected: row.status_rejected || false,
    } as JobStatus,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
};

/**
 * Subscribe to jobs for a user (real-time)
 */
export const subscribeToJobs = (
  userId: string,
  callback: (jobs: JobApplication[]) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`jobs:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // Fetch all jobs when any change occurs
        const { data, error } = await (supabase
          .from('jobs') as any)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        const jobs = (data || []).map(transformJobRow);
        callback(jobs);
      }
    )
    .subscribe();

  // Initial fetch
  (supabase
    .from('jobs') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .then(({ data, error }: { data: any; error: any }) => {
      if (error) {
        console.error('Error fetching initial jobs:', error);
        return;
      }
      const jobs = (data || []).map(transformJobRow);
      callback(jobs);
    });

  return channel;
};
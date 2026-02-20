import { supabase } from './client';
import { JobApplication, JobStatus } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Add a new job application
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */
export const addJob = async (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await fetch('/api/jobs/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: jobData.userId,
        jobTitle: jobData.jobTitle,
        company: jobData.company,
        industry: jobData.industry,
        recruiterEmail: jobData.recruiterEmail,
        applicationUrl: jobData.applicationUrl,
        jobType: jobData.jobType,
        location: jobData.location,
        potentialSalary: jobData.potentialSalary,
        currency: jobData.currency || 'IDR',
        status: jobData.status,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add job');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
};

/**
 * Update a job application
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */
export const updateJob = async (jobId: string, data: Partial<JobApplication>) => {
  try {
    const response = await fetch('/api/jobs/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Delete a job application
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */
export const deleteJob = async (jobId: string) => {
  try {
    const response = await fetch('/api/jobs/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete job');
    }

    return await response.json();
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
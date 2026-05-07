import { supabase } from './client';
import { auth } from '@/lib/firebase/config';
import { JobApplication, JobStatus } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

const INITIAL_FETCH_LIMIT = 100;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;

async function getAuthToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('User not authenticated');
  return token;
}

/**
 * Add a new job application
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */
export const addJob = async (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const token = await getAuthToken();
    const response = await fetch('/api/jobs/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
        potentialSalaryMin: jobData.potentialSalaryMin,
        potentialSalaryMax: jobData.potentialSalaryMax,
        salaryType: jobData.salaryType,
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
    const token = await getAuthToken();
    const response = await fetch('/api/jobs/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const token = await getAuthToken();
    const response = await fetch('/api/jobs/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
 * Uses API route to bypass CORS (since users authenticate with Firebase, not Supabase)
 */
export const getJobCount = async (user: { getIdToken: () => Promise<string> }): Promise<number> => {
  try {
    const token = await user.getIdToken();
    const response = await fetch('/api/jobs/count', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get job count');
    }

    const result = await response.json();
    return result.count;
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
    jobTitle: row.job_title || 'Unknown Job Title',
    company: row.company,
    industry: row.industry,
    recruiterEmail: row.recruiter_email || undefined,
    applicationUrl: row.application_url || undefined,
    jobType: row.job_type || undefined,
    location: row.location || undefined,
    potentialSalary: row.potential_salary || undefined,
    potentialSalaryMin: row.potential_salary_min || undefined,
    potentialSalaryMax: row.potential_salary_max || undefined,
    salaryType: row.salary_type || undefined,
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

const JOB_COLUMNS = 'id,user_id,job_title,company,industry,recruiter_email,application_url,job_type,location,potential_salary,potential_salary_min,potential_salary_max,salary_type,currency,status_applied,status_emailed,status_cv_responded,status_interview_email,status_contract_email,status_rejected,created_at,updated_at';

/**
 * Subscribe to jobs for a user (real-time) with incremental updates
 * Features:
 * - Pagination on initial fetch (LIMIT 100)
 * - Reconnection with exponential backoff
 * - Proper cleanup on unsubscribe
 */
export const subscribeToJobs = (
  userId: string,
  callback: (jobs: JobApplication[]) => void
): RealtimeChannel => {
  let currentJobs: JobApplication[] = [];
  let reconnectAttempts = 0;
  let isSubscribed = true;
  let reconnectTimeoutId: NodeJS.Timeout | null = null;

  const createChannel = (): RealtimeChannel => {
    const channel = supabase
      .channel(`jobs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newJob = transformJobRow(payload.new);
          currentJobs = [newJob, ...currentJobs].slice(0, INITIAL_FETCH_LIMIT);
          callback(currentJobs);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedJob = transformJobRow(payload.new);
          currentJobs = currentJobs.map(j => j.id === updatedJob.id ? updatedJob : j);
          callback(currentJobs);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = payload.old?.id;
          if (deletedId) {
            currentJobs = currentJobs.filter(j => j.id !== deletedId);
            callback(currentJobs);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR' && isSubscribed) {
          handleReconnect(channel);
        }
      });

    return channel;
  };

  const handleReconnect = (failedChannel: RealtimeChannel) => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || !isSubscribed) {
      console.error('Max reconnect attempts reached for jobs subscription');
      return;
    }

    reconnectAttempts++;
    const delay = Math.min(RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts - 1), 30000);

    reconnectTimeoutId = setTimeout(() => {
      if (isSubscribed) {
        failedChannel.unsubscribe();
        const newChannel = createChannel();
        (channelRef as any) = newChannel;
      }
    }, delay);
  };

  let channelRef = createChannel();

  // Initial fetch with pagination
  (supabase
    .from('jobs') as any)
    .select(JOB_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(INITIAL_FETCH_LIMIT)
    .then(({ data, error }: { data: any; error: any }) => {
      if (error) {
        console.error('Error fetching initial jobs:', error);
        return;
      }
      currentJobs = (data || []).map(transformJobRow);
      callback(currentJobs);
    });

  // Return a wrapper that properly cleans up
  return {
    ...channelRef,
    unsubscribe: async () => {
      isSubscribed = false;
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }
      return channelRef.unsubscribe();
    },
  } as RealtimeChannel;
};
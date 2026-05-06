import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './client';
import { JobApplication, JobStatus } from '@/types';

const JOB_COLUMNS = 'id,user_id,job_title,company,industry,recruiter_email,application_url,job_type,location,potential_salary,potential_salary_min,potential_salary_max,salary_type,currency,status_applied,status_emailed,status_cv_responded,status_interview_email,status_contract_email,status_rejected,created_at,updated_at';

const FETCH_LIMIT = 100;
const POLL_INTERVAL_MS = 30000; // 30 seconds

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

/**
 * Polling-based job subscription (replaces Supabase Realtime)
 * - Fetches jobs initially
 * - Polls every 30s for updates
 * - Uses updated_at to detect changes
 * - No WebSocket connections needed
 */
export function useJobsPolling(userId: string | undefined) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdatedAtRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchJobs = useCallback(async (isPoll = false) => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await (supabase
        .from('jobs') as any)
        .select(JOB_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(FETCH_LIMIT);

      if (fetchError) throw fetchError;

      if (!isMountedRef.current) return;

      const transformed = (data || []).map(transformJobRow);

      // Only update if data changed (compare count + latest updated_at)
      const latestUpdatedAt = transformed.length > 0 ? transformed[0].updatedAt : null;
      if (isPoll && latestUpdatedAt === lastUpdatedAtRef.current) {
        return; // No changes
      }

      lastUpdatedAtRef.current = latestUpdatedAt;
      setJobs(transformed);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchJobs(false);

    const pollInterval = setInterval(() => {
      fetchJobs(true);
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollInterval);
    };
  }, [fetchJobs]);

  // Refetch helper (call after adding/updating/deleting a job)
  const refetch = useCallback(() => {
    lastUpdatedAtRef.current = null; // Force update
    fetchJobs(false);
  }, [fetchJobs]);

  return { jobs, loading, error, refetch };
}

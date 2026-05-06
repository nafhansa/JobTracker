import { useState, useEffect, useRef, useCallback } from 'react';
import { JobApplication, JobStatus } from '@/types';

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
 * - Fetches jobs via API route (server-side proxy to avoid CORS)
 * - Polls every 30s for updates
 * - Uses updated_at to detect changes
 * - No WebSocket connections needed
 */
export function useJobsPolling(user: { getIdToken: () => Promise<string> } | undefined) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdatedAtRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchJobs = useCallback(async (isPoll = false) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/jobs/list?limit=${FETCH_LIMIT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch jobs' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const transformed = (result.jobs || []).map(transformJobRow);

      if (!isMountedRef.current) return;

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
  }, [user]);

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

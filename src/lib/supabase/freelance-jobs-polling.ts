import { useState, useEffect, useRef, useCallback } from 'react';
import { FreelanceJob } from '@/types';

const FETCH_LIMIT = 100;
const POLL_INTERVAL_MS = 30000; // 30 seconds

const transformFreelanceJobRow = (row: any): FreelanceJob => {
  return {
    id: row.id,
    userId: row.user_id,
    clientName: row.client_name,
    clientContact: row.client_contact || '',
    serviceType: row.service_type,
    product: row.product,
    potentialPrice: row.potential_price || 0,
    actualPrice: row.actual_price || undefined,
    currency: row.currency || 'IDR',
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    durationDays: row.duration_days || undefined,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
};

/**
 * Polling-based freelance job subscription (replaces Supabase Realtime)
 * - Fetches jobs via API route (server-side proxy to avoid CORS)
 * - Polls every 30s for updates
 * - Uses updated_at to detect changes
 * - No WebSocket connections needed
 */
export function useFreelanceJobsPolling(userId: string | undefined) {
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdatedAtRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchJobs = useCallback(async (isPoll = false) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/freelance/list?limit=${FETCH_LIMIT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch freelance jobs' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const transformed = (result.jobs || []).map(transformFreelanceJobRow);

      if (!isMountedRef.current) return;

      // Only update if data changed
      const latestUpdatedAt = transformed.length > 0 ? transformed[0].updatedAt : null;
      if (isPoll && latestUpdatedAt === lastUpdatedAtRef.current) {
        return; // No changes
      }

      lastUpdatedAtRef.current = latestUpdatedAt;
      setJobs(transformed);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching freelance jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch freelance jobs');
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

  const refetch = useCallback(() => {
    lastUpdatedAtRef.current = null; // Force update
    fetchJobs(false);
  }, [fetchJobs]);

  return { jobs, loading, error, refetch };
}

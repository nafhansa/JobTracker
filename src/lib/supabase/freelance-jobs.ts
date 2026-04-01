import { supabase } from './client';
import { FreelanceJob } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const addFreelanceJob = async (jobData: Omit<FreelanceJob, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await fetch('/api/freelance/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add freelance job');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error adding freelance job:', error);
    throw error;
  }
};

export const updateFreelanceJob = async (jobId: string, data: Partial<FreelanceJob>) => {
  try {
    const response = await fetch('/api/freelance/update', {
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
      throw new Error(error.error || 'Failed to update freelance job');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating freelance job:', error);
    throw error;
  }
};

export const deleteFreelanceJob = async (jobId: string) => {
  try {
    const response = await fetch('/api/freelance/delete', {
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
      throw new Error(error.error || 'Failed to delete freelance job');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting freelance job:', error);
    throw error;
  }
};

export const getFreelanceJobCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('freelance_jobs' as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting freelance job count:', error);
    throw error;
  }
};

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

export const subscribeToFreelanceJobs = (
  userId: string,
  callback: (jobs: FreelanceJob[]) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`freelance_jobs:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'freelance_jobs',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const { data, error } = await supabase
          .from('freelance_jobs' as any)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching freelance jobs:', error);
          return;
        }

        const jobs = (data || []).map(transformFreelanceJobRow);
        callback(jobs);
      }
    )
    .subscribe();

  supabase
    .from('freelance_jobs' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .then(({ data, error }: { data: any; error: any }) => {
      if (error) {
        console.error('Error fetching initial freelance jobs:', error);
        return;
      }
      const jobs = (data || []).map(transformFreelanceJobRow);
      callback(jobs);
    });

  return channel;
};
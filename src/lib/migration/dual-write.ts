/**
 * Dual-Write Wrapper
 * 
 * During migration, write to both Firebase and Supabase.
 * Firebase is the source of truth; Supabase failures are logged
 * for manual reconciliation.
 */

import { addJob as firebaseAddJob, updateJob as firebaseUpdateJob, deleteJob as firebaseDeleteJob } from '@/lib/firebase/firestore';
import { addJob as supabaseAddJob, updateJob as supabaseUpdateJob, deleteJob as supabaseDeleteJob } from '@/lib/supabase/jobs';
import { JobApplication } from '@/types';
import { shouldWriteToSupabase } from './feature-flags';

/**
 * Dual-write: Add job to both Firebase and Supabase
 * Returns { firebaseResult, supabaseFailed } for caller to inspect.
 */
export const dualWriteAddJob = async (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  let firebaseResult: unknown;

  // Firebase first (source of truth)
  try {
    firebaseResult = await firebaseAddJob(jobData);
  } catch (error) {
    console.error('Firebase write error:', error);
    throw error; // Fail fast - Firebase is authoritative
  }

  // Supabase (secondary, non-blocking)
  let supabaseFailed = false;
  if (shouldWriteToSupabase()) {
    try {
      await supabaseAddJob(jobData);
    } catch (error) {
      supabaseFailed = true;
      console.error('[DUAL-WRITE] Supabase add failed — data inconsistency:', error);
    }
  }

  return { firebaseResult, supabaseFailed };
};

/**
 * Dual-write: Update job in both Firebase and Supabase
 */
export const dualWriteUpdateJob = async (jobId: string, data: Partial<JobApplication>) => {
  // Firebase first (source of truth)
  try {
    await firebaseUpdateJob(jobId, data);
  } catch (error) {
    console.error('Firebase update error:', error);
    throw error;
  }

  // Supabase (secondary, non-blocking)
  let supabaseFailed = false;
  if (shouldWriteToSupabase()) {
    try {
      await supabaseUpdateJob(jobId, data);
    } catch (error) {
      supabaseFailed = true;
      console.error('[DUAL-WRITE] Supabase update failed — data inconsistency:', error);
    }
  }

  return { supabaseFailed };
};

/**
 * Dual-write: Delete job from both Firebase and Supabase
 */
export const dualWriteDeleteJob = async (jobId: string) => {
  // Firebase first (source of truth)
  try {
    await firebaseDeleteJob(jobId);
  } catch (error) {
    console.error('Firebase delete error:', error);
    throw error;
  }

  // Supabase (secondary, non-blocking)
  let supabaseFailed = false;
  if (shouldWriteToSupabase()) {
    try {
      await supabaseDeleteJob(jobId);
    } catch (error) {
      supabaseFailed = true;
      console.error('[DUAL-WRITE] Supabase delete failed — data inconsistency:', error);
    }
  }

  return { supabaseFailed };
};

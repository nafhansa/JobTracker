/**
 * Dual-Write Wrapper
 * 
 * During migration, write to both Firebase and Supabase
 */

import { addJob as firebaseAddJob, updateJob as firebaseUpdateJob, deleteJob as firebaseDeleteJob } from '@/lib/firebase/firestore';
import { addJob as supabaseAddJob, updateJob as supabaseUpdateJob, deleteJob as supabaseDeleteJob } from '@/lib/supabase/jobs';
import { JobApplication } from '@/types';
import { shouldWriteToSupabase } from './feature-flags';

/**
 * Dual-write: Add job to both Firebase and Supabase
 */
export const dualWriteAddJob = async (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  const promises: Promise<unknown>[] = [];

  // Always write to Firebase (existing)
  promises.push(firebaseAddJob(jobData).catch((error) => {
    console.error('Firebase write error:', error);
    throw error; // Fail if Firebase write fails
  }));

  // Write to Supabase if enabled
  if (shouldWriteToSupabase()) {
    promises.push(
      supabaseAddJob(jobData).catch((error) => {
        console.error('Supabase write error (non-fatal):', error);
        // Don't throw - Supabase write failure shouldn't block Firebase
      })
    );
  }

  await Promise.all(promises);
};

/**
 * Dual-write: Update job in both Firebase and Supabase
 */
export const dualWriteUpdateJob = async (jobId: string, data: Partial<JobApplication>) => {
  const promises: Promise<unknown>[] = [];

  // Always write to Firebase
  promises.push(firebaseUpdateJob(jobId, data).catch((error) => {
    console.error('Firebase update error:', error);
    throw error;
  }));

  // Write to Supabase if enabled
  if (shouldWriteToSupabase()) {
    promises.push(
      supabaseUpdateJob(jobId, data).catch((error) => {
        console.error('Supabase update error (non-fatal):', error);
      })
    );
  }

  await Promise.all(promises);
};

/**
 * Dual-write: Delete job from both Firebase and Supabase
 */
export const dualWriteDeleteJob = async (jobId: string) => {
  const promises: Promise<unknown>[] = [];

  // Always delete from Firebase
  promises.push(firebaseDeleteJob(jobId).catch((error) => {
    console.error('Firebase delete error:', error);
    throw error;
  }));

  // Delete from Supabase if enabled
  if (shouldWriteToSupabase()) {
    promises.push(
      supabaseDeleteJob(jobId).catch((error) => {
        console.error('Supabase delete error (non-fatal):', error);
      })
    );
  }

  await Promise.all(promises);
};

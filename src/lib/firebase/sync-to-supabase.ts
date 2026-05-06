/**
 * Sync Firebase user to Supabase
 * 
 * After Firebase login, sync user data to Supabase for dual storage
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */

import { User } from 'firebase/auth';

const MAX_SYNC_RETRIES = 3;
const SYNC_RETRY_DELAY_MS = 500;

/**
 * Sync Firebase user to Supabase
 * Uses API route with service role to bypass RLS
 * Retries on failure with exponential backoff
 */
export const syncFirebaseUserToSupabase = async (firebaseUser: User): Promise<void> => {
  if (!firebaseUser.email) {
    console.warn('Firebase user has no email, skipping Supabase sync');
    return;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_SYNC_RETRIES; attempt++) {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          email: firebaseUser.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync user');
      }

      const result = await response.json();
      console.log('✅ Firebase user synced to Supabase:', firebaseUser.email, 'UID:', firebaseUser.uid);
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Sync attempt ${attempt}/${MAX_SYNC_RETRIES} failed for ${firebaseUser.email}:`, lastError.message);

      if (attempt < MAX_SYNC_RETRIES) {
        const delay = SYNC_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying sync in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted - log but don't throw to avoid blocking login
  console.error('❌ All sync retries exhausted for user:', firebaseUser.email, 'UID:', firebaseUser.uid, 'Last error:', lastError?.message);
};

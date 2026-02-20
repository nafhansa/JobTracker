/**
 * Sync Firebase user to Supabase
 * 
 * After Firebase login, sync user data to Supabase for dual storage
 * Uses API route to bypass RLS (since users authenticate with Firebase, not Supabase)
 */

import { User } from 'firebase/auth';

/**
 * Sync Firebase user to Supabase
 * Uses API route with service role to bypass RLS
 */
export const syncFirebaseUserToSupabase = async (firebaseUser: User): Promise<void> => {
  try {
    if (!firebaseUser.email) {
      console.warn('Firebase user has no email, skipping Supabase sync');
      return;
    }

    // Use API route to sync user (bypasses RLS using service role)
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
  } catch (error) {
    console.error('❌ Error syncing Firebase user to Supabase:', error);
    // Don't throw - let user continue even if sync fails
  }
};

/**
 * Sync Firebase user to Supabase
 * 
 * After Firebase login, sync user data to Supabase for dual storage
 * Uses Firebase UID as the ID in Supabase (since users table uses TEXT for id)
 */

import { supabase } from '@/lib/supabase/client';
import { User } from 'firebase/auth';

/**
 * Sync Firebase user to Supabase
 * Uses Firebase UID as the primary key (users table uses TEXT for id)
 */
export const syncFirebaseUserToSupabase = async (firebaseUser: User): Promise<void> => {
  try {
    if (!firebaseUser.email) {
      console.warn('Firebase user has no email, skipping Supabase sync');
      return;
    }

    // Check if user exists in Supabase by ID (Firebase UID)
    const { data: existingUser } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('id', firebaseUser.uid)
      .maybeSingle();

    const userData: any = {
      email: firebaseUser.email,
      updated_at: new Date().toISOString(),
    };

    // Preserve existing subscription data if user exists
    if (existingUser) {
      userData.subscription_plan = existingUser.subscription_plan || 'free';
      userData.subscription_status = existingUser.subscription_status || 'active';
      userData.is_pro = existingUser.is_pro || false;
      
      // Update existing user
      await (supabase
        .from('users') as any)
        .update(userData)
        .eq('id', firebaseUser.uid);
    } else {
      // Create new user with free plan
      await (supabase
        .from('users') as any)
        .insert({
          id: firebaseUser.uid, // Use Firebase UID as Supabase ID
          email: firebaseUser.email,
          subscription_plan: 'free',
          subscription_status: 'active',
          is_pro: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    console.log('✅ Firebase user synced to Supabase:', firebaseUser.email, 'UID:', firebaseUser.uid);
  } catch (error) {
    console.error('❌ Error syncing Firebase user to Supabase:', error);
    // Don't throw - let user continue even if sync fails
  }
};

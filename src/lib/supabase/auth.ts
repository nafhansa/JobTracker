import { supabase } from './client';
import { User } from '@supabase/supabase-js';
import { ensureFreePlan } from './subscriptions';

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    return null;
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * On auth state changed callback
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user || null;

    if (user && event === 'SIGNED_IN') {
      // Ensure free plan is assigned
      await ensureFreePlan(user.id, user.email || undefined);
    }

    callback(user);
  });
};

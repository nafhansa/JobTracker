import { supabase } from './client';

/**
 * Track page visit
 */
export const trackPageVisit = async (page?: string, sessionId?: string, deviceInfo?: unknown) => {
  try {
    await supabase.from('analytics_visits').insert({
      type: 'visit',
      page: page || 'home',
      session_id: sessionId || null,
      device_info: deviceInfo ? (deviceInfo as Record<string, unknown>) : null,
    } as any);
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};

/**
 * Track login attempt
 */
export const trackLoginAttempt = async (
  userId?: string,
  userEmail?: string,
  sessionId?: string,
  deviceInfo?: unknown
) => {
  try {
    await supabase.from('analytics_logins').insert({
      type: 'login',
      user_id: userId || null,
      user_email: userEmail || null,
      session_id: sessionId || null,
      device_info: deviceInfo ? (deviceInfo as Record<string, unknown>) : null,
    } as any);
  } catch (error) {
    console.error('Error tracking login attempt:', error);
  }
};

/**
 * Track dashboard visit
 */
export const trackDashboardVisit = async (
  userId: string,
  userEmail?: string,
  sessionId?: string,
  deviceInfo?: unknown
) => {
  try {
    // Track dashboard visit
    await supabase.from('analytics_dashboard_visits').insert({
      type: 'dashboard',
      user_id: userId,
      user_email: userEmail || null,
      session_id: sessionId || null,
      device_info: deviceInfo ? (deviceInfo as Record<string, unknown>) : null,
    } as any);

    // Update active user
    await updateActiveUser(userId, userEmail);
  } catch (error) {
    console.error('Error tracking dashboard visit:', error);
  }
};

/**
 * Update active user status
 */
export const updateActiveUser = async (userId: string, userEmail?: string) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('analytics_active_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      // Update existing user's last_seen
      await (supabase
        .from('analytics_active_users') as any)
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Add new active user
      await supabase.from('analytics_active_users').insert({
        user_id: userId,
        user_email: userEmail || null,
        last_seen: new Date().toISOString(),
      } as any);
    }
  } catch (error) {
    console.error('Error updating active user:', error);
  }
};

/**
 * Get analytics stats (server-side only, via API)
 */
export const getAnalyticsStats = async () => {
  try {
    // Get all visits
    const { data: visits, error: visitsError } = await supabase
      .from('analytics_visits')
      .select('*');

    if (visitsError) throw visitsError;

    // Get all logins
    const { data: logins, error: loginsError } = await supabase
      .from('analytics_logins')
      .select('*');

    if (loginsError) throw loginsError;

    // Get all dashboard visits
    const { data: dashboardVisits, error: dashboardError } = await supabase
      .from('analytics_dashboard_visits')
      .select('*');

    if (dashboardError) throw dashboardError;

    // Get active users (last seen within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('analytics_active_users')
      .select('*')
      .gte('last_seen', fiveMinutesAgo);

    if (activeUsersError) throw activeUsersError;

    // Calculate conversion rate
    const conversionRate =
      logins && logins.length > 0 ? (dashboardVisits?.length || 0) / logins.length : 0;

    // Group by date for recent activity
    const groupByDate = (events: Array<{ timestamp?: string; [key: string]: unknown }>) => {
      const grouped: { [key: string]: number } = {};
      events.forEach((event) => {
        const timestamp = event.timestamp;
        if (!timestamp) return;

        const date = new Date(timestamp).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });

      return Object.entries(grouped)
        .map(([timestamp, count]) => ({ timestamp, count }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 7); // Last 7 days
    };

    return {
      totalVisitors: visits?.length || 0,
      loginAttempts: logins?.length || 0,
      activeUsers: activeUsers?.length || 0,
      dashboardVisits: dashboardVisits?.length || 0,
      conversionRate: Math.round(conversionRate * 10000) / 100,
      recentVisits: groupByDate(visits || []),
      recentLogins: groupByDate(logins || []),
      recentDashboardVisits: groupByDate(dashboardVisits || []),
    };
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    throw error;
  }
};
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
 * Update active user status (atomic upsert via RPC)
 * Prevents race condition when multiple concurrent visits from same user
 */
export const updateActiveUser = async (userId: string, userEmail?: string) => {
  try {
    await (supabase as any)
      .rpc('update_active_user_atomic', {
        p_user_id: userId,
        p_user_email: userEmail || null,
      });
  } catch (error) {
    console.error('Error updating active user:', error);
  }
};

/**
 * Get analytics stats (server-side only, via API)
 * Fixed: Uses date filtering and aggregation instead of full table scans
 */
export const getAnalyticsStats = async (daysBack: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString();

    // Get visit count with date grouping
    const { data: visits, error: visitsError } = await (supabase
      .from('analytics_visits') as any)
      .select('timestamp')
      .gte('timestamp', startDateStr);

    if (visitsError) throw visitsError;

    // Get login count with date grouping
    const { data: logins, error: loginsError } = await (supabase
      .from('analytics_logins') as any)
      .select('timestamp')
      .gte('timestamp', startDateStr);

    if (loginsError) throw loginsError;

    // Get dashboard visit count with date grouping
    const { data: dashboardVisits, error: dashboardError } = await (supabase
      .from('analytics_dashboard_visits') as any)
      .select('timestamp')
      .gte('timestamp', startDateStr);

    if (dashboardError) throw dashboardError;

    // Get active users (last seen within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeUsersCount, error: activeUsersError } = await supabase
      .from('analytics_active_users')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', fiveMinutesAgo);

    if (activeUsersError) throw activeUsersError;

    // Get total counts (all time)
    const { count: totalVisitsCount } = await supabase
      .from('analytics_visits')
      .select('*', { count: 'exact', head: true });

    const { count: totalLoginsCount } = await supabase
      .from('analytics_logins')
      .select('*', { count: 'exact', head: true });

    const { count: totalDashboardVisitsCount } = await supabase
      .from('analytics_dashboard_visits')
      .select('*', { count: 'exact', head: true });

    // Calculate conversion rate
    const conversionRate =
      totalLoginsCount && totalLoginsCount > 0
        ? (totalDashboardVisitsCount || 0) / totalLoginsCount
        : 0;

    // Group by date for recent activity
    const groupByDate = (events: Array<{ timestamp?: string }>) => {
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
      totalVisitors: totalVisitsCount || 0,
      loginAttempts: totalLoginsCount || 0,
      activeUsers: activeUsersCount || 0,
      dashboardVisits: totalDashboardVisitsCount || 0,
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
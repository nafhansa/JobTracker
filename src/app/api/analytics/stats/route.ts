import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { getAnalyticsStats } from "@/lib/supabase/analytics";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const timeFilter = searchParams.get("timeFilter") || "all"; // "5m", "15m", "30m", "1h", "24h", "all"
  const pageFilter = searchParams.get("pageFilter") || "all"; // "all", "home", "login", "dashboard"
  try {
    // Try Supabase first
    try {
      const supabaseStats = await getAnalyticsStats();
      // Return Supabase stats (basic stats, time filtering can be added later)
      return NextResponse.json({
        ...supabaseStats,
        visitorLogs: [],
        loginLogs: [],
        microConversions: {
          pricingClicks: 0,
          avgScrollDepth: 0,
          avgTimeOnPage: 0,
          ctaClicks: 0,
          pricingClickRate: 0,
          scrollDepthDistribution: [],
        },
      });
    } catch (supabaseError) {
      console.error("Supabase stats error, falling back to Firebase:", supabaseError);
      // Fall through to Firebase
    }
    // Helper function to get timestamp for time filter
    const getTimeFilterTimestamp = (filter: string): Timestamp | null => {
      const now = Date.now();
      let millisecondsAgo: number;
      switch (filter) {
        case "5m":
          millisecondsAgo = 5 * 60 * 1000;
          break;
        case "15m":
          millisecondsAgo = 15 * 60 * 1000;
          break;
        case "30m":
          millisecondsAgo = 30 * 60 * 1000;
          break;
        case "1h":
          millisecondsAgo = 60 * 60 * 1000;
          break;
        case "24h":
          millisecondsAgo = 24 * 60 * 60 * 1000;
          break;
        default:
          return null;
      }
      return Timestamp.fromMillis(now - millisecondsAgo);
    };

    const minTimestamp = getTimeFilterTimestamp(timeFilter);
    const now = Date.now();
    const fiveMinutesAgo = Timestamp.fromMillis(now - 5 * 60 * 1000);

    // HARD LIMIT: Maximum 50 records for safety (Free Tier protection)
    // Even with "all" filter, we only fetch 50 most recent records
    // This ensures quota safety: 10 refreshes = 500 reads max (1% of 50k daily limit)
    const DEFAULT_LIMIT = 50;
    const HARD_CAP = 100; // Absolute maximum, never exceed this
    
    // For stats calculation, we use a small limit
    // User can see most recent 50 records, which is enough for monitoring
    const MAX_STATS_RECORDS = Math.min(DEFAULT_LIMIT, HARD_CAP);

    // Build queries with orderBy and limit (no where clause to avoid index issues)
    // We'll filter by time in memory after fetching
    const visitsQuery = adminDb.collection("analytics_visits")
      .orderBy("timestamp", "desc")
      .limit(MAX_STATS_RECORDS);
    
    const loginsQuery = adminDb.collection("analytics_logins")
      .orderBy("timestamp", "desc")
      .limit(MAX_STATS_RECORDS);
    
    const dashboardVisitsQuery = adminDb.collection("analytics_dashboard_visits")
      .orderBy("timestamp", "desc")
      .limit(MAX_STATS_RECORDS);
    
    const activeUsersQuery = adminDb.collection("analytics_active_users")
      .where("lastSeen", ">", fiveMinutesAgo)
      .limit(MAX_STATS_RECORDS); // Limit for quota safety

    // Execute queries in parallel
    const [visitsSnapshot, loginsSnapshot, dashboardVisitsSnapshot, activeUsersSnapshot] = await Promise.all([
      visitsQuery.get(),
      loginsQuery.get(),
      dashboardVisitsQuery.get(),
      activeUsersQuery.get(),
    ]);

    interface FirestoreTimestamp {
      toDate?: () => Date;
      _seconds?: number;
    }

    interface VisitData {
      id: string;
      page?: string;
      timestamp?: FirestoreTimestamp | Date | string;
      sessionId?: string;
      deviceInfo?: string;
      ipAddress?: string;
      country?: string;
      countryCode?: string;
      [key: string]: unknown;
    }

    interface LoginData {
      id: string;
      timestamp?: FirestoreTimestamp | Date | string;
      userId?: string;
      userEmail?: string;
      [key: string]: unknown;
    }

    const visits = visitsSnapshot.docs.map((doc: any) => ({
  ------- SEARCH
    const logins = loginsSnapshot.docs.map(doc => ({
    const logins = loginsSnapshot.docs.map((doc: any) => ({
  ------- SEARCH
    const dashboardVisits = dashboardVisitsSnapshot.docs.map(doc => ({
    const dashboardVisits = dashboardVisitsSnapshot.docs.map((doc: any) => ({
  ------- SEARCH
    const microConversions = microConversionsSnapshot.docs.map(doc => ({
    const microConversions = microConversionsSnapshot.docs.map((doc: any) => ({
      ...doc.data(),
      id: doc.id,
    })) as VisitData[];

    const logins = loginsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as LoginData[];

    const dashboardVisits = dashboardVisitsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as LoginData[];

    const activeUsers = activeUsersSnapshot.docs;

    // Helper function to convert Firestore timestamp to ISO string
    const formatTimestamp = (timestamp: FirestoreTimestamp | Date | string | undefined): string => {
      if (!timestamp) return new Date().toISOString();
      
      // Check if it's a Date object
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      
      // Check if it's a string
      if (typeof timestamp === "string") {
        return new Date(timestamp).toISOString();
      }
      
      // Now TypeScript knows it's FirestoreTimestamp
      if (typeof timestamp === "object" && timestamp !== null) {
        if (typeof timestamp.toDate === "function") {
          return timestamp.toDate().toISOString();
        } else if (typeof timestamp._seconds === "number") {
          return new Date(timestamp._seconds * 1000).toISOString();
        }
      }
      
      // Fallback
      return new Date().toISOString();
    };

    // Filter events by time (for micro-conversions which we still fetch all)
    const filterByTime = <T extends { timestamp?: FirestoreTimestamp | Date | string }>(events: T[], minTime: number | null): T[] => {
      if (!minTime) return events;
      return events.filter(event => {
        const timestamp = event.timestamp;
        if (!timestamp) return false;
        
        let eventTime: number;
        
        // Check if it's a Date object
        if (timestamp instanceof Date) {
          eventTime = timestamp.getTime();
        }
        // Check if it's a string
        else if (typeof timestamp === "string") {
          eventTime = new Date(timestamp).getTime();
        }
        // Now TypeScript knows it's FirestoreTimestamp
        else if (typeof timestamp === "object" && timestamp !== null) {
          if (typeof timestamp.toDate === "function") {
            eventTime = timestamp.toDate().getTime();
          } else if (typeof timestamp._seconds === "number") {
            eventTime = timestamp._seconds * 1000;
          } else {
            return false;
          }
        } else {
          return false;
        }
        
        return eventTime >= minTime;
      });
    };

    const minTime = minTimestamp ? minTimestamp.toMillis() : null;

    // Filter visits by time and page in memory (more efficient than complex queries)
    let filteredVisits = visits;
    if (minTime) {
      filteredVisits = filterByTime(visits, minTime);
    }
    if (pageFilter !== "all") {
      filteredVisits = filteredVisits.filter(v => (v.page || "home") === pageFilter);
    }

    // Filter logins by time in memory
    let filteredLogins = logins;
    if (minTime) {
      filteredLogins = filterByTime(logins, minTime);
    }

    // Filter dashboard visits by time in memory
    let filteredDashboardVisits = dashboardVisits;
    if (minTime) {
      filteredDashboardVisits = filterByTime(dashboardVisits, minTime);
    }

    // Group by date for recent activity (use filtered data for accurate stats)
    const groupByDate = (events: Array<{ timestamp?: FirestoreTimestamp | Date | string }>) => {
      const grouped: { [key: string]: number } = {};
      events.forEach(event => {
        const timestamp = event.timestamp;
        if (!timestamp) return;
        
        let date: string;
        
        // Check if it's a Date object
        if (timestamp instanceof Date) {
          date = timestamp.toISOString().split('T')[0];
        }
        // Check if it's a string
        else if (typeof timestamp === "string") {
          date = new Date(timestamp).toISOString().split('T')[0];
        }
        // Now TypeScript knows it's FirestoreTimestamp
        else if (typeof timestamp === "object" && timestamp !== null) {
          if (typeof timestamp.toDate === "function") {
            date = timestamp.toDate().toISOString().split('T')[0];
          } else if (typeof timestamp._seconds === "number") {
            date = new Date(timestamp._seconds * 1000).toISOString().split('T')[0];
          } else {
            return;
          }
        } else {
          return;
        }
        
        grouped[date] = (grouped[date] || 0) + 1;
      });
      
      return Object.entries(grouped)
        .map(([timestamp, count]) => ({ timestamp, count }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 7); // Last 7 days
    };

    // Get visitor logs (already sorted by query, limit to 50 for display - quota safety)
    const visitorLogs = filteredVisits
      .slice(0, 50)
      .map(visit => ({
        id: visit.id,
        timestamp: formatTimestamp(visit.timestamp),
        page: visit.page || "home",
        sessionId: visit.sessionId || null,
        deviceInfo: visit.deviceInfo || null,
        ipAddress: visit.ipAddress || null,
        country: visit.country || null,
        countryCode: visit.countryCode || null,
      }));

    // Get login logs (already sorted by query, limit to 50 for display - quota safety)
    const loginLogs = filteredLogins
      .slice(0, 50)
      .map(login => ({
        id: login.id,
        timestamp: formatTimestamp(login.timestamp),
        userEmail: login.userEmail || null,
        userId: login.userId || null,
        sessionId: login.sessionId || null,
        deviceInfo: login.deviceInfo || null,
        ipAddress: login.ipAddress || null,
        country: login.country || null,
        countryCode: login.countryCode || null,
      }));

    // Get micro-conversions (limit to 50 for quota safety)
    const microConversionsSnapshot = await adminDb.collection("analytics_micro_conversions")
      .orderBy("timestamp", "desc")
      .limit(MAX_STATS_RECORDS)
      .get();
    
    interface MicroConversionData {
      id: string;
      type?: string;
      timestamp?: FirestoreTimestamp | Date | string;
      value?: number;
      page?: string;
      sessionId?: string;
      [key: string]: unknown;
    }

    const microConversions = microConversionsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as MicroConversionData[];

    // Filter micro-conversions by time in memory
    const filteredMicroConversions = minTime 
      ? filterByTime(microConversions, minTime)
      : microConversions;

    // Calculate micro-conversion metrics
    const pricingClicks = filteredMicroConversions.filter(mc => mc.type === "pricing_click").length;
    const ctaClicks = filteredMicroConversions.filter(mc => mc.type === "cta_click").length;
    
    const scrollDepths = filteredMicroConversions
      .filter(mc => mc.type === "scroll_depth" && mc.value !== undefined)
      .map(mc => mc.value as number);
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    const timeOnPages = filteredMicroConversions
      .filter(mc => mc.type === "time_on_page" && mc.value !== undefined)
      .map(mc => mc.value as number);
    const avgTimeOnPage = timeOnPages.length > 0
      ? Math.round(timeOnPages.reduce((a, b) => a + b, 0) / timeOnPages.length)
      : 0;

    // Scroll depth distribution
    const scrollDepthDistribution = [
      { range: "0-25%", count: scrollDepths.filter(d => d >= 0 && d <= 25).length },
      { range: "26-50%", count: scrollDepths.filter(d => d > 25 && d <= 50).length },
      { range: "51-75%", count: scrollDepths.filter(d => d > 50 && d <= 75).length },
      { range: "76-100%", count: scrollDepths.filter(d => d > 75 && d <= 100).length },
    ];

    const pricingClickRate = filteredVisits.length > 0
      ? Math.round((pricingClicks / filteredVisits.length) * 100 * 100) / 100
      : 0;

    // Calculate stats using filtered data for accurate counts
    const totalVisitorsForStats = timeFilter === "all" ? visits.length : filteredVisits.length;
    const totalLoginsForStats = timeFilter === "all" ? logins.length : filteredLogins.length;
    const totalDashboardVisitsForStats = timeFilter === "all" ? dashboardVisits.length : filteredDashboardVisits.length;
    const conversionRateForStats = totalLoginsForStats > 0 
      ? (totalDashboardVisitsForStats / totalLoginsForStats) * 100 
      : 0;

    const stats = {
      totalVisitors: totalVisitorsForStats,
      loginAttempts: totalLoginsForStats,
      activeUsers: activeUsers.length,
      dashboardVisits: totalDashboardVisitsForStats,
      conversionRate: Math.round(conversionRateForStats * 100) / 100,
      recentVisits: groupByDate(filteredVisits),
      recentLogins: groupByDate(filteredLogins),
      recentDashboardVisits: groupByDate(filteredDashboardVisits),
      visitorLogs,
      loginLogs,
      microConversions: {
        pricingClicks,
        avgScrollDepth,
        avgTimeOnPage,
        ctaClicks,
        pricingClickRate,
        scrollDepthDistribution,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    const err = error as { message?: string; code?: string; stack?: string };
    console.error("❌ Error getting analytics stats:", error);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      stack: err.stack?.split('\n').slice(0, 3),
    });
    return NextResponse.json(
      { 
        error: err.message || "Failed to fetch analytics stats",
        code: err.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}

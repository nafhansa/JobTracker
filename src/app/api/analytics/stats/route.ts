import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const timeFilter = searchParams.get("timeFilter") || "all"; // "5m", "15m", "30m", "1h", "24h", "all"
  const pageFilter = searchParams.get("pageFilter") || "all"; // "all", "home", "login", "dashboard"
  try {
    // Get all visits
    const visitsSnapshot = await adminDb.collection("analytics_visits").get();
    const visits = visitsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get all logins
    const loginsSnapshot = await adminDb.collection("analytics_logins").get();
    const logins = loginsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get all dashboard visits
    const dashboardVisitsSnapshot = await adminDb.collection("analytics_dashboard_visits").get();
    const dashboardVisits = dashboardVisitsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get active users (last seen within last 5 minutes)
    const activeUsersSnapshot = await adminDb.collection("analytics_active_users").get();
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    const activeUsers = activeUsersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const lastSeen = data.lastSeen;
      if (!lastSeen) return false;
      
      // Handle Firestore Timestamp
      let lastSeenTime: number;
      if (lastSeen.toMillis) {
        lastSeenTime = lastSeen.toMillis();
      } else if (lastSeen._seconds) {
        lastSeenTime = lastSeen._seconds * 1000;
      } else {
        lastSeenTime = new Date(lastSeen).getTime();
      }
      
      return lastSeenTime > fiveMinutesAgo;
    });

    // Calculate conversion rate
    const conversionRate = logins.length > 0 
      ? (dashboardVisits.length / logins.length) * 100 
      : 0;

    // Helper function to convert Firestore timestamp to ISO string
    const formatTimestamp = (timestamp: any): string => {
      if (!timestamp) return new Date().toISOString();
      if (timestamp.toDate) {
        return timestamp.toDate().toISOString();
      } else if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toISOString();
      } else {
        return new Date(timestamp).toISOString();
      }
    };

    // Helper function to get timestamp for time filter
    const getTimeFilterTimestamp = (filter: string): number | null => {
      const now = Date.now();
      switch (filter) {
        case "5m":
          return now - 5 * 60 * 1000;
        case "15m":
          return now - 15 * 60 * 1000;
        case "30m":
          return now - 30 * 60 * 1000;
        case "1h":
          return now - 60 * 60 * 1000;
        case "24h":
          return now - 24 * 60 * 60 * 1000;
        default:
          return null;
      }
    };

    // Filter events by time
    const filterByTime = (events: any[], minTime: number | null) => {
      if (!minTime) return events;
      return events.filter(event => {
        const timestamp = event.timestamp;
        if (!timestamp) return false;
        
        let eventTime: number;
        if (timestamp.toDate) {
          eventTime = timestamp.toDate().getTime();
        } else if (timestamp._seconds) {
          eventTime = timestamp._seconds * 1000;
        } else {
          eventTime = new Date(timestamp).getTime();
        }
        
        return eventTime >= minTime;
      });
    };

    const minTime = getTimeFilterTimestamp(timeFilter);

    // Group by date for recent activity
    const groupByDate = (events: any[]) => {
      const grouped: { [key: string]: number } = {};
      events.forEach(event => {
        const timestamp = event.timestamp;
        if (!timestamp) return;
        
        let date: string;
        if (timestamp.toDate) {
          date = timestamp.toDate().toISOString().split('T')[0];
        } else if (timestamp._seconds) {
          date = new Date(timestamp._seconds * 1000).toISOString().split('T')[0];
        } else {
          date = new Date(timestamp).toISOString().split('T')[0];
        }
        
        grouped[date] = (grouped[date] || 0) + 1;
      });
      
      return Object.entries(grouped)
        .map(([timestamp, count]) => ({ timestamp, count }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 7); // Last 7 days
    };

    // Filter visits by time and page
    let filteredVisits = filterByTime(visits, minTime);
    if (pageFilter !== "all") {
      filteredVisits = filteredVisits.filter(v => (v.page || "home") === pageFilter);
    }

    // Get visitor logs (most recent first, limit to 200)
    const visitorLogs = filteredVisits
      .map(visit => ({
        id: visit.id,
        timestamp: formatTimestamp(visit.timestamp),
        page: visit.page || "home",
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 200);

    // Filter logins by time
    const filteredLogins = filterByTime(logins, minTime);

    // Get login logs (most recent first, limit to 200)
    const loginLogs = filteredLogins
      .map(login => ({
        id: login.id,
        timestamp: formatTimestamp(login.timestamp),
        userEmail: login.userEmail || null,
        userId: login.userId || null,
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 200);

    const stats = {
      totalVisitors: visits.length,
      loginAttempts: logins.length,
      activeUsers: activeUsers.length,
      dashboardVisits: dashboardVisits.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentVisits: groupByDate(visits),
      recentLogins: groupByDate(logins),
      recentDashboardVisits: groupByDate(dashboardVisits),
      visitorLogs,
      loginLogs,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error getting analytics stats:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

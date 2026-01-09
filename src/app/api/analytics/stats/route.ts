import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
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

    const stats = {
      totalVisitors: visits.length,
      loginAttempts: logins.length,
      activeUsers: activeUsers.length,
      dashboardVisits: dashboardVisits.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentVisits: groupByDate(visits),
      recentLogins: groupByDate(logins),
      recentDashboardVisits: groupByDate(dashboardVisits),
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

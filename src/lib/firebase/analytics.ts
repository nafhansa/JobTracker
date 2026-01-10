import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const VISITS_COLLECTION = "analytics_visits";
const LOGINS_COLLECTION = "analytics_logins";
const DASHBOARD_VISITS_COLLECTION = "analytics_dashboard_visits";
const ACTIVE_USERS_COLLECTION = "analytics_active_users";

/**
 * Track page visit
 */
export const trackPageVisit = async (page?: string) => {
  try {
    await addDoc(collection(db, VISITS_COLLECTION), {
      type: "visit",
      page: page || "home",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error tracking page visit:", error);
  }
};

/**
 * Track login attempt
 */
export const trackLoginAttempt = async (userId?: string, userEmail?: string) => {
  try {
    await addDoc(collection(db, LOGINS_COLLECTION), {
      type: "login",
      userId: userId || null,
      userEmail: userEmail || null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error tracking login attempt:", error);
  }
};

/**
 * Track dashboard visit
 */
export const trackDashboardVisit = async (userId: string, userEmail?: string) => {
  try {
    // Track dashboard visit
    await addDoc(collection(db, DASHBOARD_VISITS_COLLECTION), {
      type: "dashboard",
      userId,
      userEmail: userEmail || null,
      timestamp: serverTimestamp(),
    });

    // Update active user
    await updateActiveUser(userId, userEmail);
  } catch (error) {
    console.error("Error tracking dashboard visit:", error);
  }
};

/**
 * Update active user status
 */
export const updateActiveUser = async (userId: string, userEmail?: string) => {
  try {
    // Check if user already exists in active users
    const activeUsersRef = collection(db, ACTIVE_USERS_COLLECTION);
    const q = query(activeUsersRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Add new active user
      await addDoc(activeUsersRef, {
        userId,
        userEmail: userEmail || null,
        lastSeen: serverTimestamp(),
      });
    } else {
      // Update existing user's lastSeen
      const doc = snapshot.docs[0];
      const { updateDoc, doc: docRef } = await import("firebase/firestore");
      await updateDoc(docRef(db, ACTIVE_USERS_COLLECTION, doc.id), {
        lastSeen: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating active user:", error);
  }
};

/**
 * Get analytics stats (server-side only, via API)
 */
export const getAnalyticsStats = async () => {
  try {
    // Get all visits
    const visitsSnapshot = await getDocs(collection(db, VISITS_COLLECTION));
    const visits = visitsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get all logins
    const loginsSnapshot = await getDocs(collection(db, LOGINS_COLLECTION));
    const logins = loginsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get all dashboard visits
    const dashboardVisitsSnapshot = await getDocs(collection(db, DASHBOARD_VISITS_COLLECTION));
    const dashboardVisits = dashboardVisitsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Get active users (last seen within last 5 minutes)
    const activeUsersRef = collection(db, ACTIVE_USERS_COLLECTION);
    const activeUsersSnapshot = await getDocs(activeUsersRef);
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    const activeUsers = activeUsersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const lastSeen = data.lastSeen;
      if (!lastSeen) return false;
      
      // Handle Firestore Timestamp
      const lastSeenTime = lastSeen.toMillis ? lastSeen.toMillis() : new Date(lastSeen).getTime();
      return lastSeenTime > fiveMinutesAgo;
    });

    // Calculate conversion rate
    const conversionRate = logins.length > 0 
      ? (dashboardVisits.length / logins.length) * 100 
      : 0;

    // Group by date for recent activity
    const groupByDate = (events: Array<{ timestamp?: { toDate?: () => Date } | Date | string; [key: string]: unknown }>) => {
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
        // Check if it's an object with toDate method
        else if (typeof timestamp === "object" && timestamp !== null && typeof timestamp.toDate === "function") {
          date = timestamp.toDate().toISOString().split('T')[0];
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

    return {
      totalVisitors: visits.length,
      loginAttempts: logins.length,
      activeUsers: activeUsers.length,
      dashboardVisits: dashboardVisits.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentVisits: groupByDate(visits),
      recentLogins: groupByDate(logins),
      recentDashboardVisits: groupByDate(dashboardVisits),
    };
  } catch (error) {
    console.error("Error getting analytics stats:", error);
    throw error;
  }
};

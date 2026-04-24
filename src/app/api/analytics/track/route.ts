import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getClientIP, getCountryFromIP } from "@/lib/geo-cache";

export async function POST(req: Request) {
  let type: string | undefined;
  try {
    const body = await req.json();
    type = body.type;
    const { userId, userEmail, page, sessionId, deviceInfo } = body;

    // Get IP address and country
    const ipAddress = getClientIP(req);
    const geoInfo = await getCountryFromIP(ipAddress);

    if (!type || !["visit", "login", "dashboard"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    const timestamp = new Date();

    // Store event in appropriate collection
    let collectionPath = "";
    interface EventData {
      type: string;
      timestamp: Date;
      sessionId?: string;
      deviceInfo?: string;
      ipAddress?: string;
      country?: string;
      countryCode?: string;
      page?: string;
      userId?: string;
      userEmail?: string;
    }
    const eventData: EventData = {
      type,
      timestamp,
    };

    // Add session ID, device info, IP, and country to all events
    if (sessionId) eventData.sessionId = sessionId;
    if (deviceInfo) eventData.deviceInfo = deviceInfo;
    if (ipAddress && ipAddress !== "unknown") eventData.ipAddress = ipAddress;
    if (geoInfo.country) eventData.country = geoInfo.country;
    if (geoInfo.countryCode) eventData.countryCode = geoInfo.countryCode;

    // Write directly to Firebase (analytics needs to be fast)
    switch (type) {
      case "visit":
        collectionPath = "analytics_visits";
        eventData.page = page || "home";
        break;
      case "login":
        collectionPath = "analytics_logins";
        if (userId) eventData.userId = userId;
        if (userEmail) eventData.userEmail = userEmail;
        break;
      case "dashboard":
        collectionPath = "analytics_dashboard_visits";
        if (!userId) {
          return NextResponse.json(
            { error: "userId required for dashboard events" },
            { status: 400 }
          );
        }
        eventData.userId = userId;
        if (userEmail) eventData.userEmail = userEmail;

        // Also update active users (only if Firebase Admin is initialized)
        if (adminDb) {
          try {
            const activeUsersRef = adminDb.collection("analytics_active_users");
            const existingUser = await activeUsersRef
              .where("userId", "==", userId)
              .limit(1)
              .get();

            if (existingUser.empty) {
              await activeUsersRef.add({
                userId,
                userEmail: userEmail || null,
                lastSeen: timestamp,
              });
            } else {
              const doc = existingUser.docs[0];
              await doc.ref.update({
                lastSeen: timestamp,
              });
            }
          } catch (error) {
            console.warn("⚠️ Failed to update active users:", error);
          }
        }
        break;
    }

    // Add event to Firebase collection (only if Firebase Admin is initialized)
    try {
      if (!adminDb) {
        console.warn("⚠️ Firebase Admin not initialized, skipping analytics tracking");
        return NextResponse.json({ success: true, skipped: "Firebase not initialized" });
      }

      const eventsRef = adminDb.collection(collectionPath);
      await eventsRef.add(eventData);
    } catch (firebaseError) {
      console.error("Firebase tracking error:", firebaseError);
      // Don't throw - analytics failures shouldn't break the app
      return NextResponse.json({ success: true, warning: "Analytics tracking failed" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { message?: string; code?: string };
    console.error("❌ Error tracking analytics event:", error);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      type: type,
    });
    return NextResponse.json(
      { 
        error: err.message || "Failed to track analytics event",
        code: err.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}

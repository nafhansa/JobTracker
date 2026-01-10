import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// Helper function to get IP address from request
function getClientIP(req: Request): string {
  // Check various headers for IP (in order of preference)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "unknown";
}

// Helper function to get country from IP using ip-api.com (free, no API key)
async function getCountryFromIP(ip: string): Promise<{ country?: string; countryCode?: string }> {
  // Skip if IP is localhost or unknown
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "::1") {
    return {};
  }

  try {
    // Using ip-api.com (free, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        return {
          country: data.country,
          countryCode: data.countryCode,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching country from IP:", error);
  }
  
  return {};
}

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

        // Also update active users
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
        break;
    }

    // Add event to collection
    const eventsRef = adminDb.collection(collectionPath);
    await eventsRef.add(eventData);

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

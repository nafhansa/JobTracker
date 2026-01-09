import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { AnalyticsEventType } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, userId, userEmail, page } = body;

    if (!type || !["visit", "login", "dashboard"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    const timestamp = new Date();

    // Store event in appropriate collection
    let collectionPath = "";
    const eventData: any = {
      type,
      timestamp,
    };

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
  } catch (error: any) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

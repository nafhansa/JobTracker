import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth"; // Jika pakai cookie session, sesuaikan auth check-nya

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    // 1. Cek Credentials FastSpring di ENV
    const username = process.env.FASTSPRING_USERNAME;
    const password = process.env.FASTSPRING_PASSWORD;

    if (!username || !password) {
      console.error("❌ FastSpring API Credentials missing");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Panggil API FastSpring untuk Cancel (DELETE request)
    // Dokumentasi: DELETE /subscriptions/{id}
    const response = await fetch(`https://api.fastspring.com/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ FastSpring API Error:", errorText);
      return NextResponse.json({ error: "Failed to cancel subscription at FastSpring" }, { status: response.status });
    }

    // 3. Update Status di Firebase (Optimistic Update)
    // Sebenarnya Webhook 'subscription.canceled' akan masuk nanti, 
    // tapi kita update status jadi 'canceled' (pending end of period) biar UI langsung berubah.
    
    // Cari user pemilik subscription ini
    const usersSnapshot = await adminDb
      .collection("users")
      .where("subscription.fastspringId", "==", subscriptionId)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userRef = usersSnapshot.docs[0].ref;
      await userRef.update({
        "subscription.status": "cancelled", // Status 'cancelled' berarti aktif sampai periode habis
      });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Cancel API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
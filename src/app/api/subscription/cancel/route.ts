// /home/nafhan/Documents/projek/job/src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const username = process.env.FASTSPRING_API_USERNAME;
    const password = process.env.FASTSPRING_API_PASSWORD;

    if (!username || !password) {
      console.error("❌ FastSpring API Credentials missing");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // 1. Cancel di FastSpring
    const response = await fetch(`https://api.fastspring.com/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok && response.status !== 404 && response.status !== 400) {
      return NextResponse.json({ error: "Failed to cancel at FastSpring" }, { status: response.status });
    }

    // Ambil data JSON dari FastSpring (opsional, untuk tanggal)
    const fastSpringData = await response.json().catch(() => null);

    // 2. Update Firebase
    const usersSnapshot = await adminDb
      .collection("users")
      .where("subscription.fastspringId", "==", subscriptionId)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userRef = userDoc.ref;

      // --- LOGIC PENTING: Tentukan kapan akses berakhir ---
      let endDate = null;

      // Opsi A: Ambil dari FastSpring (deactivationDate)
      if (fastSpringData && fastSpringData.deactivationDate) {
          endDate = new Date(fastSpringData.deactivationDate).toISOString();
      }
      // Opsi B: Ambil dari 'renewsAt' user saat ini (Tanggal tagihan berikutnya jadi tanggal putus)
      else if (userData.subscription?.renewsAt) {
          // Konversi Firestore Timestamp ke ISO String
          const renewsAtTimestamp = userData.subscription.renewsAt;
          endDate = new Date(renewsAtTimestamp.seconds * 1000).toISOString();
      }
      // Opsi C: Fallback hari ini
      else {
          endDate = new Date().toISOString();
      }

      await userRef.update({
        "subscription.status": "canceled",
        "subscription.renewsAt": null, // Hapus tanggal tagihan
        "subscription.endsAt": endDate, // ✅ SIMPAN TANGGAL INI AGAR UI TETAP PRO
        "updatedAt": new Date().toISOString()
      });
      
      console.log(`✅ Sub cancelled. Access until: ${endDate}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Cancel API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
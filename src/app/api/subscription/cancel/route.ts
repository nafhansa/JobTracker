import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const username = process.env.FASTSPRING_USERNAME;
    const password = process.env.FASTSPRING_PASSWORD;

    if (!username || !password) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // 1. Panggil FastSpring untuk Cancel
    const response = await fetch(`https://api.fastspring.com/subscriptions/${subscriptionId}`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deactivation: "cancel" }),
    });

    if (!response.ok) {
        // Handle case jika sudah tercancel di FastSpring tapi DB kita belum sync
        if(response.status !== 404 && response.status !== 400) {
             const errorText = await response.text();
             console.error("FastSpring Cancel Error:", errorText);
             return NextResponse.json({ error: "Failed to cancel" }, { status: response.status });
        }
    }

    const fastSpringData = await response.json().catch(() => null);

    // 2. Ambil data user sekarang untuk tahu kapan tanggal renew terakhirnya
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Tentukan tanggal berakhir (Grace Period)
    // Prioritas: Ambil dari response API FastSpring (deactivationDate) -> Atau ambil dari renewsAt yang ada di DB -> Atau hari ini
    let endDate = null;
    
    // Coba ambil dari FastSpring return payload
    if (fastSpringData && fastSpringData.deactivationDate) {
        endDate = new Date(fastSpringData.deactivationDate).toISOString();
    } 
    // Jika tidak ada, pakai 'renewsAt' yang sudah tersimpan di database (tanggal tagihan berikutnya)
    else if (userData.subscription?.renewsAt) {
        endDate = userData.subscription.renewsAt;
    } 
    // Fallback terakhir (jarang terjadi)
    else {
        endDate = new Date().toISOString(); 
    }

    // 4. Update Firebase: Status Cancelled, tapi isi endsAt!
    await userRef.update({
      "subscription.status": "cancelled",
      "subscription.renewsAt": null, // Tidak akan perpanjang lagi
      "subscription.endsAt": endDate, // ✅ INI KUNCINYA: Akses tetap ada sampai tanggal ini
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Cancel API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
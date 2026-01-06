import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";

const FASTSPRING_WEBHOOK_SECRET = process.env.FASTSPRING_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    if (!FASTSPRING_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "FASTSPRING_WEBHOOK_SECRET not set" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("X-FS-Signature") || "";

    // 1. Verifikasi signature (Wajib)
    const expectedSignature = crypto
      .createHmac("sha256", FASTSPRING_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // ============================================================
    // 🔥 DEBUGGING LOG: Tempel baris ini untuk melihat isi data asli
    // ============================================================
    console.log("🔥 DEBUG FULL PAYLOAD:", JSON.stringify(payload, null, 2));
    
    const events = payload.events;

    for (const event of events) {
      // Prioritas 1: Ambil ID dari Tags atau Reference
      let userId = event.data.buyerReference || event.data.tags?.user_id;
      let userRef;

      // --- LOGIKA PENCARIAN EMAIL ---
      if (!userId) {
        // Coba ambil email. Note: Nanti cek di LOG Vercel apakah posisinya benar di event.data.customer.email
        const customerEmail = event.data.customer?.email || event.data.recipient?.email || event.data.contact?.email;
        
        if (customerEmail) {
          console.log(`User ID kosong. Mencoba mencari via email: ${customerEmail}`);
          
          // Query ke Firestore: Siapa user yang punya email ini?
          const usersSnapshot = await adminDb
            .collection("users")
            .where("email", "==", customerEmail)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            // KETEMU! Kita pakai ID asli dari database
            const userDoc = usersSnapshot.docs[0];
            userId = userDoc.id; 
            console.log(`User ditemukan via email! Menggunakan ID: ${userId}`);
          } else {
            console.error(`Email ${customerEmail} tidak ditemukan di database users.`);
            continue; // Kalau email gak ketemu juga, skip
          }
        } else {
          // Kalau masuk sini, berarti kodingan di atas gagal nemu field email di dalam JSON
          console.warn("Webhook event skip: Tidak ada ID dan tidak ada Email.", event.id);
          continue; 
        }
      }
      // ----------------------------------------------------

      // Definisikan userRef setelah kita PASTI punya userId
      userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        case "order.completed": {
          // Cek apakah ini langganan bulanan
          const isSubscriptionOrder = event.data.items?.some((item: any) => item.subscription);

          if (isSubscriptionOrder) {
             console.log("Order completed skip: Ini adalah order subscription.");
             continue;
          }

          // UPDATE FIREBASE UNTUK LIFETIME
          await userRef.set({
            isPro: true,
            subscription: {
              plan: "lifetime",
              status: "active",
              provider: "fastspring",
              fastspringId: event.data.id, 
              renewsAt: null,
              endsAt: null,
              customerPortalUrl: null,
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          console.log(`SUCCESS: User ${userId} active LIFETIME.`);
          break;
        }

        case "subscription.activated": {
          // UPDATE FIREBASE UNTUK BULANAN
          await userRef.set({
            isPro: true,
            subscription: {
              plan: "monthly", 
              status: "active",
              provider: "fastspring",
              fastspringId: event.data.id,
              renewsAt: event.data.next, 
              endsAt: event.data.end, 
              customerPortalUrl: event.data.accountManagementUrl, 
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });

          console.log(`SUCCESS: User ${userId} active MONTHLY.`);
          break;
        }

        case "subscription.deactivated":
        case "subscription.canceled": {
          await userRef.set({
            isPro: false,
            subscription: {
              status: event.data.state, 
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          break;
        }
        
        default:
          break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
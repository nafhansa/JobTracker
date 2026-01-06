// src/app/api/webhook/route.ts
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

    // 1. Verifikasi signature dari FastSpring (KEAMANAN)
    const expectedSignature = crypto
      .createHmac("sha256", FASTSPRING_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const events = payload.events;

    for (const event of events) {
      // Prioritas 1: Ambil ID dari Tags atau Reference
      let userId = event.data.buyerReference || event.data.tags?.user_id;
      let userRef;

      // --- PLAN B: Jika ID Kosong, Cari User via Email ---
      if (!userId) {
        const customerEmail = event.data.customer?.email;
        
        if (customerEmail) {
          console.log(`User ID kosong. Mencoba mencari via email: ${customerEmail}`);
          
          // Query ke Firestore cari user dengan email ini
          const usersSnapshot = await adminDb
            .collection("users")
            .where("email", "==", customerEmail)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            // KETEMU! Pakai ID user yang ada di database
            const userDoc = usersSnapshot.docs[0];
            userId = userDoc.id; 
            console.log(`User ditemukan via email! Menggunakan ID: ${userId}`);
          } else {
            console.error(`Gawat! Email ${customerEmail} tidak ditemukan di database users.`);
            continue; // Skip event ini karena user tidak ketemu
          }
        } else {
          console.warn("Webhook event skip: Tidak ada ID dan tidak ada Email.", event.id);
          continue; 
        }
      }
      // ----------------------------------------------------

      userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        case "order.completed": {
          // Cek apakah di dalam item ada field 'subscription'
          // Jika ada, berarti ini langganan bulanan (jangan diproses sebagai lifetime)
          const isSubscriptionOrder = event.data.items?.some((item: any) => item.subscription);

          if (isSubscriptionOrder) {
             console.log("Order completed skip: Ini adalah order subscription (akan dihandle event subscription.activated)");
             continue;
          }

          // PROSES LIFETIME
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
          // PROSES BULANAN
          await userRef.set({
            isPro: true,
            subscription: {
              plan: "monthly", 
              status: "active",
              provider: "fastspring",
              fastspringId: event.data.id,
              renewsAt: event.data.next, // Tanggal tagihan berikutnya (timestamp)
              endsAt: event.data.end, 
              customerPortalUrl: event.data.accountManagementUrl, // URL buat user manage langganan
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });

          console.log(`SUCCESS: User ${userId} active MONTHLY.`);
          break;
        }

        case "subscription.deactivated":
        case "subscription.canceled": {
          // PROSES PEMBATALAN
          await userRef.set({
            isPro: false,
            subscription: {
              status: event.data.state, // 'deactivated' atau 'canceled'
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          console.log(`User ${userId} subscription CANCELED/DEACTIVATED.`);
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
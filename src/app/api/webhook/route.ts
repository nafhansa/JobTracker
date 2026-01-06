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

    const expectedSignature = crypto
      .createHmac("sha256", FASTSPRING_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("🔥 DEBUG PAYLOAD TYPE:", payload.events?.[0]?.type);

    const events = payload.events;

    for (const event of events) {
      let userId = event.data.buyerReference || event.data.tags?.user_id;
      let userRef;

      // ==========================================
      // 🕵️‍♂️ LOGIC PENCARIAN USER (DIPERBARUI)
      // ==========================================
      
      // 1. Jika UserId belum ketemu, Coba cari via Subscription ID (FastSpring ID)
      // Ini berguna untuk event 'subscription.activated' yang TIDAK punya email di payloadnya
      if (!userId && (event.data.subscription || event.data.id)) {
        const subId = event.data.subscription || event.data.id;
        console.log(`Mencari user dengan FastSpring Subscription ID: ${subId}`);
        
        const snapshot = await adminDb
          .collection("users")
          .where("subscription.fastspringId", "==", subId)
          .limit(1)
          .get();
          
        if (!snapshot.empty) {
          userId = snapshot.docs[0].id;
          console.log(`✅ User ditemukan via Subscription ID: ${userId}`);
        }
      }

      // 2. Jika masih belum ketemu, Coba cari via Email
      // Ini biasanya didapat dari event 'order.completed'
      if (!userId) {
        const customerEmail = event.data.customer?.email || event.data.recipient?.email || event.data.contact?.email;
        
        if (customerEmail) {
          console.log(`Mencari user via email: ${customerEmail}`);
          const usersSnapshot = await adminDb
            .collection("users")
            .where("email", "==", customerEmail)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            userId = usersSnapshot.docs[0].id;
            console.log(`✅ User ditemukan via Email: ${userId}`);
          } else {
            console.error(`❌ Email ${customerEmail} tidak ditemukan di database.`);
            // Kita tidak continue disini, biarkan logic switch case memutuskan apakah ini order baru atau bukan
          }
        }
      }

      // Jika UserId masih null, kita cek apakah ini order baru yang perlu dibuat usernya?
      // (Opsional, tergantung logic app kamu. Disini kita asumsikan user SUDAH daftar via Auth)
      if (!userId) {
          console.warn(`⚠️ SKIP: Tidak bisa mengidentifikasi User untuk Event ID: ${event.id}`);
          continue; 
      }

      userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        // ==========================================
        // 🛒 ORDER COMPLETED (Kunci Utama)
        // ==========================================
        case "order.completed": {
          // HAPUS LOGIC SKIP SUBSCRIPTION DISINI.
          // Kita butuh event ini jalan karena event inilah yang membawa EMAIL.
          
          const items = event.data.items || [];
          const subscriptionItem = items.find((item: any) => item.subscription);
          
          if (subscriptionItem) {
            // Ini Order Subscription Baru
            console.log(`Processing New Subscription Order for User: ${userId}`);
            
            await userRef.set({
              isPro: true,
              subscription: {
                plan: "monthly", // Asumsi default, atau cek product path
                status: "active",
                provider: "fastspring",
                fastspringId: subscriptionItem.subscription, // PENTING: Simpan ID ini buat lookup nanti
                renewsAt: null, // Nanti diupdate oleh event subscription.activated
                endsAt: null,
              },
              updatedAt: new Date().toISOString()
            }, { merge: true });

          } else {
            // Ini Lifetime Deal (Non-subscription)
            await userRef.set({
              isPro: true,
              subscription: {
                plan: "lifetime",
                status: "active",
                provider: "fastspring",
                fastspringId: event.data.id, 
              },
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          console.log(`SUCCESS: Order Processed for ${userId}`);
          break;
        }

        // ==========================================
        // 📅 SUBSCRIPTION EVENTS
        // ==========================================
        case "subscription.activated": 
        case "subscription.charge.completed": {
            // Event ini mungkin tidak punya email, tapi karena step 'order.completed'
            // sudah menyimpan fastspringId ke DB, logic pencarian ID di atas harusnya berhasil.
            
            await userRef.set({
            isPro: true,
            subscription: {
              status: "active",
              // Pastikan update tanggal perpanjangan
              renewsAt: event.data.next || event.data.nextChargeDate, 
              endsAt: event.data.end, 
              fastspringId: event.data.id, // Update ID lagi untuk memastikan
              customerPortalUrl: event.data.accountManagementUrl || null
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });

          console.log(`SUCCESS: Subscription Activated/Updated for ${userId}`);
          break;
        }

        case "subscription.deactivated":
        case "subscription.canceled": {
          await userRef.set({
            isPro: false,
            subscription: {
              status: event.data.state || "canceled", 
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`SUCCESS: Subscription Canceled for ${userId}`);
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
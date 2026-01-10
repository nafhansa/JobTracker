// /home/nafhan/Documents/projek/job/src/app/api/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";

const FASTSPRING_WEBHOOK_SECRET = process.env.FASTSPRING_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    if (!FASTSPRING_WEBHOOK_SECRET) {
      console.error("❌ FASTSPRING_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("X-FS-Signature") || "";

    // 1. Validasi Signature
    const expectedSignature = crypto
      .createHmac("sha256", FASTSPRING_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.warn("⚠️ Invalid Webhook Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    const events = payload.events;

    for (const event of events) {
      let userId = event.data.buyerReference || event.data.tags?.user_id;
      let userRef;

      // ==========================================
      // 🕵️‍♂️ LOGIC PENCARIAN USER
      // ==========================================
      
      // 1. Coba cari via Subscription ID (FastSpring ID)
      if (!userId && (event.data.subscription || event.data.id)) {
        const subId = event.data.subscription || event.data.id;
        const snapshot = await adminDb
          .collection("users")
          .where("subscription.fastspringId", "==", subId)
          .limit(1)
          .get();
          
        if (!snapshot.empty) {
          userId = snapshot.docs[0].id;
          console.log(`✅ User found via Subscription ID: ${userId}`);
        }
      }

      // 2. Coba cari via Email
      if (!userId) {
        const customerEmail = event.data.customer?.email || event.data.recipient?.email || event.data.contact?.email;
        
        if (customerEmail) {
          const usersSnapshot = await adminDb
            .collection("users")
            .where("email", "==", customerEmail)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            userId = usersSnapshot.docs[0].id;
            console.log(`✅ User found via Email: ${userId}`);
          } else if (event.type === 'order.completed') {
            // JIKA TIDAK ADA USER & INI ORDER BARU -> BUAT USER BARU
            console.log(`User not found for ${customerEmail}, creating new user...`);
            const newUserId = crypto.randomUUID(); 
            userId = newUserId;
            userRef = adminDb.collection("users").doc(newUserId);
            await userRef.set({
              uid: newUserId,
              email: customerEmail,
              createdAt: new Date().toISOString(),
              subscription: null,
            });
          }
        }
      }

      // Jika UserId masih tidak ketemu, skip event ini
      if (!userId) {
          console.warn(`⚠️ SKIP: Cannot identify User for Event ID: ${event.id}`);
          continue; 
      }

      userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        // ==========================================
        // 🛒 ORDER COMPLETED
        // ==========================================
        case "order.completed": {
          const items = event.data.items || [];
          interface WebhookItem {
            subscription?: unknown;
          }
          const subscriptionItem = items.find((item: WebhookItem) => item.subscription);
          
          if (subscriptionItem) {
            // SUBSCRIPTION BARU
            await userRef.set({
              isPro: true,
              subscription: {
                plan: "monthly",
                status: "active",
                provider: "fastspring",
                fastspringId: subscriptionItem.subscription,
              },
              updatedAt: new Date().toISOString()
            }, { merge: true });

          } else {
            // LIFETIME DEAL
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
        // 📅 SUBSCRIPTION RENEWAL / CHARGE
        // ==========================================
        case "subscription.activated": 
        case "subscription.charge.completed": {
          const nextChargeTimestamp = event.data.next || event.data.nextChargeDate;
          const nextChargeDate = nextChargeTimestamp ? new Date(nextChargeTimestamp).toISOString() : null;

          await userRef.set({
            isPro: true,
            subscription: {
              status: "active",
              renewsAt: nextChargeDate, 
              fastspringId: event.data.id,
              endsAt: null // Reset endsAt kalau user renew atau aktif lagi
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });

          console.log(`SUCCESS: Subscription Active/Renewed for ${userId}`);
          break;
        }

        // ==========================================
        // ❌ CANCELLATION / DEACTIVATION (FIXED HERE)
        // ==========================================
        case "subscription.deactivated":
        case "subscription.canceled": {
          // FastSpring mengirim 'deactivationDate' (timestamp masa depan) jika ini user cancel manual
          // atau tanggal hari ini jika gagal bayar/expired.
          const deactivationDateRaw = event.data.deactivationDate || event.data.endsAt;
          
          let endsAtDate = null;
          let isProStatus = false;

          // Cek tanggal berakhirnya
          if (deactivationDateRaw) {
            endsAtDate = new Date(deactivationDateRaw).toISOString();
            
            // LOGIC PENTING: Jika tanggal deactivation masih di masa depan, user MASIH PRO
            if (new Date(endsAtDate) > new Date()) {
                isProStatus = true;
                console.log(`ℹ️ User ${userId} cancelled but has access until ${endsAtDate}`);
            } else {
                isProStatus = false;
                console.log(`ℹ️ User ${userId} subscription fully expired/deactivated now.`);
            }
          } else {
            // Jika tidak ada tanggal, anggap expired sekarang
            isProStatus = false;
            endsAtDate = new Date().toISOString();
          }

          await userRef.set({
            isPro: isProStatus, // Tetap true jika masih dalam grace period
            subscription: {
              status: "canceled", // Konsisten gunakan satu 'l'
              renewsAt: null,     // Tidak ada renewal
              endsAt: endsAtDate  // Simpan tanggal berakhir
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          console.log(`SUCCESS: Subscription status updated to 'canceled' for ${userId}`);
          break;
        }
        
        default:
          console.log(`ℹ️ Unhandled Event Type: ${event.type}`);
          break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as { message?: string };
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
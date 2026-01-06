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
      // 🕵️‍♂️ LOGIC PENCARIAN USER
      // ==========================================
      
      // 1. Coba cari via Subscription ID (FastSpring ID)
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

      // 2. Coba cari via Email
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
            // JIKA TIDAK ADA USER, DAN EVENTNYA ADALAH PEMBELIAN BARU, BUAT USER BARU
            if (event.type === 'order.completed') {
              console.log(`User baru dengan email ${customerEmail}, membuat user baru...`);
              // Kita akan gunakan email sebagai ID sementara, atau generate ID baru
              const newUserId = crypto.randomUUID(); 
              userId = newUserId;
              userRef = adminDb.collection("users").doc(newUserId);
              await userRef.set({
                uid: newUserId, // Ini akan diupdate saat user login pertama kali
                email: customerEmail,
                createdAt: new Date().toISOString(),
                subscription: null, // Inisialisasi subscription
              });
              console.log(`✅ User baru berhasil dibuat dengan ID: ${newUserId}`);
            } else {
              console.error(`❌ Email ${customerEmail} tidak ditemukan di database.`);
            }
          }
        }
      }

      // Jika UserId masih null, skip event ini
      if (!userId) {
          console.warn(`⚠️ SKIP: Tidak bisa mengidentifikasi User untuk Event ID: ${event.id}`);
          continue; 
      }

      userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        // ==========================================
        // 🛒 ORDER COMPLETED
        // ==========================================
        case "order.completed": {
          const items = event.data.items || [];
          const subscriptionItem = items.find((item: any) => item.subscription);
          
          if (subscriptionItem) {
            // ORDER SUBSCRIPTION BARU
            console.log(`Processing New Subscription Order for User: ${userId}`);
            
            await userRef.set({
              isPro: true,
              subscription: {
                plan: "monthly",
                status: "active",
                provider: "fastspring",
                fastspringId: subscriptionItem.subscription, // ID disimpan disini
                // ⚠️ PERUBAHAN: renewsAt & endsAt DIHAPUS dari sini
                // Biarkan event 'subscription.activated' yang mengurus tanggalnya.
                // Agar tidak terjadi race condition yang membuat tanggal jadi null.
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
        // 📅 SUBSCRIPTION EVENTS (ACTIVATED / CHARGED)
        // ==========================================
        case "subscription.activated": 
        case "subscription.charge.completed": {
          // Ambil tanggal next charge dari payload
          const nextChargeTimestamp = event.data.next || event.data.nextChargeDate;
          // Format ke ISO String agar frontend mudah membacanya
          const nextChargeDate = nextChargeTimestamp ? new Date(nextChargeTimestamp).toISOString() : null;

          await userRef.set({
            isPro: true,
            subscription: {
              status: "active",
              renewsAt: nextChargeDate, // ✅ Tanggal diupdate disini
              fastspringId: event.data.id,
              // customerPortalUrl: event.data.accountManagementUrl || null // Optional jika ada
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });

          console.log(`SUCCESS: Subscription Date Updated for ${userId} to ${nextChargeDate}`);
          break;
        }

        // ==========================================
        // ❌ CANCELLATION / DEACTIVATION
        // ==========================================
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

    const subscriptionData: any = {
      status: data.attributes.status,
      plan: planName,
      fastspringId: data.attributes.first_subscription_item.subscription_id,
      orderId: data.attributes.order_id,
      productId: data.attributes.product_id,
      renewsAt: data.attributes.renews_at ? new Date(data.attributes.renews_at) : null,
      endsAt: data.attributes.ends_at ? new Date(data.attributes.ends_at) : null,
      trialEndsAt: data.attributes.trial_ends_at ? new Date(data.attributes.trial_ends_at) : null,
      customerPortalUrl: data.attributes.urls.customer_portal,
      updatedAt: new Date().toISOString(),
    };

    // 2. Update data user di Firestore
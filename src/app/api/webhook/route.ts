// src/app/api/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "LEMONSQUEEZY_WEBHOOK_SECRET not set" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const hmac = crypto.createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    
    if (!crypto.timingSafeEqual(digest, Buffer.from(signature, "utf8"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { meta, data } = payload;
    const eventName = meta.event_name;
    const userId = meta.custom_data?.user_id;

    if (!userId) return NextResponse.json({ message: "No user_id found" }, { status: 200 });

    // --- LOGIKA UPDATE DATA ---
    
    // 1. LIFETIME (Order)
    if (eventName === "order_created") {
      await adminDb.collection("users").doc(userId).set({
        isPro: true,
        subscription: {
          plan: "lifetime",
          status: "active",
          period: "lifetime",
          provider: "lemonsqueezy",
          lemonSqueezyId: data.id,
          // Lifetime gak punya renewal date & portal update
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 2. SUBSCRIPTION (Monthly)
    else if (eventName.startsWith("subscription_")) {
      const attrs = data.attributes;
      
      // Ambil Customer Portal URL (buat user cancel/update kartu)
      const updatePaymentUrl = attrs.urls?.update_payment_method; 
      const customerPortalUrl = attrs.urls?.customer_portal; 

      await adminDb.collection("users").doc(userId).set({
        isPro: attrs.status === "active",
        subscription: {
          plan: "monthly",
          status: attrs.status, 
          period: "monthly",
          provider: "lemonsqueezy",
          lemonSqueezyId: data.id,
          renewsAt: attrs.renews_at, // 👈 PENTING: Tanggal tagihan berikutnya
          endsAt: attrs.ends_at,     // Kapan berakhir (kalau dicancel)
          customerPortalUrl: customerPortalUrl || updatePaymentUrl // Link buat manage
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
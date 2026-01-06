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

    // Verifikasi signature dari FastSpring
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
      // GANTI BARIS INI
      const userId = event.data.buyerReference || event.data.tags?.user_id;

      if (!userId) {
        console.warn("Webhook event received without user_id in tags:", event.id);
        continue; // Lanjut ke event berikutnya jika tidak ada user_id
      }

      const userRef = adminDb.collection("users").doc(userId);

      switch (event.type) {
        case "order.completed": {
          // Hanya tangani jika ini adalah pembelian lifetime (bukan bagian dari langganan)
          if (event.data.subscription) continue;

          await userRef.set({
            isPro: true,
            subscription: {
              plan: "lifetime",
              status: "active",
              provider: "fastspring",
              fastspringId: null, // Lifetime tidak punya ID langganan
              renewsAt: null,
              endsAt: null,
              customerPortalUrl: null,
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          break;
        }
        case "subscription.activated": {
          await userRef.set({
            isPro: true,
            subscription: {
              plan: "monthly", // Asumsi, bisa disesuaikan jika perlu
              status: "active",
              provider: "fastspring",
              fastspringId: event.data.id,
              renewsAt: event.data.next, // Tanggal tagihan berikutnya
              endsAt: event.data.end, // Kapan berakhir (kalau dicancel)
              customerPortalUrl: event.data.accountManagementUrl,
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          break;
        }
        case "subscription.deactivated":
        case "subscription.canceled": {
          await userRef.set({
            isPro: false,
            subscription: {
              status: event.data.state, // 'deactivated' atau 'canceled'
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
          break;
        }
        default:
          // Tipe event tidak dikenal, abaikan.
          break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// src/app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Panggil Lemon Squeezy API untuk cancel
    const apiKey = process.env.LEMONSQUEEZY_API_KEY; // Pastikan ada di .env.local
    
    if (!apiKey) {
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: "DELETE", // Method DELETE = Cancel di Lemon Squeezy
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.detail || "Failed to cancel subscription");
    }

    // 2. Update Firebase manual (Supaya UI langsung berubah tanpa nunggu webhook)
    await adminDb.collection("users").doc(userId).set({
      subscription: {
        status: "cancelled", // Ubah status jadi cancelled (akses tetap jalan sampai endsAt)
      }
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
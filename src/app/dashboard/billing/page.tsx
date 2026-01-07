import { NextResponse } from "next/server"; 
import { adminDb } from "@/lib/firebase/admin"; 
import { Timestamp } from "firebase-admin/firestore"; 

export async function POST(req: Request) { 
  const payload = await req.json(); 
  const eventType = payload.event_type; 
  const resource = payload.resource; 

  // PayPal bisa menaruh custom_id di tempat berbeda
  const userId = resource.custom_id || resource.purchase_units?.[0]?.custom_id; 

  if (!userId) {
    console.error("Webhook Error: No User ID found in payload", eventType);
    return NextResponse.json({ error: "No User ID" }, { status: 400 }); 
  }

  const userRef = adminDb.collection("users").doc(userId); 

  try {
    // LOGIKA 1: Langganan Baru / Aktif 
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") { 
      await userRef.set({ 
        isPro: true, 
        plan: resource.plan_id === "P-13B09030DE7786940NFPJG5Y" ? "monthly" : "lifetime",
        subscriptionId: resource.id,
        status: "active",
        updatedAt: Timestamp.now()
      }, { merge: true }); 
    } 

    // LOGIKA 2: Pembayaran Berhasil (Monthly Renewal atau Lifetime Success)
    if (eventType === "PAYMENT.SALE.COMPLETED" || eventType === "CHECKOUT.ORDER.APPROVED") { 
      const isLifetime = eventType === "CHECKOUT.ORDER.APPROVED";
      
      // Jika bulanan, tambah 31 hari. Jika lifetime, set ke tahun 2099.
      const expiryDate = new Date(); 
      isLifetime ? expiryDate.setFullYear(2099) : expiryDate.setDate(expiryDate.getDate() + 31); 

      await userRef.set({ 
        isPro: true,
        plan: isLifetime ? "lifetime" : "monthly",
        current_period_end: Timestamp.fromDate(expiryDate),
        updatedAt: Timestamp.now(),
        cancel_at_period_end: false
      }, { merge: true }); 
    } 

    // LOGIKA 3: User Cancel (Grace Period Logic)
    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") { 
      await userRef.set({ 
        cancel_at_period_end: true,
        status: "cancelled",
        updatedAt: Timestamp.now()
        // Kita TIDAK mengubah isPro ke false di sini agar user tetap bisa akses sampai current_period_end habis
      }, { merge: true }); 
    }

    return NextResponse.json({ received: true }); 
  } catch (error) {
    console.error("Firestore Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server"; 
 import { adminDb } from "@/lib/firebase/admin"; 
 import { Timestamp } from "firebase-admin/firestore"; 
 
 export async function POST(req: Request) { 
   const payload = await req.json(); 
   const eventType = payload.event_type; 
   const resource = payload.resource; 
 
   // PayPal mengirimkan UID kita di field custom_id 
   const userId = resource.custom_id; 
 
   if (!userId) return NextResponse.json({ error: "No User ID" }, { status: 400 }); 
 
   const userRef = adminDb.collection("users").doc(userId); 
 
   // LOGIKA 1: Langganan Baru / Aktif 
   if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") { 
     await userRef.set({ 
       isPro: true, 
       subscription: { 
         plan: resource.plan_id.includes("MONTHLY") ? "monthly" : "lifetime", 
         status: "active", 
         provider: "paypal", 
         paypalSubscriptionId: resource.id, 
         updatedAt: Timestamp.now() 
       } 
     }, { merge: true }); 
   } 
 
   // LOGIKA 2: Pembayaran Bulanan Berhasil (Renewal) 
   if (eventType === "PAYMENT.SALE.COMPLETED") { 
     // Perpanjang tanggal endsAt (misal 31 hari dari sekarang) 
     const nextMonth = new Date(); 
     nextMonth.setDate(nextMonth.getDate() + 31); 
 
     await userRef.update({ 
       "subscription.status": "active", 
       "subscription.endsAt": Timestamp.fromDate(nextMonth), 
       "updatedAt": Timestamp.now() 
     }); 
   } 
 
   // LOGIKA 3: User Berhenti Langganan 
   if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") { 
     await userRef.update({ 
       "subscription.status": "cancelled", 
       "isPro": false, // Atau biarkan true sampai masa endsAt habis (grace period) 
       "updatedAt": Timestamp.now() 
     }); 
   } 
 
   return NextResponse.json({ received: true }); 
 }
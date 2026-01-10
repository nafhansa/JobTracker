// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin"; // ✅ Aman di sini (Server Side)

export async function GET() {
  try {
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Konversi Timestamp ke String biar gak error pas dikirim ke frontend
      let createdAt = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate().toISOString();
      }

      return {
        uid: doc.id,
        email: data.email,
        createdAt: createdAt,
        subscription: data.subscription,
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    const err = error as { message?: string; code?: string };
    console.error("❌ Error fetching users:", error);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
    });
    return NextResponse.json(
      { 
        error: err.message || "Failed to fetch users",
        code: err.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
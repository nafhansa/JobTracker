// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin"; // ✅ Aman di sini (Server Side)
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Try Supabase first
    try {
      const { data: supabaseUsers, error } = await supabaseAdmin
        .from('users')
        .select('*');

      if (!error && supabaseUsers) {
        const users = (supabaseUsers as any[]).map((user) => ({
          uid: user.id,
          email: user.email,
          createdAt: user.created_at,
          subscription: {
            plan: user.subscription_plan,
            status: user.subscription_status,
          },
        }));
        return NextResponse.json(users);
      }
    } catch (supabaseError) {
      console.error("Supabase fetch error, falling back to Firebase:", supabaseError);
    }

    // Fallback to Firebase
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    const users = snapshot.docs.map((doc: any) => {
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
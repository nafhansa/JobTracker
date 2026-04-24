// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const offset = (page - 1) * pageSize;

    // Try Supabase first
    try {
      const { data: supabaseUsers, error, count } = await supabaseAdmin
        .from('users')
        .select('id, email, subscription_plan, subscription_status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

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
        return NextResponse.json({ data: users, total: count || 0, page, pageSize });
      }
    } catch (supabaseError) {
      console.error("Supabase fetch error, falling back to Firebase:", supabaseError);
    }

    // Fallback to Firebase with pagination
    let firebaseTotal = 0;
    let usersRef = adminDb.collection("users").orderBy("createdAt", "desc");

    const snapshot = await usersRef.get();
    firebaseTotal = snapshot.size;

    const users = snapshot.docs.slice(offset, offset + pageSize).map((doc: any) => {
      const data = doc.data();

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

    return NextResponse.json({ data: users, total: firebaseTotal, page, pageSize });
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
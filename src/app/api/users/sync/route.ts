import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Sync Firebase user to Supabase via API route (bypasses RLS using service role)
 * This is needed because users authenticate with Firebase, not Supabase Auth
 */
export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email" },
        { status: 400 }
      );
    }

    // Check if user exists in Supabase by ID (Firebase UID)
    const { data: existingUser } = await (supabaseAdmin
      .from('users') as any)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const userData: any = {
      email: email,
      updated_at: new Date().toISOString(),
    };

    // Preserve existing subscription data if user exists
    if (existingUser) {
      // Only update email and updated_at, preserve all subscription data
      if (existingUser.subscription_plan) {
        userData.subscription_plan = existingUser.subscription_plan;
      }
      if (existingUser.subscription_status) {
        userData.subscription_status = existingUser.subscription_status;
      }
      if (existingUser.is_pro !== undefined && existingUser.is_pro !== null) {
        userData.is_pro = existingUser.is_pro;
      }

      // Update existing user
      const { error: updateError } = await (supabaseAdmin
        .from('users') as any)
        .update(userData)
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user:", updateError);
        return NextResponse.json(
          { error: updateError.message || "Failed to update user" },
          { status: 500 }
        );
      }
    } else {
      // Create new user with free plan
      const { error: insertError } = await (supabaseAdmin
        .from('users') as any)
        .insert({
          id: userId, // Use Firebase UID as Supabase ID
          email: email,
          subscription_plan: 'free',
          subscription_status: 'active',
          is_pro: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting user:", insertError);
        return NextResponse.json(
          { error: insertError.message || "Failed to create user" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `User synced: ${email} (UID: ${userId})` 
    });
  } catch (error) {
    console.error("Error in sync user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from '@supabase/supabase-js';
import { JobApplication } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Add job via API route (bypasses RLS using service role)
 * This is needed because users authenticate with Firebase, not Supabase Auth
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received job data:", body); // Debug log
    
    const { userId, jobTitle, company, industry, recruiterEmail, applicationUrl, jobType, location, potentialSalary, currency, status } = body;

    // Debug: Check what we received
    if (!userId || !jobTitle || !company) {
      console.error("Missing fields:", { 
        hasUserId: !!userId, 
        hasJobTitle: !!jobTitle, 
        hasCompany: !!company, 
        bodyKeys: Object.keys(body),
        body 
      });
      return NextResponse.json(
        { 
          error: "Missing required fields: userId, jobTitle, company", 
          received: body,
          missing: {
            userId: !userId,
            jobTitle: !jobTitle,
            company: !company
          }
        },
        { status: 400 }
      );
    }

    // Generate Firebase-like ID
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const jobId = generateId();

    const { data, error } = await (supabaseAdmin
      .from('jobs') as any)
      .insert({
        id: jobId,
        user_id: userId,
        job_title: jobTitle,
        company: company,
        industry: industry || company,
        recruiter_email: recruiterEmail || null,
        application_url: applicationUrl || null,
        job_type: jobType || null,
        location: location || null,
        potential_salary: potentialSalary || null,
        currency: currency || 'IDR',
        status_applied: status?.applied || false,
        status_emailed: status?.emailed || false,
        status_cv_responded: status?.cvResponded || false,
        status_interview_email: status?.interviewEmail || false,
        status_contract_email: status?.contractEmail || false,
        status_rejected: status?.rejected || false,
      })
      .select()
      .single();

     if (error) {
      console.error("Error adding job:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add job" },
        { status: 500 }
      );
    }

    // Increment daily streak after successfully adding job
    try {
      const current_date_val = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if streak exists
      const { data: existingStreak, error: fetchError } = await supabaseService
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching streak for increment:", fetchError);
      }

      if (!existingStreak) {
        // Create new streak record
        await supabaseService
          .from('user_streaks')
          .insert([{
            id: crypto.randomUUID(),
            user_id: userId,
            current_streak: 1,
            best_streak: 1,
            last_active_date: current_date_val,
            consecutive_days: JSON.stringify([current_date_val]),
          }]);
      } else {
        // Update existing streak
        const streakRecord = existingStreak;
        const lastActiveDate = streakRecord.last_active_date;
        const lastActive = new Date(lastActiveDate);
        const current = new Date(current_date_val);
        const diffDays = Math.floor((current.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak: number;
        let newBest: number;
        let consecutiveDays: string[] = [];

        try {
          consecutiveDays = streakRecord.consecutive_days ? JSON.parse(streakRecord.consecutive_days as string) : [];
        } catch {
          consecutiveDays = [];
        }

        if (diffDays === 1) {
          // Continue streak (yesterday was active)
          newStreak = streakRecord.current_streak + 1;
          newBest = Math.max(streakRecord.best_streak, newStreak);
          consecutiveDays.push(current_date_val);
        } else if (diffDays === 0) {
          // Same day, no change
          newStreak = streakRecord.current_streak;
          newBest = streakRecord.best_streak;
        } else {
          // Reset streak (streak broken)
          newStreak = 1;
          newBest = streakRecord.best_streak;
          consecutiveDays = [current_date_val];
        }

        // Only keep last 100 days for performance
        if (consecutiveDays.length > 100) {
          consecutiveDays = consecutiveDays.slice(-100);
        }

        await supabaseService
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            best_streak: newBest,
            last_active_date: current_date_val,
            consecutive_days: JSON.stringify(consecutiveDays),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    } catch (streakError) {
      console.error("Failed to increment streak:", streakError);
      // Don't fail the job add if streak update fails
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in add job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

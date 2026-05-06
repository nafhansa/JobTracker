import { supabaseAdmin } from "./server";
import { UserProfile } from "../ai/types";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;

  return {
    ...data,
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
  };
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<UserProfile> {
  const { data, error } = await (supabaseAdmin as any)
    .from("user_profiles")
    .upsert({
      user_id: profile.user_id,
      full_name: profile.full_name || null,
      email: profile.email || null,
      phone: profile.phone || null,
      linkedin_url: profile.linkedin_url || null,
      skills: profile.skills || [],
      experience: profile.experience || [],
      education: profile.education || [],
      summary: profile.summary || null,
      resume_url: profile.resume_url || null,
      extracted_resume_data: profile.extracted_resume_data || {},
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
  };
}

export async function saveResumeExtraction(userId: string, extractedData: Record<string, unknown>, resumeUrl?: string): Promise<UserProfile> {
  const updateData: Record<string, unknown> = {
    extracted_resume_data: extractedData,
  };

  if (resumeUrl) {
    updateData.resume_url = resumeUrl;
  }
  if (extractedData.fullName) updateData.full_name = extractedData.fullName;
  if (extractedData.email) updateData.email = extractedData.email;
  if (extractedData.phone) updateData.phone = extractedData.phone;
  if (extractedData.linkedinUrl) updateData.linkedin_url = extractedData.linkedinUrl;
  if (extractedData.summary) updateData.summary = extractedData.summary;
  if (Array.isArray(extractedData.skills)) updateData.skills = extractedData.skills;
  if (Array.isArray(extractedData.experience)) updateData.experience = extractedData.experience;
  if (Array.isArray(extractedData.education)) updateData.education = extractedData.education;

  const { data, error } = await (supabaseAdmin as any)
    .from("user_profiles")
    .upsert({
      user_id: userId,
      ...updateData,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
  };
}
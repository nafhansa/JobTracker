import { supabaseAdmin } from "./server";
import { GeneratedDocument, GenerationType } from "../ai/types";

export async function saveGeneratedDocument(doc: {
  user_id: string;
  job_id?: string | null;
  type: GenerationType;
  target_name?: string | null;
  target_company?: string | null;
  target_role?: string | null;
  content: string;
  prompt_data?: Record<string, unknown>;
}): Promise<GeneratedDocument> {
  const { data, error } = await (supabaseAdmin as any)
    .from("generated_documents")
    .insert(doc)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGeneratedDocuments(userId: string, limit = 20): Promise<GeneratedDocument[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from("generated_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function deleteGeneratedDocument(userId: string, docId: string): Promise<void> {
  const { error } = await (supabaseAdmin as any)
    .from("generated_documents")
    .delete()
    .eq("id", docId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateGeneratedDocument(userId: string, docId: string, content: string): Promise<GeneratedDocument> {
  const { data, error } = await (supabaseAdmin as any)
    .from("generated_documents")
    .update({ content })
    .eq("id", docId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Document not found");
  return data;
}
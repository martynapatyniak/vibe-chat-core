import { supabase } from "@/lib/supabaseClient";

export async function banUser(userId: string, reason: string) {
  const { error } = await supabase.from("user_bans").insert({
    user_id: userId,
    reason,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function unbanUser(userId: string) {
  const { error } = await supabase.from("user_bans").delete().eq("user_id", userId);
  if (error) throw error;
}
import { supabase } from "@/lib/supabaseClient";

export async function logAction(action: string, userId: string, details?: string) {
  const { error } = await supabase.from("audit_logs").insert({
    action,
    user_id: userId,
    details,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
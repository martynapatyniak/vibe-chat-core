import { supabase } from "@/lib/supabaseClient";

export async function updateMessage(id: string, newText: string, editorId: string) {
  const { error } = await supabase.rpc("update_message", {
    p_id: id,
    p_new_text: newText,
    p_editor: editorId,
  });
  if (error) throw error;
}

export async function deleteMessage(id: string, requesterId: string) {
  const { error } = await supabase.rpc("delete_message", {
    p_id: id,
    p_requester: requesterId,
  });
  if (error) throw error;
}

import { supabase } from "@/lib/supabaseClient";

export async function postSystemMessage(roomId: string, content: string) {
  const { data, error } = await supabase.rpc("post_system_message", {
    p_room: roomId,
    p_content: content,
  });
  if (error) throw error;
  return data as string; // id wiadomości systemowej
}

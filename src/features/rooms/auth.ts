import { supabase } from "@/lib/supabaseClient";

export async function canEnterRoom(roomId: string, password?: string) {
  const { data, error } = await supabase.rpc("check_room_password", {
    p_room: roomId,
    p_plain: password ?? null,
  });
  if (error) throw error;
  return !!data;
}

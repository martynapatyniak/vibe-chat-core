import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUnread(userId: string | null, roomId: string | null) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId || !roomId) return;

    (async () => {
      // pobierz last_seen
      const { data: seen } = await supabase
        .from("room_last_seen")
        .select("last_seen")
        .eq("user_id", userId)
        .eq("room_id", roomId)
        .maybeSingle();

      const since = seen?.last_seen;

      // policz nieprzeczytane
      if (since) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", roomId)
          .gt("created_at", since);
        setUnreadCount(count ?? 0);
      } else {
        setUnreadCount(0);
      }
    })();
  }, [userId, roomId]);

  async function markAsRead() {
    if (!userId || !roomId) return;
    await supabase
      .from("room_last_seen")
      .upsert({ user_id: userId, room_id: roomId, last_seen: new Date().toISOString() });
    setUnreadCount(0);
  }

  return { unreadCount, markAsRead };
}
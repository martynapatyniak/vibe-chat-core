import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Announcement = {
  id: string;
  room_id: string | null;
  title: string | null;
  body: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  created_by: string | null;
};

export function useAnnouncements(roomId?: string | null) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNow() {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_active_announcements", { p_room: roomId ?? null });
    if (!error) setItems((data ?? []) as Announcement[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchNow();
    const ch = supabase
      .channel("announcements-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchNow)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return { items, loading, refresh: fetchNow };
}
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ArchiveMsg = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export function useArchiveSearch() {
  const [results, setResults] = useState<ArchiveMsg[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(query?: string, userId?: string, roomId?: string) {
    setLoading(true);
    const { data, error } = await supabase.rpc("search_messages", {
      p_query: query ?? null,
      p_user: userId ?? null,
      p_room: roomId ?? null,
      p_limit: 200,
    });
    if (!error) setResults(data as ArchiveMsg[]);
    setLoading(false);
  }

  return { results, search, loading };
}

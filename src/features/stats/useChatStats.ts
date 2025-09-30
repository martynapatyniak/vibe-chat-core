import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Counts = { total: number; today: number; month: number };
export type TopUser = { user_id: string; messages: number };

export function useChatStats() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [top, setTop] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [cRes, tRes] = await Promise.all([
      supabase.rpc("stats_counts_all"),
      supabase.rpc("stats_top_users", { p_limit: 4 }),
    ]);
    if (!cRes.error && cRes.data?.length) {
      const row = cRes.data[0];
      setCounts({ total: row.total ?? 0, today: row.today ?? 0, month: row.month ?? 0 });
    }
    if (!tRes.error) setTop((tRes.data ?? []) as TopUser[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return { counts, top, loading, reload: load };
}
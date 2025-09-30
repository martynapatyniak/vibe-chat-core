import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Counts = { total: number; today: number; month: number };
type TopUser = { user_id: string; messages: number };

export default function TopUsersBar() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [top, setTop] = useState<TopUser[]>([]);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.rpc("stats_counts_all");
      if (c && c.length) {
        const row = c[0];
        setCounts({ total: row.total, today: row.today, month: row.month });
      }
      const { data: t } = await supabase.rpc("stats_top_users", { p_limit: 4 });
      if (t) setTop(t);
    }
    load();
  }, []);

  return (
    <div className="border-t p-2 text-sm bg-gray-50">
      {counts && (
        <div className="flex gap-4 mb-2">
          <span>Ogółem: {counts.total}</span>
          <span>Dziś: {counts.today}</span>
          <span>W tym miesiącu: {counts.month}</span>
        </div>
      )}
      <div className="flex gap-3">
        {top.map((u) => (
          <div key={u.user_id} className="px-2 py-1 border rounded bg-white shadow-sm">
            🏆 {u.user_id.slice(0, 6)}… — {u.messages}
          </div>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { useChatStats } from "@/features/stats/useChatStats";

export default function ChatStatsPanel() {
  const { counts, top, loading, reload } = useChatStats();

  if (loading) return <div>Ładowanie statystyk…</div>;
  if (!counts) return <div>Brak danych.</div>;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Statystyki chatu</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded p-3">
          <div className="text-xs text-muted-foreground">Wpisów ogółem</div>
          <div className="text-2xl font-bold">{counts.total}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-muted-foreground">Dziś</div>
          <div className="text-2xl font-bold">{counts.today}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-muted-foreground">W tym miesiącu</div>
          <div className="text-2xl font-bold">{counts.month}</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Top użytkownicy</h4>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 py-1">user_id</th>
              <th className="text-left px-2 py-1">wpisów</th>
            </tr>
          </thead>
          <tbody>
            {top.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="px-2 py-1">{u.user_id}</td>
                <td className="px-2 py-1">{u.messages}</td>
              </tr>
            ))}
            {!top.length && <tr><td colSpan={2} className="px-2 py-2 text-center text-muted-foreground">—</td></tr>}
          </tbody>
        </table>
      </div>

      <button className="px-3 py-1 rounded border" onClick={reload}>Odśwież</button>
    </div>
  );
}
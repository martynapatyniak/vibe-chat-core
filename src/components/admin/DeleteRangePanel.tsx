import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteRangePanel() {
  const [scope, setScope] = useState("today");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function onDelete() {
    if (!confirm("Na pewno chcesz usunąć wiadomości w wybranym zakresie?")) return;
    // @ts-ignore
    const { data, error } = await supabase.rpc("delete_messages_range", {
      p_scope: scope,
      p_from: scope === "custom" && from ? new Date(from).toISOString() : null,
      p_to: scope === "custom" && to ? new Date(to).toISOString() : null,
    });
    if (error) return alert("Błąd: " + error.message);
    alert(`Usunięto: ${data ?? 0}`);
  }

  return (
    <div className="border p-3 rounded space-y-2">
      <h3 className="font-semibold text-lg">Usuń wiadomości wg zakresu</h3>
      <select className="border px-2 py-1" value={scope} onChange={e => setScope(e.target.value)}>
        <option value="today">Dziś</option>
        <option value="12h">Ostatnie 12h</option>
        <option value="24h">Ostatnie 24h</option>
        <option value="7d">Ostatnie 7 dni</option>
        <option value="1m">Ostatni miesiąc</option>
        <option value="all">Wszystko</option>
        <option value="custom">Własny zakres</option>
      </select>
      {scope === "custom" && (
        <div className="flex gap-2">
          <input type="datetime-local" className="border px-2 py-1" value={from} onChange={e => setFrom(e.target.value)} />
          <input type="datetime-local" className="border px-2 py-1" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      )}
      <button className="px-3 py-1 border rounded bg-red-100" onClick={onDelete}>Usuń</button>
    </div>
  );
}

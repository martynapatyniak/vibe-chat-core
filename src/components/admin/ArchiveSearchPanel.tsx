// src/components/admin/ArchiveSearchPanel.tsx
import React, { useState } from "react";
import { useMessageSearch } from "@/features/search/useMessageSearch";
import { supabase } from "@/lib/supabaseClient";

export default function ArchiveSearchPanel() {
  const { filters, setFilters, hits, loading, search, nextPage, prevPage, resetPaging } = useMessageSearch();
  const [archiveBefore, setArchiveBefore] = useState<string>("");

  async function archiveNow() {
    const room = filters.roomId ?? null;
    const before = archiveBefore || new Date().toISOString();
    const { data, error } = await supabase.rpc("archive_messages", {
      p_room: room,
      p_before: before,
    });
    if (error) {
      alert("Błąd archiwizacji: " + error.message);
      return;
    }
    alert(`Zarchiwizowano ${data ?? 0} wiadomości.`);
    await search();
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Archiwum & Szukaj</h3>

      <div className="grid md:grid-cols-2 gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Szukaj (słowa)..."
          value={filters.q ?? ""}
          onChange={(e) => { resetPaging(); setFilters({ ...filters, q: e.target.value }); }}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Room ID (uuid, opcjonalnie)"
          value={filters.roomId ?? ""}
          onChange={(e) => { resetPaging(); setFilters({ ...filters, roomId: e.target.value || null }); }}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="User ID (uuid, opcjonalnie)"
          value={filters.userId ?? ""}
          onChange={(e) => { resetPaging(); setFilters({ ...filters, userId: e.target.value || null }); }}
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={filters.from ?? ""}
            onChange={(e) => { resetPaging(); setFilters({ ...filters, from: e.target.value || null }); }}
          />
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={filters.to ?? ""}
            onChange={(e) => { resetPaging(); setFilters({ ...filters, to: e.target.value || null }); }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.includeArchived}
            onChange={(e) => { resetPaging(); setFilters({ ...filters, includeArchived: e.target.checked }); }}
          />
          Wlicz archiwum
        </label>
        <button
          className="border rounded px-3 py-1"
          onClick={() => search()}
          disabled={loading}
        >
          {loading ? "Szukam..." : "Szukaj"}
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        Sort: trafność (jeśli q) → data malejąco
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 py-1">czas</th>
              <th className="text-left px-2 py-1">room</th>
              <th className="text-left px-2 py-1">user</th>
              <th className="text-left px-2 py-1">treść</th>
              <th className="text-left px-2 py-1">arch.</th>
            </tr>
          </thead>
          <tbody>
            {hits.map(h => (
              <tr key={h.id} className="border-t">
                <td className="px-2 py-1">{new Date(h.created_at).toLocaleString()}</td>
                <td className="px-2 py-1">{h.room_id}</td>
                <td className="px-2 py-1">{h.user_id}</td>
                <td className="px-2 py-1 whitespace-pre-wrap">{h.content}</td>
                <td className="px-2 py-1">{h.archived_at ? "✓" : ""}</td>
              </tr>
            ))}
            {!hits.length && !loading && (
              <tr><td colSpan={5} className="px-2 py-3 text-center text-sm text-muted-foreground">Brak wyników</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button className="border rounded px-3 py-1" onClick={prevPage} disabled={loading}>←</button>
        <button className="border rounded px-3 py-1" onClick={nextPage} disabled={loading}>→</button>
      </div>

      <div className="mt-4 border-t pt-3">
        <h4 className="font-medium mb-2">Archiwizuj hurtowo</h4>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            className="border rounded px-2 py-1"
            value={archiveBefore}
            onChange={(e) => setArchiveBefore(e.target.value)}
          />
          <button className="bg-red-600 text-white rounded px-3 py-1" onClick={archiveNow}>
            Zarchiwizuj {filters.roomId ? "ten pokój" : "wszystkie pokoje"} starsze niż data
          </button>
        </div>
      </div>
    </div>
  );
}
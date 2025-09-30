import React, { useState } from "react";
import { useArchiveSearch } from "@/features/archive/useArchiveSearch";

export default function ArchiveSearchPanel() {
  const { results, search, loading } = useArchiveSearch();
  const [q, setQ] = useState("");

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Archiwum wiadomości</h3>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Szukaj..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-3 py-1 border rounded"
          onClick={() => search(q)}
          disabled={loading}
        >
          {loading ? "Szukam…" : "Szukaj"}
        </button>
      </div>

      <div className="border rounded max-h-64 overflow-auto text-sm">
        {results.map((m) => (
          <div key={m.id} className="px-2 py-1 border-b">
            <div className="text-xs text-gray-500">{m.created_at}</div>
            <div>{m.content}</div>
          </div>
        ))}
        {!results.length && <div className="px-2 py-4 text-center text-gray-400">Brak wyników</div>}
      </div>
    </div>
  );
}

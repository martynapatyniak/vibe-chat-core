import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ImportMessagesPanel() {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onImport() {
    const file = ref.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    const payload = JSON.parse(text);
    const { data, error } = await supabase.rpc("import_messages", { p_payload: payload });
    setBusy(false);
    if (error) return alert("Błąd importu: " + error.message);
    alert(`Zaimportowano ${data ?? 0} wiadomości`);
  }

  return (
    <div className="border p-3 rounded space-y-2">
      <h3 className="font-semibold text-lg">Import wiadomości (JSON)</h3>
      <input type="file" accept="application/json" ref={ref} />
      <button className="px-3 py-1 border rounded" disabled={busy} onClick={onImport}>
        {busy ? "Importuję…" : "Importuj"}
      </button>
    </div>
  );
}

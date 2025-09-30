import React, { useState } from "react";
import { postSystemMessage } from "@/features/system/useSystemMessages";

export default function SystemMessagePanel({ roomId }: { roomId: string }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function onSend() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await postSystemMessage(roomId, text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-2 border p-3 rounded">
      <h3 className="font-semibold text-lg">Wiadomości systemowe</h3>
      <textarea
        className="border w-full p-2"
        rows={3}
        placeholder="Treść wiadomości systemowej..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-3 py-1 border rounded bg-yellow-100"
        onClick={onSend}
        disabled={sending}
      >
        {sending ? "Wysyłam…" : "Wyślij teraz"}
      </button>
    </div>
  );
}
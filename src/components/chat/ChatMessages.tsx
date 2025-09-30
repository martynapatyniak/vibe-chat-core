import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { updateMessage, deleteMessage } from "@/features/chat/useMessageActions";
import ReactionBar from "./ReactionBar";

type Message = {
  id: string;
  room_id: string;
  user_id: string;
  author_name?: string | null;
  avatar_url?: string | null;
  content: string;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  quoted_message_id?: string | null;
};

type Props = {
  roomId: string;
  icMemberId: string; // aktualny user
  className?: string;
};

export default function ChatMessages({ roomId, icMemberId, className }: Props) {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // mapka do szybkiego renderu cytatu
  const byId = useMemo(() => {
    const m = new Map<string, Message>();
    for (const r of rows) m.set(r.id, r);
    return m;
  }, [rows]);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from<Message>("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!error) setRows(data ?? []);
    setLoading(false);
    // autoscroll do dołu po załadowaniu
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "instant" as any });
    });
  }

  useEffect(() => {
    fetchMessages();
    // realtime subskrypcja
    const ch = supabase
      .channel(`messages:${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` }, () =>
        fetchMessages()
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const onQuote = (m: Message) => {
    // Push event do Composera
    window.dispatchEvent(new CustomEvent("chat:set-quote", { detail: { message: m } }));
  };

  const onStartEdit = (m: Message) => {
    setEditingId(m.id);
    setEditingVal(m.content);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditingVal("");
  };

  const onSaveEdit = async (m: Message) => {
    const newText = editingVal.trim();
    if (!newText || newText === m.content) {
      onCancelEdit();
      return;
    }
    await updateMessage(m.id, newText, icMemberId);
    onCancelEdit();
  };

  const onDeleteMsg = async (m: Message) => {
    if (!confirm("Na pewno usunąć tę wiadomość?")) return;
    await deleteMessage(m.id, icMemberId);
  };

  return (
    <div className={className ?? "h-full overflow-hidden flex flex-col"}>
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Ładowanie…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">Brak wiadomości w tym pokoju.</div>
        ) : (
          rows.map((m) => {
            const isMine = m.user_id === icMemberId;
            const quoted = m.quoted_message_id ? byId.get(m.quoted_message_id) : null;
            const isDeleted = !!m.deleted_at;

            return (
              <div key={m.id} className="group">
                {/* nagłówek: avatar + nick + czas */}
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted overflow-hidden">
                    {/* jeśli masz Next/Image użyj go; placeholder dla prostoty */}
                    {/* <Image src={m.avatar_url ?? "/avatar.png"} alt="" width={28} height={28} /> */}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{m.author_name ?? "Użytkownik"}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                      {m.edited_at ? " • edytowano" : ""}
                      {isDeleted ? " • usunięto" : ""}
                    </span>
                  </div>
                </div>

                {/* cytowana wiadomość (mini box) */}
                {quoted && (
                  <div className="ml-9 mt-1 rounded border bg-muted/40 px-3 py-2 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      Cytat od <strong>{quoted.author_name ?? "Użytkownik"}</strong>:
                    </div>
                    <div className="whitespace-pre-wrap break-words line-clamp-4">
                      {quoted.deleted_at ? "— (wiadomość usunięta) —" : quoted.content}
                    </div>
                  </div>
                )}

                {/* treść / edycja / usunięta */}
                <div className="ml-9 mt-1">
                  {isDeleted ? (
                    <div className="italic text-muted-foreground text-sm">Wiadomość została usunięta.</div>
                  ) : editingId === m.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={3}
                        value={editingVal}
                        onChange={(e) => setEditingVal(e.target.value)}
                      />
                      <div className="flex gap-2 text-sm">
                        <button
                          className="px-3 py-1 rounded bg-primary text-primary-foreground"
                          onClick={() => onSaveEdit(m)}
                        >
                          Zapisz
                        </button>
                        <button className="px-3 py-1 rounded border" onClick={onCancelEdit}>
                          Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  )}
                </div>

                {/* akcje: cytuj/edytuj/usuń + reakcje */}
                <div className="ml-9 mt-1 flex items-center gap-3 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => onQuote(m)} className="hover:underline">
                    💬 Cytuj
                  </button>
                  {isMine && !isDeleted && (
                    <>
                      <button onClick={() => onStartEdit(m)} className="hover:underline">
                        ✏️ Edytuj
                      </button>
                      <button onClick={() => onDeleteMsg(m)} className="hover:underline">
                        🗑 Usuń
                      </button>
                    </>
                  )}
                </div>

                {/* reakcje */}
                {!isDeleted && <ReactionBar messageId={m.id} icMemberId={icMemberId} className="ml-9" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
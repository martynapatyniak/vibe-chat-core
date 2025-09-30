import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import MentionsDropdown from "@/features/chat/mentions/MentionsDropdown";
import { useUserMentionSearch } from "@/features/chat/mentions/useUserMentionSearch";

import { sanitizeMessage } from "@/features/chat/sanitize";
import { supabase } from "@/lib/supabaseClient";

type MessageLite = {
  id: string;
  user_id: string;
  author_name?: string | null;
  content: string;
};

type Props = {
  icMemberId: string;
  roomId: string;
  onSend?: (payload: { content: string; quoted_message_id?: string | null }) => Promise<void> | void;
  maxLen?: number;
  // konfiguracja anti-flood (opcjonalnie nadpisywana propsami)
  floodWindowSec?: number; // np. 60s
  floodMaxMsgs?: number;   // np. 20 wiadomości / okno
};

const MAX_LEN_DEFAULT = 2000;
const FLOOD_WINDOW_DEFAULT = 60;
const FLOOD_MAX_DEFAULT = 20;

export default function ChatComposer({
  icMemberId,
  roomId,
  onSend,
  maxLen = MAX_LEN_DEFAULT,
  floodWindowSec = FLOOD_WINDOW_DEFAULT,
  floodMaxMsgs = FLOOD_MAX_DEFAULT,
}: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [floodDenied, setFloodDenied] = useState<string | null>(null);

  // cytowanie — zarządzane lokalnie, ustawiane eventem z ChatMessages
  const [quote, setQuote] = useState<MessageLite | null>(null);

  // mentions
  const [mentionOpen, setMentionOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const overLimit = value.length > maxLen;
  const nearLimit = !overLimit && value.length > maxLen - 100;

  // nasłuch cytatu z ChatMessages przez CustomEvent
  useEffect(() => {
    const handler = (e: any) => {
      const m = e?.detail?.message as MessageLite | undefined;
      if (m) setQuote(m);
    };
    window.addEventListener("chat:set-quote", handler as any);
    return () => window.removeEventListener("chat:set-quote", handler as any);
  }, []);

  // wykrywanie tokena @mention pod caretem
  const currentMention = useMemo(() => {
    const el = taRef.current;
    if (!el) return null;
    const pos = el.selectionStart ?? value.length;
    let start = pos - 1;
    while (start >= 0 && !/\s/.test(value[start])) start--;
    const token = value.slice(start + 1, pos);
    if (token.startsWith("@") && token.length > 1) {
      return { start: start + 1, end: pos, query: token.substring(1) };
    }
    return null;
  }, [value]);

  const q = currentMention?.query || "";
  const { results } = useUserMentionSearch(q);

  useEffect(() => {
    setMentionOpen(!!currentMention && q.length > 0 && (results?.length ?? 0) > 0);
    setHighlight(0);
  }, [currentMention, q, results?.length]);

  const insertAt = (text: string, from: number, to: number, snippet: string) => {
    return text.slice(0, from) + snippet + text.slice(to);
  };

  const pickMention = (idx: number) => {
    if (!mentionOpen || !currentMention) return;
    const user = results[idx];
    if (!user) return;
    const replacement = `@${user.username} `;
    const next = insertAt(value, currentMention.start, currentMention.end, replacement);
    setValue(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (!el) return;
      const caret = currentMention.start + replacement.length;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = wyślij; Shift+Enter = nowa linia
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (mentionOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min((results.length || 1) - 1, h + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        pickMention(highlight);
      } else if (e.key === "Escape") {
        setMentionOpen(false);
      }
    }
  };

  const clearQuote = () => setQuote(null);

  // Anti-flood – sprawdzenie w SQL (RPC can_post_now)
  const canPostNow = async () => {
    try {
      const { data, error } = await supabase.rpc("can_post_now", {
        p_ic_id: icMemberId,
        p_window_seconds: floodWindowSec,
        p_max: floodMaxMsgs,
      });
      if (error) {
        console.error("can_post_now error:", error);
        // ostrożnie: w razie problemów backendowych nie blokujemy – ale zwróćmy true
        return true;
      }
      return !!data; // boolean z funkcji
    } catch (e) {
      console.error(e);
      return true;
    }
  };

  const handleSend = async () => {
    if (sending) return;
    const trimmedRaw = value.trim();
    if (!trimmedRaw || overLimit) return;

    // sanitizacja
    const trimmed = sanitizeMessage ? sanitizeMessage(trimmedRaw) : trimmedRaw;

    setSending(true);
    setFloodDenied(null);
    try {
      // Anti-flood guard
      const ok = await canPostNow();
      if (!ok) {
        setFloodDenied(
          `Za dużo wiadomości w krótkim czasie. Spróbuj ponownie za chwilę (okno ${floodWindowSec}s, max ${floodMaxMsgs}).`
        );
        return;
      }

      // Jeśli masz własny backend:
      if (onSend) {
        await onSend({ content: trimmed, quoted_message_id: quote?.id ?? null });
      } else {
        // Minimalny insert do Supabase (dopasuj nazwy kolumn do swojej tabeli "messages")
        const payload = {
          content: trimmed,
          room_id: roomId,
          user_id: icMemberId,
          quoted_message_id: quote?.id ?? null,
        };
        const { error } = await supabase.from("messages").insert(payload);
        if (error) {
          console.error(error);
          setFloodDenied("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
          return;
        }
      }

      setValue("");
      setQuote(null);
      // autoscroll zrobi ChatMessages po realtime
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative w-full border-t bg-background p-2">
      {/* BOX Z CYTATEM */}
      {quote && (
        <div className="mb-2 rounded border bg-muted/40 px-3 py-2 text-sm">
          <div className="mb-1 text-xs text-muted-foreground">
            Cytujesz <strong>{quote.author_name ?? "Użytkownik"}</strong>:
          </div>
          <div className="line-clamp-3 whitespace-pre-wrap break-words">{quote.content}</div>
          <button className="mt-1 text-xs text-red-600 hover:underline" onClick={clearQuote}>
            usuń cytat ✖
          </button>
        </div>
      )}

      {/* TEXTAREA + PRZYCISK */}
      <div className="relative">
        <Textarea
          ref={taRef}
          value={value}
          rows={2}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Napisz wiadomość… (Enter – wyślij, Shift+Enter – nowa linia)"
          className="resize-none pr-24"
        />

        <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-2">
          <span
            className={`pointer-events-auto rounded px-1 text-[10px] ${
              value.length > maxLen ? "text-destructive" : nearLimit ? "text-amber-600" : "text-muted-foreground"
            }`}
            title={`Limit: ${maxLen}`}
          >
            {value.length}/{maxLen}
          </span>
          <Button
            size="sm"
            className="pointer-events-auto"
            disabled={!value.trim() || sending || overLimit}
            onClick={handleSend}
            type="button"
          >
            Wyślij
          </Button>
        </div>

        {mentionOpen && !!results.length && (
          <MentionsDropdown
            items={results.slice(0, 8)}
            highlight={highlight}
            onPick={(u) => {
              const idx = results.findIndex((r) => r.id === u.id);
              pickMention(idx >= 0 ? idx : 0);
            }}
          />
        )}
      </div>

      {floodDenied && (
        <div className="mt-2 text-xs text-amber-600">
          {floodDenied}
        </div>
      )}

      <div className="mt-1 text-[11px] text-muted-foreground">
        Wskazówka: wpisz <span className="font-mono">@</span>, żeby oznaczyć użytkownika. Enter – wyślij, Shift+Enter – nowa linia.
      </div>
    </div>
  );
}
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/** Zestaw emoji wyświetlanych w pasku reakcji */
export const EMOJI: string[] = ["👍", "❤️", "🔥", "😂", "😮"];

/** Kształt wiersza w tabeli `message_reactions` (luźny – bez twardych typów DB) */
type ReactionRow = {
  message_id: string;
  ic_member_id: string;
  emoji: string;
  created_at?: string;
};

type UseReactionsReturn = {
  counts: Record<string, number>;
  mine: Set<string>;
  toggling: boolean;
  toggle: (emoji: string) => Promise<void>;
  refresh: () => Promise<void>;
};

/**
 * Hook zarządza reakcjami:
 *  - pobiera liczbę reakcji na wiadomość (grupowane po emoji)
 *  - wie, które emoji są dodane przez bieżącego usera
 *  - potrafi dodać/usunąć reakcję (optymistycznie)
 */
export function useReactions(messageId: string, icMemberId: string): UseReactionsReturn {
  const [rows, setRows] = useState<ReactionRow[]>([]);
  const [toggling, setToggling] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!messageId) return;
    const { data, error } = await supabase
      .from("message_reactions")
      .select("message_id, ic_member_id, emoji, created_at")
      .eq("message_id", messageId);

    if (!mounted.current) return;
    if (error) {
      // Celowo: nie wywalamy wyjątku w UI; możesz tu dodać toast/log.
      return;
    }
    setRows(data ?? []);
  }, [messageId]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const counts = useMemo(() => {
    const map: Record<string, number> = Object.create(null);
    for (const e of EMOJI) map[e] = 0;
    for (const r of rows) {
      map[r.emoji] = (map[r.emoji] ?? 0) + 1;
    }
    return map;
  }, [rows]);

  const mine = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (r.ic_member_id === icMemberId) s.add(r.emoji);
    }
    return s;
  }, [rows, icMemberId]);

  const toggle = useCallback(
    async (emoji: string) => {
      if (!messageId || !icMemberId || toggling) return;
      setToggling(true);

      // Optymistyczna aktualizacja
      const optimistic: ReactionRow[] = mine.has(emoji)
        ? rows.filter((r) => !(r.ic_member_id === icMemberId && r.emoji === emoji))
        : [...rows, { message_id: messageId, ic_member_id: icMemberId, emoji }];

      setRows(optimistic);

      try {
        if (mine.has(emoji)) {
          // Usuń moją reakcję
          const { error } = await supabase
            .from("message_reactions")
            .delete()
            .match({ message_id: messageId, ic_member_id: icMemberId, emoji });
          if (error) throw error;
        } else {
          // Dodaj reakcję (zakładamy unikalność (message_id, ic_member_id, emoji) w DB)
          const { error } = await supabase.from("message_reactions").insert({
            message_id: messageId,
            ic_member_id: icMemberId,
            emoji,
          });
          if (error) throw error;
        }
      } catch {
        // Revert jeśli błąd
        setRows(rows);
      } finally {
        setToggling(false);
        // Dociągnij prawdę z bazy (gdyby polityki/unikalne klucze zadziałały inaczej)
        refresh();
      }
    },
    [messageId, icMemberId, mine, rows, toggling, refresh]
  );

  return { counts, mine, toggling, toggle, refresh };
}

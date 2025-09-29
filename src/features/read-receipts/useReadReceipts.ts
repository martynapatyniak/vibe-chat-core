// Hook do oznaczania przeczytania + pobierania „who read” z tabeli chat_reads.
// Zakładamy funkcje z Fazy 2: public.mark_room_read(text,text), public.get_last_read(text,text)
// oraz tabelę public.chat_reads (room_id, ic_member_id, last_read_at).

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type RoomRead = {
  ic_member_id: string;
  last_read_at: string; // ISO
};

type Opts = {
  roomId: string;
  icMemberId: string;
};

export function useReadReceipts({ roomId, icMemberId }: Opts) {
  const [reads, setReads] = useState<RoomRead[]>([]);
  const [lastMine, setLastMine] = useState<string | null>(null);
  const busyRef = useRef(false);

  const fetchMine = useCallback(async () => {
    if (!roomId || !icMemberId) return;
    const { data, error } = await supabase
      .rpc("get_last_read", { p_room_id: roomId, p_ic_id: icMemberId });
    if (!error) setLastMine(data ?? null);
  }, [roomId, icMemberId]);

  const fetchAll = useCallback(async () => {
    if (!roomId) return;
    // Proste pobranie top N czytań (wymaga SELECT na tabeli chat_reads)
    const { data, error } = await supabase
      .from("chat_reads")
      .select("ic_member_id,last_read_at")
      .eq("room_id", roomId)
      .order("last_read_at", { ascending: false })
      .limit(20);

    if (!error && Array.isArray(data)) setReads(data as RoomRead[]);
  }, [roomId]);

  const markRead = useCallback(
    async (opts?: { throttleMs?: number }) => {
      if (!roomId || !icMemberId) return;
      const throttleMs = opts?.throttleMs ?? 3000;
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await supabase.rpc("mark_room_read", {
          p_room_id: roomId,
          p_ic_id: icMemberId,
        });
        // odśwież mój odczyt i listę
        await Promise.all([fetchMine(), fetchAll()]);
      } finally {
        setTimeout(() => (busyRef.current = false), throttleMs);
      }
    },
    [roomId, icMemberId, fetchAll, fetchMine]
  );

  useEffect(() => {
    fetchMine();
    fetchAll();
  }, [fetchMine, fetchAll]);

  return {
    reads,         // inni (max 20)
    lastMine,      // mój timestamp odczytu (ISO lub null)
    markRead,      // wywołuj np. po przewinięciu do dołu
    refresh: () => { fetchMine(); fetchAll(); },
  };
}

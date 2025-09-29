// Lekki hook presence w pokoju używający Realtime Presence (Supabase)
// API: const {online} = useRoomPresence({ roomId, icMemberId, nickname })

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Opts = {
  roomId: string;
  icMemberId: string;
  nickname?: string;
};

type PresenceUser = {
  id: string;
  nickname?: string;
  at: number;
};

export function useRoomPresence({ roomId, icMemberId, nickname }: Opts) {
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId || !icMemberId) return;

    const channel = supabase.channel(`presence:room:${roomId}`, {
      config: { presence: { key: icMemberId } },
    });

    chanRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<
          string,
          Array<{ nickname?: string; at: number }>
        >;

        const flat: PresenceUser[] = Object.entries(state).map(([id, arr]) => {
          const last = arr?.[arr.length - 1];
          return { id, nickname: last?.nickname, at: last?.at ?? Date.now() };
        });

        // sortuj po ostatniej aktywności
        flat.sort((a, b) => b.at - a.at);
        setOnline(flat);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        // dołącz do presence
        await channel.track({ nickname, at: Date.now() });
      });

    // co 25s „ping”, żeby utrzymać presence „żywe”
    const tick = setInterval(() => {
      channel.track({ nickname, at: Date.now() }).catch(() => {});
    }, 25_000);

    return () => {
      clearInterval(tick);
      channel.untrack().catch(() => {});
      channel.unsubscribe().catch(() => {});
    };
  }, [roomId, icMemberId, nickname]);

  const count = online.length;
  const youIncluded = online.some((u) => u.id === icMemberId);

  const label = useMemo(() => {
    if (count === 0) return "nikt offline";
    if (count === 1) return `${online[0]?.nickname ?? "1 osoba"} online`;
    if (count <= 3)
      return `${online.map((u) => u.nickname ?? "?" ).join(", ")} online`;
    return `${count} online`;
  }, [online, count]);

  return { online, count, youIncluded, label };
}

/* Presence & typing for a chat room (Supabase Realtime)
   API:
   const { onlineMembers, typingMembers, setTyping, isOnline } =
     usePresence({ roomId, icMemberId });
*/
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

type PresenceOpts = {
  roomId: string;       // room/channel id (string)
  icMemberId: string;   // current user/member id (string)
};

// flatten Supabase presence state -> Set of member ids
function presenceSet(state: Record<string, any[]>): Set<string> {
  const s = new Set<string>();
  for (const key of Object.keys(state)) {
    // each key corresponds to presence key (we use icMemberId as presence key)
    s.add(key);
  }
  return s;
}

export function usePresence({ roomId, icMemberId }: PresenceOpts) {
  const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set());
  const [typingMembers, setTypingMembers] = useState<Set<string>>(new Set());

  // keep short-lived typing markers (auto-clear after X ms)
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const channelName = useMemo(
    () => `presence:room:${roomId}`,
    [roomId]
  );

  useEffect(() => {
    if (!roomId || !icMemberId) return;

    // Realtime channel with presence enabled
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: icMemberId },
      },
    });

    // Track myself as "online"
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ at: Date.now() });
      }
    });

    // When presence state changes, rebuild online set
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setOnlineMembers(presenceSet(state));
    });

    // Listen for typing broadcasts
    channel.on("broadcast", { event: "typing" }, (payload) => {
      const { icMemberId: who, isTyping } = payload?.payload ?? {};
      if (!who || who === icMemberId) return;

      // clear previous timer for this member
      const prev = typingTimers.current.get(who);
      if (prev) clearTimeout(prev);

      if (isTyping) {
        setTypingMembers(prev => new Set(prev).add(who));
        // auto-remove "typing" after 3s of silence
        const t = setTimeout(() => {
          setTypingMembers(prev => {
            const next = new Set(prev);
            next.delete(who);
            return next;
          });
          typingTimers.current.delete(who);
        }, 3000);
        typingTimers.current.set(who, t);
      } else {
        setTypingMembers(prev => {
          const next = new Set(prev);
          next.delete(who);
          return next;
        });
        typingTimers.current.delete(who);
      }
    });

    return () => {
      // cleanup timers
      for (const t of typingTimers.current.values()) clearTimeout(t);
      typingTimers.current.clear();
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, roomId, icMemberId]);

  // Helper to broadcast my typing state (throttled by the caller if needed)
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      await supabase.channel(channelName).send({
        type: "broadcast",
        event: "typing",
        payload: { icMemberId, isTyping },
      });
    },
    [channelName, icMemberId]
  );

  const isOnline = useCallback(
    (memberId: string) => onlineMembers.has(memberId),
    [onlineMembers]
  );

  return { onlineMembers, typingMembers, setTyping, isOnline };
}

export type UsePresenceReturn = ReturnType<typeof usePresence>;
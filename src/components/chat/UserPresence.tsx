import React from "react";
import { usePresence } from "@/features/presence/usePresence";

type Props = {
  roomId: string;
  /** id użytkownika, którego status chcemy wyświetlić (np. autora wiadomości) */
  watchMemberId: string;
  /** id aktualnego użytkownika (mój icMemberId) – potrzebny, aby wysyłać typing */
  icMemberId: string;
  /** opcjonalny tekst obok kropki (np. nazwa użytkownika) */
  label?: string;
  className?: string;
  /** jeśli chcesz – pokaż pasek "typing…" pod etykietą */
  showTypingHint?: boolean;
};

export default function UserPresence({
  roomId,
  watchMemberId,
  icMemberId,
  label,
  className,
  showTypingHint = false,
}: Props) {
  const { onlineMembers, typingMembers } = usePresence({ roomId, icMemberId });

  const online = onlineMembers.has(watchMemberId);
  const typing = typingMembers.has(watchMemberId);

  return (
    <div className={className ?? "flex items-center gap-2"}>
      {/* Dot */}
      <span
        aria-label={online ? "online" : "offline"}
        title={online ? "online" : "offline"}
        className={[
          "inline-block h-2.5 w-2.5 rounded-full",
          online ? "bg-emerald-500" : "bg-gray-300",
        ].join(" ")}
      />
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
      {showTypingHint && typing ? (
        <span className="ml-1 text-xs text-gray-500 italic">pisze…</span>
      ) : null}
    </div>
  );
}


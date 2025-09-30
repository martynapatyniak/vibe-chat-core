import React from "react";
import { EMOJI, useReactions } from "./useReactions";

type Props = {
  messageId: string;
  icMemberId: string;
  className?: string;
};

export default function ReactionBar({ messageId, icMemberId, className }: Props) {
  const { counts, mine, toggle, toggling } = useReactions(messageId, icMemberId);

  return (
    <div
      className={[
        "mt-1 flex gap-1 items-center select-none",
        "text-sm text-muted-foreground",
        className ?? "",
      ].join(" ")}
    >
      {EMOJI.map((e) => {
        const active = mine.has(e);
        const count = counts[e] ?? 0;
        const title = active ? "Usuń reakcję" : "Dodaj reakcję";
        return (
          <button
            key={e}
            type="button"
            disabled={toggling}
            onClick={() => toggle(e)}
            title={title}
            aria-pressed={active}
            className={[
              "rounded-full px-2 py-1 border transition",
              active ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            <span style={{ marginRight: count ? 6 : 0 }}>{e}</span>
            {count ? <span className="text-xs text-gray-600 align-middle">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}


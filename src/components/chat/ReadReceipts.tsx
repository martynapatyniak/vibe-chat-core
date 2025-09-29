import React from "react";
import type { RoomRead } from "@/features/read-receipts/useReadReceipts";

// Minimalny, „nieinwazyjny” pasek „Seen by …” do pokazania pod listą wiadomości
export default function ReadReceipts({
  reads,
  icMemberId,
}: {
  reads: RoomRead[];
  icMemberId: string;
}) {
  if (!reads?.length) return null;

  const others = reads.filter((r) => r.ic_member_id !== icMemberId);
  if (!others.length) return null;

  const maxFaces = 5;
  const shown = others.slice(0, maxFaces);

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      <span className="opacity-70">Seen by</span>
      <div className="flex -space-x-2">
        {shown.map((r) => {
          const text = r.ic_member_id.slice(0, 2).toUpperCase();
          return (
            <div
              key={r.ic_member_id}
              title={`${r.ic_member_id} • ${new Date(r.last_read_at).toLocaleString()}`}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-[10px]"
            >
              {text}
            </div>
          );
        })}
      </div>
      {others.length > maxFaces ? (
        <span className="opacity-70">+{others.length - maxFaces} more</span>
      ) : null}
    </div>
  );
}

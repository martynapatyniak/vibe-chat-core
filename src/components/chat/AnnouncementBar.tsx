import React, { useState } from "react";
import { useAnnouncements } from "@/features/announcements/useAnnouncements";

type Props = {
  roomId?: string | null;   // jeśli podasz, pokaże globalne + room
  className?: string;
};

export default function AnnouncementBar({ roomId = null, className }: Props) {
  const { items, loading } = useAnnouncements(roomId);
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return null;
  if (!items.length) return null;

  const a = items[0]; // najnowsze
  return (
    <div className={["border-b bg-amber-50 px-3 py-2", className ?? ""].join(" ")}>
      <div className="flex items-center gap-2">
        <button
          aria-label={collapsed ? "Rozwiń ogłoszenie" : "Zwiń ogłoszenie"}
          className="text-amber-700"
          onClick={() => setCollapsed(v => !v)}
        >
          {collapsed ? "▶" : "▼"}
        </button>
        <div className="font-medium text-amber-800">
          {a.title ?? "Ogłoszenie"}
        </div>
      </div>
      {!collapsed && (
        <div className="mt-1 text-sm text-amber-900 whitespace-pre-wrap">
          {a.body}
        </div>
      )}
    </div>
  );
}
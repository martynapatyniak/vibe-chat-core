import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Announcement = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
};

export default function RoomAnnouncements({ roomId }: { roomId: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!roomId) return;
    supabase
      .from("room_announcements")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAnnouncements(data || []));
  }, [roomId]);

  return (
    <div className="p-2 border-b bg-yellow-50">
      {announcements.map((a) => (
        <div key={a.id} className="text-sm text-yellow-900">
          📢 {a.content}
        </div>
      ))}
    </div>
  );
}

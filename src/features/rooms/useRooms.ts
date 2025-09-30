import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Room = {
  id: string;
  name: string;
  description?: string | null;
  is_private: boolean;
  created_at: string;
};

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchRooms() {
      setLoading(true);
      const { data, error } = await supabase.rpc("list_rooms_for_user");
      if (!ignore) {
        if (error) {
          console.error("Error fetching rooms:", error);
        } else {
          setRooms(data || []);
        }
        setLoading(false);
      }
    }

    fetchRooms();

    return () => {
      ignore = true;
    };
  }, []);

  return { rooms, loading };
}
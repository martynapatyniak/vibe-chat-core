import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCreateRoom() {
  const [loading, setLoading] = useState(false);

  async function createRoom(name: string, description?: string) {
    setLoading(true);
    const { error } = await supabase.rpc("create_room", {
      p_name: name,
      p_description: description ?? null,
      p_is_private: false,
    });
    setLoading(false);

    if (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  return { createRoom, loading };
}
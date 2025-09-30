import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type SoundPrefs = {
  user_id: string;
  sound_new_msg: boolean;
  sound_mention: boolean;
  updated_at: string;
};

export function useSoundPrefs(userId: string | null | undefined) {
  const [prefs, setPrefs] = useState<SoundPrefs | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from<SoundPrefs>("user_prefs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error) setPrefs(data ?? { user_id: userId, sound_new_msg: true, sound_mention: true, updated_at: new Date().toISOString() });
  }, [userId]);

  const save = useCallback(async (next: Partial<SoundPrefs>) => {
    if (!userId) return;
    const current = prefs ?? { user_id: userId, sound_new_msg: true, sound_mention: true, updated_at: new Date().toISOString() };
    const merged = { ...current, ...next };
    await supabase.rpc("upsert_user_prefs", {
      p_user: userId,
      p_sound_new: merged.sound_new_msg,
      p_sound_mention: merged.sound_mention,
    });
    setPrefs(merged);
  }, [prefs, userId]);

  useEffect(() => { load(); }, [load]);

  return { prefs, load, save };
}
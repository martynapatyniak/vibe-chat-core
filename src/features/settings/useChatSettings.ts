// src/features/settings/useChatSettings.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ChatSettings = Record<string, any>;

export function useChatSettings(scope: string = "global") {
  const [config, setConfig] = useState<ChatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_chat_settings", { p_scope: scope });
    if (!error) setConfig(data ?? {});
    setLoading(false);
  }, [scope]);

  const save = useCallback(async (next: ChatSettings) => {
    setSaving(true);
    const { error } = await supabase.rpc("upsert_chat_settings", {
      p_scope: scope,
      p_config: next,
    });
    setSaving(false);
    if (error) throw error;
    setConfig(next);
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  return { config, setConfig, load, save, loading, saving };
}

// małe helpery do pracy z „kropkami” (np. ui.showCountryFlag)
export function getDot(obj: any, path: string, fallback?: any) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
}
export function setDot(obj: any, path: string, value: any) {
  const next = Array.isArray(obj) || typeof obj !== "object" || obj === null ? {} : { ...obj };
  const keys = path.split(".");
  let cur: any = next;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else cur[k] = cur[k] && typeof cur[k] === "object" ? { ...cur[k] } : {};
    cur = cur[k];
  });
  return next;
}
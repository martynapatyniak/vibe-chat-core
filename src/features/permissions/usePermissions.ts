// src/features/permissions/usePermissions.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type PermissionEntry = { action: string; allowed: boolean };

export function usePermissions(userId: string | null | undefined, roomId: string | null | undefined) {
  const [rows, setRows] = useState<PermissionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!userId || !roomId) { setRows([]); return; }
      setLoading(true);
      const { data, error } = await supabase.rpc("list_permissions", { p_user: userId, p_room: roomId });
      if (!cancel) {
        if (!error) setRows((data ?? []) as PermissionEntry[]);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [userId, roomId]);

  const can = useCallback((action: string) => {
    if (!rows.length) return false;
    const e = rows.find(r => r.action === action);
    return !!e?.allowed;
  }, [rows]);

  // dla wygody: dostęp do całej mapy
  const map = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const r of rows) m[r.action] = r.allowed;
    return m;
  }, [rows]);

  return { can, map, loading };
}
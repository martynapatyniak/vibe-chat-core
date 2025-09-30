// src/features/search/useMessageSearch.ts
import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type SearchFilters = {
  q?: string;
  roomId?: string | null;
  userId?: string | null;
  from?: string | null; // ISO string
  to?: string | null;   // ISO string
  includeArchived?: boolean;
  limit?: number;
};

export type MessageHit = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  archived_at: string | null;
  rank: number | null;
};

export function useMessageSearch(initial?: SearchFilters) {
  const [filters, setFilters] = useState<SearchFilters>({
    q: "",
    roomId: null,
    userId: null,
    from: null,
    to: null,
    includeArchived: false,
    limit: 50,
    ...(initial ?? {}),
  });
  const [offset, setOffset] = useState(0);
  const [hits, setHits] = useState<MessageHit[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (opts?: Partial<SearchFilters>) => {
    const f = { ...filters, ...(opts ?? {}) };
    setFilters(f);
    setLoading(true);
    const { data, error } = await supabase.rpc("search_messages", {
      p_q: f.q ?? "",
      p_room: f.roomId ?? null,
      p_user: f.userId ?? null,
      p_from: f.from ?? null,
      p_to: f.to ?? null,
      p_include_archived: !!f.includeArchived,
      p_limit: f.limit ?? 50,
      p_offset: offset,
    });
    if (!error) setHits((data ?? []) as MessageHit[]);
    setLoading(false);
  }, [filters, offset]);

  const nextPage = useCallback(async () => {
    setOffset((o) => o + (filters.limit ?? 50));
    await search();
  }, [filters.limit, search]);

  const prevPage = useCallback(async () => {
    setOffset((o) => Math.max(0, o - (filters.limit ?? 50)));
    await search();
  }, [filters.limit, search]);

  const resetPaging = useCallback(() => setOffset(0), []);

  return useMemo(() => ({
    filters, setFilters, hits, loading, search, nextPage, prevPage, resetPaging
  }), [filters, hits, loading, search, nextPage, prevPage, resetPaging]);
}
// src/hooks/useUserMentionSearch.ts
import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { supabase } from '@/supabase'; // ✅ alias

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  country_code?: string;
}

export function useUserMentionSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    const doSearch = debounce(async (q: string) => {
      if (!q || q.length < 1) { setResults([]); return; }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, country_code')
        .or(`username.ilike.${q}%,display_name.ilike.${q}%`)
        .limit(10);

      if (error) {
        console.error('[mentions] query error:', error);
        setResults([]);
        return;
      }
      setResults((data ?? []) as User[]);
    }, 200);

    doSearch(query);
    return () => doSearch.cancel();
  }, [query]);

  return { results, setQuery };
}

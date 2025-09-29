import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { supabase } from '@/integrations/supabase/client';

export function useUserMentionSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const doSearch = debounce(async (q: string) => {
      if (!q || q.length < 1) { setResults([]); return; }
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, country_code')
        .ilike('username', `${q}%`)
        .limit(10);
      if (!error && data) setResults(data as any[]);
    }, 200);

    doSearch(query);
    return () => doSearch.cancel();
  }, [query]);

  return { results, setQuery };
}

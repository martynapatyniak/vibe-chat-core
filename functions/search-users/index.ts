// This is a minimal pseudocode edge function for Supabase/deno deploy.
// Adapt to your functions framework if needed.
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_KEY'));

serve(async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return new Response(JSON.stringify([]), { status: 200 });
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, country_code')
    .ilike('username', `${q}%`)
    .limit(10);
  return new Response(JSON.stringify(data), { status: 200 });
});

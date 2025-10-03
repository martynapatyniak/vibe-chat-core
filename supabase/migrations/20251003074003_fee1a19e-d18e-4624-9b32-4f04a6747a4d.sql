-- Fix all non-password functions missing search_path

CREATE OR REPLACE FUNCTION public.upsert_chat_settings(p_scope text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.chat_settings (scope, config, updated_at)
  values (coalesce(p_scope, 'global'), coalesce(p_config, '{}'::jsonb), now())
  on conflict (scope) do update
    set config = excluded.config,
        updated_at = now();
end $$;

CREATE OR REPLACE FUNCTION public.ban_user(p_user_id uuid, p_minutes integer, p_reason text, p_actor text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.user_ban_records (user_id, banned_by, reason, expires_at, active)
  values (p_user_id, p_actor, p_reason, case when p_minutes is null then null else now() + make_interval(mins => p_minutes) end, true);

  insert into public.audit_logs (actor_ic_id, action, target, meta)
  values (p_actor, 'ban_user', p_user_id::text, jsonb_build_object('minutes', p_minutes, 'reason', p_reason));
end $$;

CREATE OR REPLACE FUNCTION public.unban_user(p_user_id uuid, p_actor text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  update public.user_ban_records
    set active = false, expires_at = coalesce(expires_at, now())
  where user_id = p_user_id and active = true;

  insert into public.audit_logs (actor_ic_id, action, target, meta)
  values (p_actor, 'unban_user', p_user_id::text, '{}'::jsonb);
end $$;

CREATE OR REPLACE FUNCTION public.export_all_messages()
RETURNS SETOF messages
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select * from public.messages where deleted_at is null;
$$;

CREATE OR REPLACE FUNCTION public.reboot_chat()
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  delete from public.messages;
$$;

CREATE OR REPLACE FUNCTION public.stats_counts_all()
RETURNS TABLE(total bigint, today bigint, month bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  with
  t_all   as (select count(*) c from public.messages where deleted_at is null),
  t_today as (select count(*) c from public.messages where deleted_at is null and created_at::date = now()::date),
  t_month as (select count(*) c from public.messages where deleted_at is null and date_trunc('month',created_at)=date_trunc('month',now()))
  select (select c from t_all),
         (select c from t_today),
         (select c from t_month);
$$;

CREATE OR REPLACE FUNCTION public.stats_top_users(p_limit integer DEFAULT 4)
RETURNS TABLE(user_id uuid, messages bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select user_id, count(*)::bigint as messages
  from public.messages
  where deleted_at is null
  group by user_id
  order by messages desc
  limit greatest(p_limit,1);
$$;

CREATE OR REPLACE FUNCTION public.list_rooms_for_user(p_user_id text)
RETURNS TABLE(id uuid, name text, is_private boolean, created_by uuid, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
declare
  v_user uuid;
begin
  v_user := p_user_id::uuid;

  return query
  select r.id, r.name, r.is_private, r.created_by, r.created_at
  from public.rooms r
  where r.is_private = false
     or exists (
       select 1
       from public.room_members m
       where m.room_id = r.id
         and m.user_id = v_user
     )
  order by r.created_at asc;
end$$;

CREATE OR REPLACE FUNCTION public.create_room(p_id text, p_name text, p_is_private boolean, p_creator text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_id uuid;
  v_creator uuid;
begin
  v_id := p_id::uuid;
  v_creator := p_creator::uuid;

  insert into public.rooms (id, name, is_private, created_by)
  values (v_id, p_name, coalesce(p_is_private,false), v_creator)
  on conflict (id) do nothing;

  if p_is_private then
    insert into public.room_members (room_id, user_id, joined_at, role)
    values (v_id, v_creator, now(), 'admin')
    on conflict do nothing;
  end if;
end $$;

CREATE OR REPLACE FUNCTION public.add_user_to_room(p_room_id text, p_user_id text, p_role text DEFAULT 'member'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_room uuid;
  v_user uuid;
begin
  v_room := p_room_id::uuid;
  v_user := p_user_id::uuid;

  insert into public.room_members (room_id, user_id, joined_at, role)
  values (v_room, v_user, now(), coalesce(p_role,'member'))
  on conflict do nothing;
end $$;

CREATE OR REPLACE FUNCTION public.remove_user_from_room(p_room_id text, p_user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_room uuid;
  v_user uuid;
begin
  v_room := p_room_id::uuid;
  v_user := p_user_id::uuid;

  delete from public.room_members
  where room_id = v_room and user_id = v_user;
end $$;

CREATE OR REPLACE FUNCTION public.can_post_now(p_ic_id text, p_window_seconds integer DEFAULT 60, p_max integer DEFAULT 20)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
declare
    col_author text;
    col_author_type text;
    col_ts     text;
    q          text;
    cnt        int;
    cast_type  text;
begin
    select column_name, data_type
      into col_author, col_author_type
    from information_schema.columns
    where table_name = 'messages'
      and column_name = any (array['author_ic_id','author_id','user_id','member_id','created_by'])
    order by array_position(array['author_ic_id','author_id','user_id','member_id','created_by'], column_name)
    limit 1;

    if col_author is null then
      raise exception 'Nie znaleziono kolumny autora w tabeli messages';
    end if;

    select column_name
      into col_ts
    from information_schema.columns
    where table_name = 'messages'
      and column_name = any (array['created_at','inserted_at','createdAt'])
    order by array_position(array['created_at','inserted_at','createdAt'], column_name)
    limit 1;

    if col_ts is null then
      raise exception 'Nie znaleziono kolumny czasu w tabeli messages';
    end if;

    cast_type := case when col_author_type = 'uuid' then 'uuid' else 'text' end;

    q := format(
      'select count(*) from messages
         where %I = $1::%s
           and %I > now() - make_interval(secs => $2)',
      col_author, cast_type, col_ts
    );

    execute q using p_ic_id, p_window_seconds into cnt;
    return cnt < p_max;
end
$$;

CREATE OR REPLACE FUNCTION public.update_message(p_id uuid, p_new_text text, p_editor uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  update public.messages
    set content = p_new_text,
        edited_at = now()
  where id = p_id
    and user_id = p_editor
    and deleted_at is null;
end $$;

CREATE OR REPLACE FUNCTION public.delete_message(p_id uuid, p_requester uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  update public.messages
    set deleted_at = now()
  where id = p_id
    and user_id = p_requester
    and deleted_at is null;
end $$;

CREATE OR REPLACE FUNCTION public.messages_searchvec_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  new.search_vec :=
    setweight(to_tsvector('simple', coalesce(new.content,'')), 'A');
  return new;
end$$;

CREATE OR REPLACE FUNCTION public.search_messages(p_q text, p_room uuid DEFAULT NULL::uuid, p_user uuid DEFAULT NULL::uuid, p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_include_archived boolean DEFAULT false, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, room_id uuid, user_id uuid, content text, created_at timestamp with time zone, edited_at timestamp with time zone, deleted_at timestamp with time zone, archived_at timestamp with time zone, rank real)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  with base as (
    select m.*,
           case
             when coalesce(trim(p_q), '') = '' 
               then 0::real
             else ts_rank(m.search_vec, plainto_tsquery('simple', p_q))
           end as rank
    from public.messages m
    where (p_room is null or m.room_id = p_room)
      and (p_user is null or m.user_id = p_user)
      and (p_from is null or m.created_at >= p_from)
      and (p_to   is null or m.created_at <  p_to)
      and (p_include_archived or m.archived_at is null)
      and (coalesce(trim(p_q), '') = '' or m.search_vec @@ plainto_tsquery('simple', p_q))
  )
  select id, room_id, user_id, content, created_at, edited_at, deleted_at, archived_at, rank
  from base
  order by 
    case when coalesce(trim(p_q), '') = '' then null else rank end desc nulls last,
    created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0)
$$;

CREATE OR REPLACE FUNCTION public.archive_messages(p_room uuid DEFAULT NULL::uuid, p_before timestamp with time zone DEFAULT now())
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_count bigint;
begin
  update public.messages
    set archived_at = now()
  where archived_at is null
    and deleted_at is null
    and created_at < p_before
    and (p_room is null or room_id = p_room);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  return v_count;
end $$;

CREATE OR REPLACE FUNCTION public.delete_messages_range(p_scope text, p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare v_count bigint; v_from timestamptz; v_to timestamptz;
begin
  case p_scope
    when 'today' then v_from := date_trunc('day', now()); v_to := now();
    when '12h'  then v_from := now() - interval '12 hours'; v_to := now();
    when '24h'  then v_from := now() - interval '24 hours'; v_to := now();
    when '7d'   then v_from := now() - interval '7 days';   v_to := now();
    when '1m'   then v_from := now() - interval '1 month';  v_to := now();
    when 'all'  then v_from := null; v_to := null;
    when 'custom' then v_from := p_from; v_to := p_to;
    else raise exception 'unknown scope %', p_scope;
  end case;

  delete from public.messages
   where (v_from is null or created_at >= v_from)
     and (v_to   is null or created_at <  v_to);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  return v_count;
end $$;

CREATE OR REPLACE FUNCTION public.export_messages(p_room uuid)
RETURNS SETOF messages
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select * from public.messages where room_id = p_room and deleted_at is null;
$$;

CREATE OR REPLACE FUNCTION public.import_messages(p_payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare v_count bigint := 0;
begin
  if jsonb_typeof(p_payload) <> 'array' then
    raise exception 'payload must be json array';
  end if;

  insert into public.messages (room_id, user_id, content, created_at)
  select (elem->>'room_id')::uuid,
         nullif(elem->>'user_id','')::uuid,
         elem->>'content',
         coalesce( (elem->>'created_at')::timestamptz, now() )
  from jsonb_array_elements(p_payload) as elem;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  return v_count;
end $$;

CREATE OR REPLACE FUNCTION public.get_active_announcements(p_room uuid DEFAULT NULL::uuid)
RETURNS SETOF announcements
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  select *
  from public.announcements a
  where a.is_active
    and (a.starts_at is null or a.starts_at <= now())
    and (a.ends_at   is null or a.ends_at   >  now())
    and (a.room_id is null or a.room_id = p_room)
  order by a.created_at desc
$$;

CREATE OR REPLACE FUNCTION public.upsert_user_prefs(p_user uuid, p_sound_new boolean, p_sound_mention boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  insert into public.user_prefs (user_id, sound_new_msg, sound_mention, updated_at)
  values (p_user, p_sound_new, p_sound_mention, now())
  on conflict (user_id) do update
    set sound_new_msg = excluded.sound_new_msg,
        sound_mention = excluded.sound_mention,
        updated_at    = now();
$$;

CREATE OR REPLACE FUNCTION public.post_system_message(p_room uuid, p_content text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
declare
  new_id uuid;
begin
  insert into public.system_messages(room_id, content, scheduled_at, sent)
  values (p_room, p_content, null, true)
  returning id into new_id;

  insert into public.messages(room_id, user_id, content, created_at)
  values (p_room, null, '[SYSTEM] '||p_content, now());

  return new_id;
end $$;
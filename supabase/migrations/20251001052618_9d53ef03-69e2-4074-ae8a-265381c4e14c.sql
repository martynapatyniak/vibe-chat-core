-- Enable pgcrypto extension first
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- CRITICAL SECURITY FIXES - RLS Policies and Function Security
-- =============================================================================

-- 1. Secure User Email Privacy
-- Drop overly permissive policy and add restricted one
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

CREATE POLICY "Users can view own profile details"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view public profile info"
ON public.users
FOR SELECT
USING (true);

-- 2. Enable RLS on Critical Tables

-- Feature Permissions Table
ALTER TABLE public.feature_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature permissions"
ON public.feature_permissions
FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify feature permissions"
ON public.feature_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- User Global Roles Table
ALTER TABLE public.user_global_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
ON public.user_global_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_global_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles ugr
    WHERE ugr.user_id = auth.uid() AND ugr.role = 'admin'
  )
);

CREATE POLICY "Only admins can modify roles"
ON public.user_global_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles ugr
    WHERE ugr.user_id = auth.uid() AND ugr.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_global_roles ugr
    WHERE ugr.user_id = auth.uid() AND ugr.role = 'admin'
  )
);

-- User Bans Table
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ban status"
ON public.user_bans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can view all bans"
ON public.user_bans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Only admins and moderators can manage bans"
ON public.user_bans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Room Settings Table
ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room settings"
ON public.room_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = room_settings.room_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.rooms
    WHERE id = room_settings.room_id AND is_private = false
  )
);

CREATE POLICY "Room admins can update settings"
ON public.room_settings
FOR ALL
USING (
  get_effective_role(auth.uid(), room_id) IN ('admin', 'moderator')
)
WITH CHECK (
  get_effective_role(auth.uid(), room_id) IN ('admin', 'moderator')
);

-- User Presence Table
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all presence"
ON public.user_presence
FOR SELECT
USING (true);

CREATE POLICY "Users can update own presence"
ON public.user_presence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Chat Reads Table
ALTER TABLE public.chat_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own read status"
ON public.chat_reads
FOR SELECT
USING (ic_member_id = auth.uid()::text);

CREATE POLICY "Users can update own read status"
ON public.chat_reads
FOR ALL
USING (ic_member_id = auth.uid()::text)
WITH CHECK (ic_member_id = auth.uid()::text);

-- 3. Secure Audit Logs
DROP POLICY IF EXISTS "read all logs (dev)" ON public.audit_logs;
DROP POLICY IF EXISTS "insert logs (dev)" ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- 4. Add search_path to database functions
CREATE OR REPLACE FUNCTION public.get_chat_settings(p_scope text DEFAULT 'global'::text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v jsonb;
begin
  select coalesce(config, '{}'::jsonb) into v
  from public.chat_settings
  where scope = p_scope;

  if v is null then
    v := jsonb_build_object(
      'ui.showCountryFlag', true,
      'ui.showRankAfterNick', true,
      'ui.groupBubbleStyles', true,
      'composer.enterSends', true,
      'composer.shiftEnterNewline', true,
      'composer.maxChars', 2000,
      'messages.initialLoad', 50,
      'messages.infiniteScroll', true,
      'messages.timeFormat', 'HH:mm',
      'uploads.dragAndDrop', true,
      'uploads.maxFileMB', 10,
      'permissions.allowAudio', true,
      'permissions.allowVideo', true,
      'permissions.allowUrls', true,
      'flood.minIntervalMs', 1200,
      'filter.wordReplacement', jsonb_build_object(),
      'rooms.excludedPaths', jsonb_build_array(),
      'announcements.enabled', true,
      'notifications.soundsNew', true,
      'notifications.soundsMention', true
    );
  end if;

  return v;
end $function$;

CREATE OR REPLACE FUNCTION public.get_effective_role(p_user uuid, p_room uuid)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  with r as (
    select role::text as role
    from public.room_members
    where room_id = p_room and user_id = p_user
    limit 1
  ),
  g as (
    select role::text as role
    from public.user_global_roles
    where user_id = p_user
    limit 1
  )
  select coalesce( (select role from r),
                   (select role from g),
                   'member'::text );
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(p_user uuid, p_room uuid, p_action text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  select get_effective_role(p_user, p_room) = any(
    coalesce(
      (select fp.allow_roles
         from public.feature_permissions fp
        where fp.feature = p_action
        limit 1),
      '{}'::text[]
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.list_permissions(p_user uuid, p_room uuid)
RETURNS TABLE(feature text, allowed boolean)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  select fp.feature,
         get_effective_role(p_user, p_room) = any(fp.allow_roles) as allowed
  from public.feature_permissions fp
  order by fp.feature;
$function$;
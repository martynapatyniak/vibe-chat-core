-- CRITICAL SECURITY FIX: Database function security and audit logging

-- Drop and recreate get_effective_role with proper search_path (CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS public.get_effective_role(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_effective_role(p_user_id uuid, p_room_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM public.room_members
  WHERE user_id = p_user_id AND room_id = p_room_id;
  
  RETURN COALESCE(v_role, 'member');
END;
$$;

-- Recreate the policies that depend on get_effective_role
DROP POLICY IF EXISTS "insert_announcements" ON public.room_announcements;
CREATE POLICY "insert_announcements"
ON public.room_announcements
FOR INSERT
WITH CHECK (get_effective_role(auth.uid(), room_id) = ANY (ARRAY['moderator'::text, 'admin'::text]));

DROP POLICY IF EXISTS "system insert" ON public.system_messages;
CREATE POLICY "system insert"
ON public.system_messages
FOR INSERT
WITH CHECK (get_effective_role(auth.uid(), room_id) = ANY (ARRAY['moderator'::text, 'admin'::text]));

DROP POLICY IF EXISTS "Room admins can update settings" ON public.room_settings;
CREATE POLICY "Room admins can update settings"
ON public.room_settings
FOR ALL
USING (get_effective_role(auth.uid(), room_id) = ANY (ARRAY['admin'::text, 'moderator'::text]))
WITH CHECK (get_effective_role(auth.uid(), room_id) = ANY (ARRAY['admin'::text, 'moderator'::text]));

-- Update other security definer functions with search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET last_seen = now(),
      status = 'online'
  WHERE id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view security audit logs" ON public.security_audit_log;
CREATE POLICY "Only admins can view security audit logs"
ON public.security_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_global_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert security audit logs" ON public.security_audit_log;
CREATE POLICY "System can insert security audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    ip_address
  )
  VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    inet_client_addr()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_user_bans()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event('BAN_USER', 'user_bans', NEW.id, NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event('UPDATE_BAN', 'user_bans', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event('UNBAN_USER', 'user_bans', OLD.id, to_jsonb(OLD), NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_user_bans_trigger ON public.user_bans;
CREATE TRIGGER audit_user_bans_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_bans
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_bans();
-- Fix security warnings by setting proper search_path for functions

-- Update handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_user_last_seen function with proper search_path
CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET last_seen = NOW(), status = 'online'
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
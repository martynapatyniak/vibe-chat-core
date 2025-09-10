-- ChatFlow Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.user_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE public.message_type AS ENUM ('text', 'file', 'voice', 'system');
CREATE TYPE public.room_member_role AS ENUM ('admin', 'moderator', 'member');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    country_code TEXT,
    avatar_url TEXT,
    status user_status NOT NULL DEFAULT 'offline',
    is_banned BOOLEAN NOT NULL DEFAULT false,
    is_muted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    PRIMARY KEY (id),
    CONSTRAINT users_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Rooms table
CREATE TABLE public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    password TEXT,
    created_by UUID REFERENCES public.users(id),
    member_limit INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    PRIMARY KEY (id),
    CONSTRAINT rooms_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT rooms_member_limit CHECK (member_limit > 0 AND member_limit <= 1000)
);

-- Room members table
CREATE TABLE public.room_members (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role room_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    PRIMARY KEY (id),
    UNIQUE(room_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    file_url TEXT,
    reply_to_message_id UUID REFERENCES public.messages(id),
    is_edited BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    edited_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (id),
    CONSTRAINT messages_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 2000)
);

-- Message reactions table
CREATE TABLE public.message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    PRIMARY KEY (id),
    UNIQUE(message_id, user_id, emoji),
    CONSTRAINT reactions_emoji_length CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10)
);

-- Create indexes for performance
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_rooms_is_private ON public.rooms(is_private);
CREATE INDEX idx_room_members_room_user ON public.room_members(room_id, user_id);
CREATE INDEX idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_user ON public.messages(user_id);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for rooms table
CREATE POLICY "Users can view public rooms" 
ON public.rooms FOR SELECT 
USING (
    NOT is_private 
    OR id IN (
        SELECT room_id FROM public.room_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create rooms" 
ON public.rooms FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room creators can update rooms" 
ON public.rooms FOR UPDATE 
USING (created_by = auth.uid());

-- RLS Policies for room_members table
CREATE POLICY "Users can view room members" 
ON public.room_members FOR SELECT 
USING (true);

CREATE POLICY "Users can join rooms" 
ON public.room_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" 
ON public.room_members FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in accessible rooms" 
ON public.messages FOR SELECT 
USING (
    room_id IN (
        SELECT id FROM public.rooms WHERE NOT is_private
        UNION
        SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages in accessible rooms" 
ON public.messages FOR INSERT 
WITH CHECK (
    auth.uid() = user_id 
    AND room_id IN (
        SELECT id FROM public.rooms WHERE NOT is_private
        UNION
        SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for message_reactions table
CREATE POLICY "Users can view reactions" 
ON public.message_reactions FOR SELECT 
USING (true);

CREATE POLICY "Users can add reactions" 
ON public.message_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" 
ON public.message_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
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
    SET last_seen = NOW(), status = 'online'
    WHERE id = user_uuid;
END;
$$;

-- Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Set replica identity for realtime
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Insert sample data
INSERT INTO public.rooms (name, description, is_private) VALUES
('General', 'General discussion for everyone', false),
('Random', 'Random conversations and off-topic discussions', false),
('Tech Talk', 'Technology discussions and programming', false),
('Announcements', 'Important announcements and updates', false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Security notes:
-- 1. All tables have RLS enabled with appropriate policies
-- 2. Users can only access rooms they're members of (for private rooms)
-- 3. Message access is controlled by room membership
-- 4. Input validation is handled at application level
-- 5. Rate limiting should be implemented at application level
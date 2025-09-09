-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.user_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE public.message_type AS ENUM ('text', 'file', 'voice', 'system');
CREATE TYPE public.room_member_role AS ENUM ('owner', 'admin', 'member');

-- Create users table (profiles table linked to auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    country_code TEXT,
    avatar_url TEXT,
    status user_status NOT NULL DEFAULT 'offline',
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    password TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    member_limit INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    file_url TEXT,
    reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create room_members table
CREATE TABLE public.room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    role room_member_role NOT NULL DEFAULT 'member',
    UNIQUE(room_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS Policies for rooms table
CREATE POLICY "Users can view public rooms" ON public.rooms FOR SELECT USING (NOT is_private OR id IN (
    SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
));
CREATE POLICY "Users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Room creators can update rooms" ON public.rooms FOR UPDATE USING (created_by = auth.uid());

-- Create RLS Policies for messages table
CREATE POLICY "Users can view messages in accessible rooms" ON public.messages FOR SELECT USING (
    room_id IN (
        SELECT id FROM public.rooms WHERE NOT is_private 
        UNION 
        SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert messages in accessible rooms" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = user_id AND room_id IN (
        SELECT id FROM public.rooms WHERE NOT is_private 
        UNION 
        SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS Policies for message_reactions table
CREATE POLICY "Users can view reactions" ON public.message_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.message_reactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for room_members table
CREATE POLICY "Users can view room members" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET last_seen = NOW(), status = 'online'
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for all tables
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;

-- Insert sample data
-- Sample rooms
INSERT INTO public.rooms (id, name, description, is_private) VALUES 
    (gen_random_uuid(), 'General', 'General discussion room', FALSE),
    (gen_random_uuid(), 'Tech Talk', 'Technology discussions', FALSE),
    (gen_random_uuid(), 'Random', 'Random conversations', FALSE);

-- Note: Users will be created automatically when they sign up via the trigger
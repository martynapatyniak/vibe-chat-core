import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  country_code: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away';
  is_banned: boolean;
  is_muted: boolean;
  created_at: string;
  last_seen: string | null;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  password: string | null;
  created_by: string | null;
  member_limit: number;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  room_id: string;
  content: string;
  message_type: 'text' | 'file' | 'voice' | 'system';
  file_url: string | null;
  reply_to_message_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  edited_at: string | null;
  user: User;
  reply_to?: {
    id: string;
    content: string;
    user: User;
  };
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export const useChatData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoized fetch functions for better performance
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('status', { ascending: false })
        .order('username');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Memoized fetch rooms function
  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
      
      // Set first room as current if none selected
      if (data && data.length > 0 && !currentRoom) {
        setCurrentRoom(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to load chat rooms. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoom, toast]);

  // Memoized fetch messages function with better error handling
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      // Use pagination for better performance (limit to last 100 messages)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:users(*),
          reply_to:messages(
            id,
            content,
            user:users(*)
          )
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Reverse to show oldest first
      const sortedMessages = (data || []).reverse();

      // Fetch reactions for all messages (optimized query)
      const messageIds = sortedMessages.map(m => m.id);
      if (messageIds.length > 0) {
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('message_id, emoji, user_id, users(username)')
          .in('message_id', messageIds);

        // Group reactions by message (optimized)
        const messageReactions: Record<string, any[]> = {};
        reactionsData?.forEach(reaction => {
          if (!messageReactions[reaction.message_id]) {
            messageReactions[reaction.message_id] = [];
          }
          messageReactions[reaction.message_id].push(reaction);
        });

        // Format messages with reactions (optimized)
        const formattedMessages = sortedMessages.map(message => {
          const reactions = messageReactions[message.id] || [];
          const groupedReactions = reactions.reduce((acc, reaction) => {
            const existing = acc.find((r: any) => r.emoji === reaction.emoji);
            if (existing) {
              existing.count++;
              existing.users.push(reaction.users.username);
            } else {
              acc.push({
                emoji: reaction.emoji,
                count: 1,
                users: [reaction.users.username]
              });
            }
            return acc;
          }, []);

          return {
            ...message,
            reply_to: message.reply_to && message.reply_to.length > 0 ? {
              id: message.reply_to[0].id,
              content: message.reply_to[0].content,
              user: message.reply_to[0].user
            } : undefined,
            reactions: groupedReactions
          };
        });

        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages. Please refresh the chat.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Optimized send message function
  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!user || !currentRoom || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          user_id: user.id,
          room_id: currentRoom,
          reply_to_message_id: replyToId || null
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Message Failed",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, currentRoom, toast]);

  // Optimized add reaction function
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Reaction Failed",
        description: "Unable to add reaction. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to user changes
    const usersChannel = supabase
      .channel('users_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchUsers();
      })
      .subscribe();

    // Subscribe to room changes
    const roomsChannel = supabase
      .channel('rooms_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms'
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, [user]);

  // Set up messages real-time subscription
  useEffect(() => {
    if (!user || !currentRoom) return;

    const messagesChannel = supabase
      .channel(`messages_${currentRoom}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${currentRoom}`
      }, () => {
        fetchMessages(currentRoom);
      })
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions_${currentRoom}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions'
      }, () => {
        fetchMessages(currentRoom);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [user, currentRoom]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      Promise.all([fetchUsers(), fetchRooms()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // Fetch messages when current room changes
  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom);
    }
  }, [currentRoom]);

  // Memoized return object for better performance
  const returnValue = useMemo(() => ({
    users,
    rooms,
    messages,
    currentRoom,
    loading,
    setCurrentRoom,
    sendMessage,
    addReaction,
    fetchUsers,
    fetchRooms,
    fetchMessages
  }), [
    users,
    rooms, 
    messages,
    currentRoom,
    loading,
    sendMessage,
    addReaction,
    fetchUsers,
    fetchRooms,
    fetchMessages
  ]);

  return returnValue;
};
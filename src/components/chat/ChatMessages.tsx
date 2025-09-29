// src/components/chat/ChatMessages.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/supabase';

type DbMessage = {
  id: string;
  room_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
};

interface Props {
  roomId: string;
}

const ChatMessages: React.FC<Props> = ({ roomId }) => {
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // autoscroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // bieżący user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // fetch + realtime sub
  useEffect(() => {
    let mounted = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, room_id, author_id, content, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (!mounted) return;
      if (error) {
        console.error('[messages] fetch error:', error);
        setMessages([]);
        return;
      }
      setMessages((data ?? []) as DbMessage[]);
    };

    fetchMessages();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as DbMessage])
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No messages yet
          <br />
          Start a conversation!
        </div>
      ) : (
        messages.map((m) => {
          const isOwn = currentUserId && m.author_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
              <div
                className={`px-4 py-2 rounded-2xl shadow-sm ${
                  isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                <div className={`mt-1 text-xs opacity-70 ${isOwn ? 'text-white' : 'text-gray-600'}`}>
                  {new Date(m.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;

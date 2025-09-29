import React, { useEffect, useRef, useState } from 'react';
import { useRoomSettings } from '../hooks/useRoomSettings';
import { useUserMentionSearch } from '../hooks/useUserMentionSearch';
import { MentionsDropdown } from './MentionsDropdown';
import { supabase } from '@/integrations/supabase/client';

export const ChatComposer: React.FC<{ roomId: string; onSend?: () => void }> = ({ roomId, onSend }) => {
  const { roomSettings } = useRoomSettings(roomId);
  const [text, setText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, setQuery } = useUserMentionSearch();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const pos = textareaRef.current?.selectionStart || text.length;
    const lastAt = text.slice(0, pos).split(/\s+/).pop();
    if (lastAt && lastAt.startsWith('@')) {
      const q = lastAt.slice(1);
      setQuery(q);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setQuery('');
    }
  }, [text, setQuery]);

  const insertMention = (user: any) => {
    const selStart = textareaRef.current?.selectionStart || text.length;
    const prefix = text.slice(0, selStart).replace(/@[^\\s@]*$/, `@${user.username} `);
    const suffix = text.slice(selStart);
    const newText = prefix + suffix;
    setText(newText);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const enterSends = roomSettings?.enter_sends ?? true;
    if (e.key === 'Enter' && enterSends && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const maxLen = roomSettings?.max_message_length ?? 2000;
    if (text.length > maxLen) {
      alert(`Message too long (max ${maxLen} chars)`);
      return;
    }

    const payload = {
      room_id: roomId,
      author_id: supabase.auth.user()?.id,
      content: text,
    };

    const { data, error } = await supabase.from('messages').insert(payload);
    if (error) {
      console.error('send error', error);
    } else {
      setText('');
      onSend?.();
    }
  };

  return (
    <div className="chat-composer">
      <textarea
        ref={textareaRef}
        className="w-full p-2 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Napisz wiadomość..."
      />

      {showDropdown && <MentionsDropdown items={results} onSelect={insertMention} />}

      <div className="flex items-center justify-end gap-2 mt-2">
        <div className="text-xs text-gray-500">{text.length}/{roomSettings?.max_message_length ?? 2000}</div>
        <button className="btn" onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
};

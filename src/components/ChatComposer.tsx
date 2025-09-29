// src/components/ChatComposer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useRoomSettings } from '../hooks/useRoomSettings';
import { useUserMentionSearch } from '../hooks/useUserMentionSearch';
import { MentionsDropdown } from './MentionsDropdown';
import { supabase } from '@/supabase'; // ✅ alias

export const ChatComposer: React.FC<{ roomId: string; onSend?: () => void }> = ({ roomId, onSend }) => {
  const { roomSettings } = useRoomSettings(roomId);
  const [text, setText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, setQuery } = useUserMentionSearch();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // wykrywanie aktywnego @token przed caretem
  useEffect(() => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret);
    const match = before.match(/@([^\s@]*)$/); // '@' + do końca słowa
    if (match && match[1] !== undefined) {
      const q = match[1];
      setQuery(q);
      setShowDropdown(q.length > 0);
    } else {
      setQuery('');
      setShowDropdown(false);
    }
  }, [text, setQuery]);

  const insertMention = (user: any) => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret);
    const after = text.slice(caret);

    const replacedBefore = before.replace(/@([^\s@]*)$/, `@${user?.username || user?.display_name} `);
    const newText = replacedBefore + after;

    setText(newText);
    setShowDropdown(false);

    requestAnimationFrame(() => {
      if (!el) return;
      const pos = replacedBefore.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const enterSends = roomSettings?.enter_sends ?? true;
    if (e.key === 'Enter' && enterSends && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
    if (e.key === 'Escape') setShowDropdown(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    const maxLen = roomSettings?.max_message_length ?? 2000;
    if (text.length > maxLen) {
      alert(`Message too long (max ${maxLen} chars)`);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { room_id: roomId, author_id: user?.id ?? null, content: text };

      const { error } = await supabase.from('messages').insert(payload);
      if (error) {
        console.error('[composer] send error:', error);
        return;
      }

      setText('');
      onSend?.();
    } catch (e) {
      console.error('[composer] unexpected send error:', e);
    }
  };

  return (
    <div className="chat-composer">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-2 border rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Napisz wiadomość..."
        />

        {showDropdown && (
          <div className="absolute left-2 right-2 -top-2 translate-y-[-100%] z-50">
            <MentionsDropdown items={results} onSelect={insertMention} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        <div className="text-xs text-gray-500">
          {text.length}/{roomSettings?.max_message_length ?? 2000}
        </div>
        <button className="btn" onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
};

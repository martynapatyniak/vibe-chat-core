// src/components/chat/ChatInput.tsx
'use client';

import React from 'react';
import { ChatComposer } from '@/components/ChatComposer';

// Uwaga: używamy any, żeby zachować kompatybilność z istniejącymi propsami,
// nawet jeśli rodzic przekazuje więcej pól (onSend, disabled, itp.).
const ChatInput: React.FC<any> = (props) => {
  // Jeśli rodzic przekazuje roomId w propsach/kontekście – użyjemy go.
  // W przeciwnym razie fallback do Twojego pokoju "Chat Ogólny".
  const roomId: string =
    props?.roomId ?? 'ab8adc15-f652-4b70-b4b2-f49c8370dc29';

  return (
    <div className="border-t bg-white p-4">
      <ChatComposer
        roomId={roomId}
        // jeżeli rodzic przekazuje onSend, przekażemy dalej (opcjonalnie)
        onSend={props?.onSend}
      />
    </div>
  );
};

export default ChatInput;

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { useChatData } from "@/hooks/useChatData";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessagesProps {
  onReply?: (message: any) => void;
  onQuote?: (message: any) => void;
}

export const ChatMessages = ({ onReply, onQuote }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, loading } = useChatData();
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <ScrollArea ref={scrollRef} className="h-full">
        <div className="flex flex-col gap-1 p-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || 
              messages[index - 1].user_id !== message.user_id ||
              (new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime()) > 5 * 60 * 1000;
            
            // Format message for MessageItem component
            const formattedMessage = {
              id: message.id,
              content: message.content,
              author: {
                name: message.user.username,
                avatar: message.user.avatar_url || "",
                role: message.user.role,
                country: message.user.country_code || "🌐"
              },
              timestamp: new Date(message.created_at),
              edited: message.is_edited,
              replyTo: message.reply_to ? {
                id: message.reply_to.id,
                author: message.reply_to.user.username,
                content: message.reply_to.content
              } : undefined,
              reactions: message.reactions,
              attachments: message.file_url ? [{
                id: message.id + '_file',
                name: message.file_url.split('/').pop() || 'file',
                url: message.file_url,
                type: (message.message_type === 'file' ? 'file' : 
                      message.message_type === 'voice' ? 'voice' : 'image') as 'image' | 'file' | 'voice',
                size: undefined
              }] : undefined
            };
            
            return (
              <MessageItem
                key={message.id}
                message={formattedMessage}
                showAvatar={showAvatar}
                className="animate-slide-in"
                onReply={onReply}
                onQuote={onQuote}
                currentUserId={user?.id}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
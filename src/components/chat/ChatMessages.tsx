import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: 'admin' | 'moderator' | 'user';
    country: string;
  };
  timestamp: Date;
  edited?: boolean;
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file' | 'voice';
    size?: number;
  }[];
}

export const ChatMessages = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(true);

  // Mock messages data
  const messages: Message[] = [
    {
      id: '1',
      content: 'Hey everyone! Welcome to our new chat platform 🎉',
      author: { name: 'Alex Chen', avatar: '', role: 'admin', country: '🇺🇸' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      reactions: [
        { emoji: '🎉', count: 5, users: ['Maria', 'John', 'Yuki', 'Emma', 'Pierre'] },
        { emoji: '👋', count: 3, users: ['Maria', 'John', 'Yuki'] }
      ]
    },
    {
      id: '2',
      content: 'This looks amazing! Love the modern design',
      author: { name: 'Maria Rodriguez', avatar: '', role: 'moderator', country: '🇪🇸' },
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      replyTo: { id: '1', author: 'Alex Chen', content: 'Hey everyone! Welcome to our new chat platform 🎉' },
      reactions: [
        { emoji: '❤️', count: 2, users: ['Alex', 'John'] }
      ]
    },
    {
      id: '3',
      content: 'I just uploaded a screenshot of the new features we\'re working on',
      author: { name: 'John Smith', avatar: '', role: 'user', country: '🇬🇧' },
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      attachments: [
        { id: '1', name: 'features-preview.png', url: '/mock-image.jpg', type: 'image' }
      ]
    },
    {
      id: '4',
      content: 'Can we schedule a voice call to discuss the roadmap?',
      author: { name: 'Yuki Tanaka', avatar: '', role: 'user', country: '🇯🇵' },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      edited: true
    },
    {
      id: '5',
      content: 'Sure! I\'ll send you a calendar invite. Also, here\'s a quick voice note about the meeting agenda',
      author: { name: 'Emma Wilson', avatar: '', role: 'user', country: '🇨🇦' },
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      replyTo: { id: '4', author: 'Yuki Tanaka', content: 'Can we schedule a voice call to discuss the roadmap?' },
      attachments: [
        { id: '2', name: 'meeting-agenda.mp3', url: '/mock-audio.mp3', type: 'voice', size: 1024 * 256 }
      ]
    },
    {
      id: '6',
      content: 'Perfect! Looking forward to it. The new chat features are really impressive 🚀',
      author: { name: 'Pierre Dubois', avatar: '', role: 'user', country: '🇫🇷' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      reactions: [
        { emoji: '🚀', count: 4, users: ['Alex', 'Maria', 'John', 'Yuki'] }
      ]
    }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative h-full">
      <ScrollArea ref={scrollRef} className="h-full">
        <div className="flex flex-col gap-1 p-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || 
              messages[index - 1].author.name !== message.author.name ||
              (message.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 5 * 60 * 1000;
            
            return (
              <MessageItem
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                className="animate-slide-in"
              />
            );
          })}
          
          {isTyping && <TypingIndicator users={['Maria Rodriguez']} />}
        </div>
      </ScrollArea>
    </div>
  );
};
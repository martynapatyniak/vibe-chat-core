// src/components/chat/Chat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';

// Typy dla wiadomości
interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isOwn: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

// Komponent pojedynczej wiadomości
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
        {!message.isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="group relative">
          <div
            className={`px-4 py-2 rounded-2xl ${
              message.isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            } shadow-sm`}
          >
            {!message.isOwn && (
              <div className="text-xs font-semibold text-blue-600 mb-1">
                {message.sender.name}
              </div>
            )}
            <div className="break-words">{message.text}</div>
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right mr-2' : 'text-left ml-2'}`}>
            {message.timestamp.toLocaleTimeString('pl-PL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponent inputu dla nowej wiadomości
const MessageInput: React.FC<{
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end space-x-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Paperclip size={20} />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Napisz wiadomość..."
            className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
            rows={1}
            disabled={disabled}
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile size={20} />
          </button>
        </div>
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// Lista użytkowników online
const OnlineUsers: React.FC<{ users: User[] }> = ({ users }) => {
  const onlineUsers = users.filter(user => user.isOnline);
  
  return (
    <div className="p-4 border-b bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Online ({onlineUsers.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {onlineUsers.map(user => (
          <div key={user.id} className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Główny komponent Chat
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Anna Kowalska', isOnline: true },
    { id: '2', name: 'Jan Nowak', isOnline: true },
    { id: '3', name: 'Piotr Smith', isOnline: false },
  ]);
  const [currentUser] = useState<User>({
    id: 'current-user',
    name: 'Ty',
    isOnline: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Przewijanie do ostatniej wiadomości
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Przykładowe wiadomości na start
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        text: 'Cześć wszystkim! Jak się macie?',
        sender: { id: '1', name: 'Anna Kowalska' },
        timestamp: new Date(Date.now() - 300000),
        isOwn: false
      },
      {
        id: '2',
        text: 'Hej Anna! Wszystko w porządku, dzięki 😊',
        sender: { id: '2', name: 'Jan Nowak' },
        timestamp: new Date(Date.now() - 240000),
        isOwn: false
      },
      {
        id: '3',
        text: 'Siema! U mnie też wszystko git',
        sender: currentUser,
        timestamp: new Date(Date.now() - 180000),
        isOwn: true
      }
    ];
    setMessages(sampleMessages);
  }, [currentUser]);

  // Funkcja wysyłania wiadomości
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: currentUser,
      timestamp: new Date(),
      isOwn: true
    };

    // Dodaj wiadomość do stanu
    setMessages(prev => [...prev, newMessage]);
    
    // Tutaj możesz dodać wywołanie API
    try {
      setIsLoading(true);
      // await sendMessageToAPI(newMessage);
      console.log('Wysłano wiadomość:', newMessage);
      
      // Symulacja odpowiedzi bota (opcjonalnie)
      setTimeout(() => {
        if (Math.random() > 0.7) {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Dzięki za wiadomość! 👍',
            sender: { id: 'bot', name: 'ChatBot' },
            timestamp: new Date(),
            isOwn: false
          };
          setMessages(prev => [...prev, botResponse]);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
      // Tutaj możesz dodać obsługę błędów
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header czatu */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat Ogólny</h1>
          <p className="text-sm text-gray-500">
            {users.filter(u => u.isOnline).length} użytkowników online
          </p>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Lista użytkowników online */}
      <OnlineUsers users={users} />

      {/* Obszar wiadomości */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Brak wiadomości. Rozpocznij rozmowę!</p>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Wysyłanie...</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input do wysyłania wiadomości */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;

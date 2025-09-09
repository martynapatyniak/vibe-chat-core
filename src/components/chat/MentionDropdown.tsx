import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'user';
  country: string;
}

interface MentionDropdownProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (user: User) => void;
  onClose: () => void;
}

export const MentionDropdown = ({ 
  isOpen, 
  query, 
  position, 
  onSelect, 
  onClose 
}: MentionDropdownProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mock users data
  const allUsers: User[] = [
    { id: '1', name: 'Alex Chen', avatar: '', role: 'admin', country: '🇺🇸' },
    { id: '2', name: 'Maria Rodriguez', avatar: '', role: 'moderator', country: '🇪🇸' },
    { id: '3', name: 'John Smith', avatar: '', role: 'user', country: '🇬🇧' },
    { id: '4', name: 'Yuki Tanaka', avatar: '', role: 'user', country: '🇯🇵' },
    { id: '5', name: 'Emma Wilson', avatar: '', role: 'user', country: '🇨🇦' },
    { id: '6', name: 'Pierre Dubois', avatar: '', role: 'user', country: '🇫🇷' },
  ];

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator': return <Shield className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            onSelect(filteredUsers[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredUsers, onSelect, onClose]);

  if (!isOpen || filteredUsers.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-popover border border-border rounded-lg shadow-strong min-w-64 max-w-80"
      style={{
        top: position.top - 8,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="p-2">
        <div className="text-xs text-muted-foreground mb-2 px-2">
          Mention a user
        </div>
        <ScrollArea className="max-h-48">
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                index === selectedIndex 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              onClick={() => onSelect(user)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{user.country}</span>
                  <span className="font-medium text-sm truncate">{user.name}</span>
                  {getRoleIcon(user.role)}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};
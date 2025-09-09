import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Volume2, Lock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'private';
  unreadCount?: number;
  isActive?: boolean;
}

export const RoomTabs = () => {
  const [activeRoom, setActiveRoom] = useState('general');
  
  const rooms: Room[] = [
    { id: 'general', name: 'general', type: 'text', isActive: true },
    { id: 'random', name: 'random', type: 'text', unreadCount: 3 },
    { id: 'development', name: 'development', type: 'text', unreadCount: 12 },
    { id: 'voice-general', name: 'Voice General', type: 'voice' },
    { id: 'private-team', name: 'Team Chat', type: 'private', unreadCount: 1 },
    { id: 'announcements', name: 'announcements', type: 'text' },
  ];

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Volume2 className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="border-b border-border bg-chat-header">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 p-2 min-w-max overflow-x-auto">
          {rooms.map((room) => (
            <div key={room.id} className="relative">
              <Button
                variant={activeRoom === room.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveRoom(room.id)}
                className={cn(
                  "h-8 px-3 gap-2 relative",
                  activeRoom === room.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  room.type === 'voice' && "text-green-600 dark:text-green-400",
                  room.type === 'private' && "text-blue-600 dark:text-blue-400"
                )}
              >
                {getRoomIcon(room.type)}
                <span className="font-medium">{room.name}</span>
                
                {room.unreadCount && room.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-4 px-1 text-xs ml-1 min-w-[16px] justify-center"
                  >
                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                  </Badge>
                )}
                
                {activeRoom === room.id && room.id !== 'general' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-primary-foreground/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Close room:', room.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Button>
              
              {room.isActive && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-status-online rounded-full"></div>
              )}
            </div>
          ))}
          
          {/* Add new room button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground ml-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
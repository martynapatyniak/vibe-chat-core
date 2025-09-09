import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Crown, Shield, Users } from "lucide-react";
import { useChatData } from "@/hooks/useChatData";

interface ChatSidebarProps {
  collapsed: boolean;
}

export const ChatSidebar = ({ collapsed }: ChatSidebarProps) => {
  const { users } = useChatData();

  const onlineUsers = users.filter(user => user.status === 'online');
  const awayUsers = users.filter(user => user.status === 'away');
  const offlineUsers = users.filter(user => user.status === 'offline');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator': return <Shield className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  if (collapsed) return null;

  return (
    <div className="bg-chat-sidebar border-r border-border h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Online Users</h2>
          <Badge variant="secondary" className="ml-auto">
            {onlineUsers.length}
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="w-2 h-2 bg-status-online rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Online - {onlineUsers.length}
                </span>
              </div>
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-message-hover transition-colors cursor-pointer group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                        {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online border-2 border-chat-sidebar rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">{user.country_code || '🌐'}</span>
                      <span className="text-sm font-medium text-foreground truncate">{user.username}</span>
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Away Users */}
          {awayUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="w-2 h-2 bg-status-away rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Away - {awayUsers.length}
                </span>
              </div>
              {awayUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-message-hover transition-colors cursor-pointer opacity-75"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                        {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-away border-2 border-chat-sidebar rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">{user.country_code || '🌐'}</span>
                      <span className="text-sm font-medium text-foreground truncate">{user.username}</span>
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Offline Users */}
          {offlineUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="w-2 h-2 bg-status-offline rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Offline - {offlineUsers.length}
                </span>
              </div>
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-message-hover transition-colors cursor-pointer opacity-50"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-offline border-2 border-chat-sidebar rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground truncate">{user.country_code || '🌐'}</span>
                      <span className="text-sm font-medium text-muted-foreground truncate">{user.username}</span>
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Shield, Settings, Plus, LogOut } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { RoomTabs } from "./RoomTabs";
import { AdminBanner } from "./AdminBanner";
import { ModerationPanel } from "./ModerationPanel";
import { RoomManagement } from "./RoomManagement";
import { useAuth } from "@/hooks/useAuth";
import { useChatData } from "@/hooks/useChatData";

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
    type: 'image' | 'file' | 'voice' | 'video';
    size?: number;
  }[];
}

export const ChatLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    author: string;
    content: string;
  } | null>(null);
  const [quotedMessage, setQuotedMessage] = useState<{
    id: string;
    author: string;
    content: string;
  } | null>(null);
  
  const { user, signOut } = useAuth();
  const { users, rooms, currentRoom, loading } = useChatData();

  // Get current user's role
  const currentUser = users.find(u => u.id === user?.id);
  const userRole = currentUser?.role || 'user';

  // Mock announcement
  const announcement = {
    id: '1',
    type: 'announcement' as const,
    title: 'Welcome to ChatFlow!',
    message: 'New enhanced chat features are now live including voice messages, file sharing, and advanced moderation tools.',
    author: 'Alex Chen',
    timestamp: new Date(),
    dismissible: true
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      author: message.author.name,
      content: message.content
    });
  };

  const handleQuote = (message: Message) => {
    setQuotedMessage({
      id: message.id,
      author: message.author.name,
      content: message.content
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-chat-bg ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-smooth ${
        sidebarCollapsed ? 'w-0' : 'w-80'
      } flex-shrink-0`}>
        <ChatSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Admin Banner */}
        <AdminBanner announcement={announcement} />
        
        {/* Header with enhanced controls */}
        <div className="bg-chat-header border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-muted hover:scale-105 transition-transform"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
            <ChatHeader />
          </div>
          
          <div className="flex items-center gap-2">
            {(userRole === 'admin' || userRole === 'moderator') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModerationPanel(true)}
                className="hover:bg-muted hover:scale-105 transition-transform"
              >
                <Shield className="h-5 w-5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoomManagement(true)}
              className="hover:bg-muted hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-muted hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hover:bg-muted hover:scale-105 transition-transform text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Room/Channel Tabs */}
        <RoomTabs />

        {/* Messages Area with better spacing */}
        <div className="flex-1 overflow-hidden bg-chat-bg">
          <ChatMessages onReply={handleReply} onQuote={handleQuote} />
        </div>

        {/* Enhanced Input Area */}
        <div className="bg-chat-input border-t border-border p-6">
          <ChatInput 
            replyTo={replyTo}
            quotedMessage={quotedMessage}
            onClearReply={() => setReplyTo(null)}
            onClearQuote={() => setQuotedMessage(null)}
          />
        </div>
      </div>

      {/* Modals */}
      <ModerationPanel
        isOpen={showModerationPanel}
        onClose={() => setShowModerationPanel(false)}
        userRole={userRole}
      />
      
      <RoomManagement
        isOpen={showRoomManagement}
        onClose={() => setShowRoomManagement(false)}
        userRole={userRole}
        currentRoom={currentRoom || "general"}
      />
    </div>
  );
};
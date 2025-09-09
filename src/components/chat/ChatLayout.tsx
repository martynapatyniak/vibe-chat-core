import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { RoomTabs } from "./RoomTabs";

export const ChatLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
        {/* Header with theme toggle */}
        <div className="bg-chat-header border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-muted"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
            <ChatHeader />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-muted"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Room/Channel Tabs */}
        <RoomTabs />

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages />
        </div>

        {/* Input Area */}
        <div className="bg-chat-input border-t border-border p-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Reply, 
  Edit, 
  Trash2, 
  Crown, 
  Shield,
  Download,
  Play,
  Pause,
  Image as ImageIcon,
  Flag,
  ZoomIn,
  Volume2,
  VolumeX,
  Check,
  X,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  className?: string;
  onReply?: (message: Message) => void;
  onQuote?: (message: Message) => void;
  currentUserId?: string;
}

export const MessageItem = ({ message, showAvatar, className, onReply, onQuote, currentUserId }: MessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const { addReaction, editMessage, deleteMessage } = useChatData();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator': return <Shield className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const toggleVoicePlayback = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement actual audio playback
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message.id);
    }
  };

  const handleReaction = async (emoji: string) => {
    await addReaction(message.id, emoji);
    setShowEmojiPicker(false);
  };

  const isOwnMessage = currentUserId === message.id;

  return (
    <div
      className={cn(
        "group relative px-4 py-2 hover:bg-message-hover transition-colors",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Reply indicator */}
      {message.replyTo && (
        <div className="flex items-center gap-2 mb-2 ml-12 text-sm text-muted-foreground">
          <Reply className="h-3 w-3" />
          <span className="font-medium">@{message.replyTo.author}</span>
          <span className="truncate max-w-md">{message.replyTo.content}</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={message.author.avatar} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                {message.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 flex items-center justify-center">
              {isHovered && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Author and timestamp */}
          {showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{message.author.country}</span>
              <span className="font-semibold text-foreground text-sm">
                {message.author.name}
              </span>
              {getRoleIcon(message.author.role)}
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
              {message.edited && (
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  edited
                </Badge>
              )}
            </div>
          )}

          {/* Message text */}
          <div className="text-sm text-foreground leading-relaxed mb-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleEdit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  className="text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleEdit} variant="ghost">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => setIsEditing(false)} variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className={cn(message.content === '[Message deleted]' && "italic text-muted-foreground")}>
                {message.content}
              </span>
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 mb-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="max-w-md">
                  {attachment.type === 'image' && (
                    <div className="relative group/image max-w-md">
                      <img
                        src="/placeholder.svg"
                        alt={attachment.name}
                        className="rounded-lg border border-border max-h-80 object-cover cursor-pointer hover:brightness-90 transition-all"
                        onClick={() => console.log('Open image modal')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors rounded-lg"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity flex gap-1">
                        <Button variant="secondary" size="sm" className="shadow-md h-8 w-8 p-0">
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="sm" className="shadow-md h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {attachment.type === 'voice' && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border max-w-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleVoicePlayback}
                        className="h-10 w-10 p-0 hover:bg-background"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{attachment.name}</span>
                          {attachment.size && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </span>
                          )}
                        </div>
                        <div className="h-2 bg-background rounded-full">
                          <div className="h-2 bg-primary rounded-full w-1/3 transition-all"></div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>0:23 / 1:15</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-background h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {attachment.type === 'video' && (
                    <div className="relative max-w-lg group/video">
                      <video
                        className="w-full rounded-lg border border-border max-h-80"
                        controls
                        poster="/placeholder.svg"
                      >
                        <source src={attachment.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute top-2 right-2 opacity-0 group-hover/video:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" className="shadow-md h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {attachment.type === 'file' && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="p-2 bg-primary/10 rounded">
                        <ImageIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{attachment.name}</div>
                        {attachment.size && (
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-background">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.emoji)}
                  className="h-6 px-2 hover:bg-muted text-xs border border-border/50 hover:border-border"
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-6 px-2 hover:bg-muted text-xs border border-border/50 hover:border-border"
              >
                <Smile className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="flex gap-1 mb-2 p-2 bg-muted rounded-lg">
              {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(emoji)}
                  className="h-8 w-8 p-0 hover:bg-background"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Message actions */}
        {isHovered && !isEditing && (
          <div className="absolute top-2 right-4 flex items-center gap-1 bg-chat-header shadow-soft border border-border rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => onReply?.(message)}
              title="Reply"
            >
              <Reply className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => onQuote?.(message)}
              title="Quote"
            >
              <Flag className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add reaction"
            >
              <Smile className="h-3 w-3" />
            </Button>
            {isOwnMessage && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setIsEditing(true)}
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleDelete}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
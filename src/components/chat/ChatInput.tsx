import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  X,
  Image,
  File,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionDropdown } from "./MentionDropdown";
import { DragDropOverlay } from "./DragDropOverlay";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'user';
  country: string;
}

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [replyTo, setReplyTo] = useState<{
    author: string;
    content: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidDrop, setIsValidDrop] = useState(false);
  const [mentionDropdown, setMentionDropdown] = useState<{
    isOpen: boolean;
    query: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: "",
    position: { top: 0, left: 0 }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    
    // Auto-link detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const processedMessage = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    console.log('Sending message:', { 
      message: processedMessage, 
      attachedFiles, 
      replyTo 
    });
    
    setMessage("");
    setAttachedFiles([]);
    setReplyTo(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Send message with Enter
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
      adjustTextareaHeight();
      handleMentionDetection(value, e.target.selectionStart);
    }
  };

  const handleMentionDetection = (text: string, cursorPosition: number) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      setMentionDropdown({
        isOpen: true,
        query: mentionMatch[1],
        position: {
          top: rect.top,
          left: rect.left + 20
        }
      });
    } else {
      setMentionDropdown(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleMentionSelect = (user: User) => {
    const beforeAt = message.substring(0, message.lastIndexOf('@'));
    const afterMention = message.substring(message.indexOf(' ', message.lastIndexOf('@')) !== -1 
      ? message.indexOf(' ', message.lastIndexOf('@')) 
      : message.length);
    
    const newMessage = beforeAt + `@${user.name} ` + message.substring(message.lastIndexOf('@') + mentionDropdown.query.length + 1);
    setMessage(newMessage);
    setMentionDropdown(prev => ({ ...prev, isOpen: false }));
    textareaRef.current?.focus();
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
    }
    
    const allowedTypes = [
      'image/', 'video/', 'audio/',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument',
      'text/plain'
    ];
    
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      return { valid: false, error: 'File type not supported' };
    }
    
    return { valid: true };
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    if (errors.length > 0) {
      console.error('File upload errors:', errors);
      // Here you would show toast notifications for errors
    }
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
    setIsValidDrop(hasFiles);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const characterCount = message.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;

  return (
    <div 
      className="space-y-3 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay isDragging={isDragging} isValidDrop={isValidDrop} />
      
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-t-lg border-l-4 border-primary animate-slide-in">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">Replying to @{replyTo.author}</div>
            <div className="text-sm text-foreground truncate">{replyTo.content}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(null)}
            className="hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File attachments */}
      {attachedFiles.length > 0 && (
        <div className="space-y-2 p-3 bg-muted rounded-lg animate-slide-in">
          <div className="text-xs text-muted-foreground mb-2">
            Attachments ({attachedFiles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-background p-2 rounded-md border hover:shadow-soft transition-shadow"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4 text-blue-500" />
                ) : (
                  <File className="h-4 w-4 text-gray-500" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-foreground truncate max-w-32">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="hover:bg-muted self-end mb-2 hover:scale-105 transition-transform"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none pr-24 bg-background border-border",
              "focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
              isOverLimit && "border-destructive focus:ring-destructive"
            )}
            rows={1}
          />
          
          {/* Character counter */}
          <div className={cn(
            "absolute bottom-1 right-14 text-xs transition-colors",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}>
            {characterCount}/{MAX_MESSAGE_LENGTH}
          </div>
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-12 top-2 hover:bg-muted hover:scale-105 transition-transform"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Voice recording button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={cn(
              "absolute right-2 top-2 hover:bg-muted transition-all hover:scale-105",
              isRecording && "bg-destructive text-destructive-foreground animate-pulse"
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachedFiles.length === 0) || isOverLimit}
          className={cn(
            "bg-gradient-primary hover:bg-primary-hover self-end mb-2 transition-all",
            "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg animate-pulse">
          <div className="w-2 h-2 bg-destructive rounded-full animate-ping"></div>
          <span className="text-sm font-medium">Recording voice message...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className="ml-auto hover:bg-destructive/20"
          >
            Stop
          </Button>
        </div>
      )}

      {/* Mention dropdown */}
      <MentionDropdown
        isOpen={mentionDropdown.isOpen}
        query={mentionDropdown.query}
        position={mentionDropdown.position}
        onSelect={handleMentionSelect}
        onClose={() => setMentionDropdown(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Tips */}
      <div className="text-xs text-muted-foreground px-1">
        <span>Use @ to mention users • Shift+Enter for new line • Max {MAX_FILE_SIZE / 1024 / 1024}MB per file</span>
      </div>
    </div>
  );
};
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { useChatData } from "@/hooks/useChatData";
import { useToast } from "@/hooks/use-toast";
import { validateMessage, sanitizeInput, messageRateLimiter } from "@/lib/validation";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
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

  const { sendMessage, users } = useChatData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rate limiting check
  const isRateLimited = useMemo(() => {
    return messageRateLimiter.isRateLimited('user'); // In real app, use actual user ID
  }, []);

  const handleSend = useCallback(async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    
    // Validate message
    const validation = validateMessage(message);
    if (!validation.isValid) {
      toast({
        title: "Invalid Message",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Check rate limiting
    if (isRateLimited) {
      toast({
        title: "Rate Limited",
        description: "You're sending messages too quickly. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      if (attachedFiles.length > 0) {
        toast({
          title: "File upload",
          description: "File upload functionality coming soon!",
        });
        return;
      }
      
      // Sanitize and send message
      const sanitizedMessage = sanitizeInput(message);
      messageRateLimiter.recordAttempt('user'); // In real app, use actual user ID
      
      await sendMessage(sanitizedMessage, replyTo?.id);
      
      setMessage("");
      setAttachedFiles([]);
      setReplyTo(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [message, attachedFiles, replyTo, sendMessage, toast, isRateLimited]);

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

  const handleMentionSelect = (user: any) => {
    const beforeAt = message.substring(0, message.lastIndexOf('@'));
    const newMessage = beforeAt + `@${user.username} ` + message.substring(message.lastIndexOf('@') + mentionDropdown.query.length + 1);
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
      toast({
        title: "File validation errors",
        description: errors.join(', '),
        variant: "destructive",
      });
    }
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice recording",
        description: "Voice message functionality coming soon!",
      });
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // ... keep existing code (drag and drop handlers and other functions)

  const characterCount = message.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;

  return (
    <div 
      className="space-y-3 relative"
      // ... keep existing drag handlers
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
                    {Math.round(file.size / 1024)} KB
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
          disabled={(!message.trim() && attachedFiles.length === 0) || isOverLimit || isSending || isRateLimited}
          className={cn(
            "bg-gradient-primary hover:bg-primary-hover self-end mb-2 transition-all",
            "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
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
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  X,
  Image,
  File
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [replyTo, setReplyTo] = useState<{
    author: string;
    content: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    
    // Here you would send the message to your backend
    console.log('Sending message:', { message, attachedFiles, replyTo });
    
    setMessage("");
    setAttachedFiles([]);
    setReplyTo(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="space-y-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-t-lg border-l-4 border-primary">
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
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-background p-2 rounded-md border"
            >
              {file.type.startsWith('image/') ? (
                <Image className="h-4 w-4 text-blue-500" />
              ) : (
                <File className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-foreground truncate max-w-32">
                {file.name}
              </span>
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
      )}

      {/* Main input area */}
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="hover:bg-muted self-end mb-2"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none pr-24 bg-background border-border",
              "focus:ring-2 focus:ring-primary focus:border-transparent"
            )}
            rows={1}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-12 top-2 hover:bg-muted"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Voice recording button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={cn(
              "absolute right-2 top-2 hover:bg-muted",
              isRecording && "bg-destructive text-destructive-foreground animate-pulse"
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() && attachedFiles.length === 0}
          className="bg-gradient-primary hover:bg-primary-hover self-end mb-2"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-lg animate-pulse">
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
    </div>
  );
};
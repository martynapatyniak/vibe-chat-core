import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  users: string[];
}

export const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  const formatTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-start gap-3 px-4 py-2 animate-fade-in">
      <Avatar className="h-6 w-6">
        <AvatarImage src="" />
        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
          {users[0]?.split(' ').map(n => n[0]).join('') || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground italic">
          {formatTypingText()}
        </span>
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-typing"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
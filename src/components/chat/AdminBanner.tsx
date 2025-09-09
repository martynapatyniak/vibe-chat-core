import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Megaphone, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  title: string;
  message: string;
  author: string;
  timestamp: Date;
  dismissible: boolean;
}

interface AdminBannerProps {
  announcement?: Announcement;
  onDismiss?: (id: string) => void;
}

export const AdminBanner = ({ announcement, onDismiss }: AdminBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!announcement || !isVisible) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-900 dark:text-yellow-100";
      case 'success':
        return "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-100";
      case 'announcement':
        return "bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-100";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100";
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.(announcement.id);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className={cn(
      "border-b border-border p-4 animate-slide-in",
      getStyles(announcement.type)
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(announcement.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{announcement.title}</h3>
            <Badge variant="outline" className="text-xs">
              {announcement.type}
            </Badge>
          </div>
          
          <p className="text-sm leading-relaxed mb-2">
            {announcement.message}
          </p>
          
          <div className="flex items-center gap-2 text-xs opacity-75">
            <span>By {announcement.author}</span>
            <span>•</span>
            <span>{formatTime(announcement.timestamp)}</span>
          </div>
        </div>

        {announcement.dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 hover:bg-background/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
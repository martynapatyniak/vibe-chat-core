import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Ban, 
  Volume2, 
  Eye, 
  MessageSquare,
  User,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationAction {
  id: string;
  type: 'warning' | 'mute' | 'ban' | 'report';
  targetUser: string;
  moderator: string;
  reason: string;
  duration?: string;
  timestamp: Date;
  status: 'pending' | 'active' | 'expired';
}

interface ModerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'moderator' | 'user';
}

export const ModerationPanel = ({ isOpen, onClose, userRole }: ModerationPanelProps) => {
  const [selectedAction, setSelectedAction] = useState<'warning' | 'mute' | 'ban' | 'report'>('warning');
  const [targetUser, setTargetUser] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("1h");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock moderation actions
  const moderationActions: ModerationAction[] = [
    {
      id: '1',
      type: 'warning',
      targetUser: 'John Smith',
      moderator: 'Alex Chen',
      reason: 'Inappropriate language',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active'
    },
    {
      id: '2',
      type: 'mute',
      targetUser: 'Spam Bot',
      moderator: 'Maria Rodriguez',
      reason: 'Spam messages',
      duration: '24h',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '3',
      type: 'ban',
      targetUser: 'Troll User',
      moderator: 'Alex Chen',
      reason: 'Repeated violations',
      duration: 'permanent',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'active'
    }
  ];

  if (!isOpen || (userRole !== 'admin' && userRole !== 'moderator')) return null;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'mute': return <Volume2 className="h-4 w-4 text-orange-500" />;
      case 'ban': return <Ban className="h-4 w-4 text-red-500" />;
      case 'report': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmitAction = () => {
    if (!targetUser.trim() || !reason.trim()) return;

    const newAction: ModerationAction = {
      id: Date.now().toString(),
      type: selectedAction,
      targetUser,
      moderator: 'Current User', // Would be actual moderator name
      reason,
      duration: selectedAction !== 'warning' ? duration : undefined,
      timestamp: new Date(),
      status: 'active'
    };

    console.log('New moderation action:', newAction);
    
    // Reset form
    setTargetUser("");
    setReason("");
    setDuration("1h");
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-strong">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Moderation Panel
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Access
            </Badge>
          </div>

          {/* Action Form */}
          <div className="p-4 border-b border-border space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <div className="flex gap-2">
                {(['warning', 'mute', 'ban', 'report'] as const).map(action => (
                  <Button
                    key={action}
                    variant={selectedAction === action ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAction(action)}
                    className="flex items-center gap-1"
                  >
                    {getActionIcon(action)}
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target User</label>
              <Input
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="Enter username..."
                className="w-full"
              />
            </div>

            {selectedAction !== 'warning' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {['1h', '24h', '7d', 'permanent'].map(dur => (
                    <Button
                      key={dur}
                      variant={duration === dur ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDuration(dur)}
                    >
                      {dur}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this action..."
                className="w-full h-20 resize-none"
              />
            </div>

            <Button 
              onClick={handleSubmitAction}
              disabled={!targetUser.trim() || !reason.trim()}
              className="w-full bg-gradient-primary"
            >
              Submit {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
            </Button>
          </div>

          {/* Recent Actions */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">Recent Actions</h3>
                <Badge variant="outline">{moderationActions.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search actions..."
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {moderationActions
                  .filter(action => 
                    action.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    action.reason.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(action => (
                  <div key={action.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.type)}
                        <span className="font-medium text-sm">{action.type.toUpperCase()}</span>
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(action.status))}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(action.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{action.targetUser}</span>
                        {action.duration && (
                          <Badge variant="outline" className="text-xs">
                            {action.duration}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{action.reason}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        By {action.moderator}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
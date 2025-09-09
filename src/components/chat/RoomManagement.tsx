import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Settings, 
  Lock, 
  Users, 
  Hash, 
  Volume2, 
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'private';
  description?: string;
  isPasswordProtected: boolean;
  memberCount: number;
  maxMembers?: number;
  owner: string;
  moderators: string[];
  members: string[];
  createdAt: Date;
}

interface RoomManagementProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'moderator' | 'user';
  currentRoom: string;
}

export const RoomManagement = ({ isOpen, onClose, userRole, currentRoom }: RoomManagementProps) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'members'>('create');
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<'text' | 'voice' | 'private'>('text');
  const [roomDescription, setRoomDescription] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [maxMembers, setMaxMembers] = useState(50);

  // Mock rooms data
  const rooms: Room[] = [
    {
      id: 'general',
      name: 'general',
      type: 'text',
      description: 'General discussion for everyone',
      isPasswordProtected: false,
      memberCount: 47,
      owner: 'Alex Chen',
      moderators: ['Maria Rodriguez'],
      members: ['John Smith', 'Yuki Tanaka', 'Emma Wilson', 'Pierre Dubois'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'development',
      name: 'development',
      type: 'text',
      description: 'Development discussions and code reviews',
      isPasswordProtected: true,
      memberCount: 12,
      maxMembers: 20,
      owner: 'Alex Chen',
      moderators: ['Maria Rodriguez'],
      members: ['John Smith', 'Yuki Tanaka'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'voice-general',
      name: 'Voice General',
      type: 'voice',
      description: 'Voice chat for casual conversations',
      isPasswordProtected: false,
      memberCount: 5,
      maxMembers: 25,
      owner: 'Alex Chen',
      moderators: [],
      members: ['Emma Wilson', 'Pierre Dubois'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const currentRoomData = rooms.find(room => room.id === currentRoom);

  if (!isOpen) return null;

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Volume2 className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;

    const newRoom: Room = {
      id: roomName.toLowerCase().replace(/\s+/g, '-'),
      name: roomName,
      type: roomType,
      description: roomDescription,
      isPasswordProtected,
      memberCount: 1,
      maxMembers: roomType === 'voice' ? maxMembers : undefined,
      owner: 'Current User',
      moderators: [],
      members: [],
      createdAt: new Date()
    };

    console.log('Creating new room:', newRoom);
    
    // Reset form
    setRoomName("");
    setRoomDescription("");
    setRoomPassword("");
    setIsPasswordProtected(false);
    setMaxMembers(50);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-card border border-border rounded-2xl shadow-strong">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Room Management
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2">
              {['create', 'manage', 'members'].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab as any)}
                  className="capitalize"
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'create' && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Room Name</label>
                      <Input
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter room name..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Room Type</label>
                      <div className="flex gap-2">
                        {(['text', 'voice', 'private'] as const).map(type => (
                          <Button
                            key={type}
                            variant={roomType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRoomType(type)}
                            className="flex items-center gap-1"
                          >
                            {getRoomIcon(type)}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Input
                        value={roomDescription}
                        onChange={(e) => setRoomDescription(e.target.value)}
                        placeholder="Brief description of the room..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Password Protection</label>
                      <Switch
                        checked={isPasswordProtected}
                        onCheckedChange={setIsPasswordProtected}
                      />
                    </div>

                    {isPasswordProtected && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Password</label>
                        <Input
                          type="password"
                          value={roomPassword}
                          onChange={(e) => setRoomPassword(e.target.value)}
                          placeholder="Enter room password..."
                          className="w-full"
                        />
                      </div>
                    )}

                    {roomType === 'voice' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Max Members</label>
                        <Input
                          type="number"
                          value={maxMembers}
                          onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)}
                          min={2}
                          max={100}
                          className="w-full"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={handleCreateRoom}
                      disabled={!roomName.trim()}
                      className="w-full bg-gradient-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Room
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {rooms.map(room => (
                    <div key={room.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getRoomIcon(room.type)}
                            <h3 className="font-semibold">{room.name}</h3>
                            {room.isPasswordProtected && (
                              <Key className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {room.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {room.memberCount} members
                          </Badge>
                          {(userRole === 'admin' || room.owner === 'Current User') && (
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Owner: {room.owner}</span>
                          <span>Created: {formatDate(room.createdAt)}</span>
                        </div>
                        {room.maxMembers && (
                          <span>{room.memberCount}/{room.maxMembers} members</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === 'members' && currentRoomData && (
              <div className="flex h-full">
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getRoomIcon(currentRoomData.type)}
                      <h3 className="font-semibold">{currentRoomData.name}</h3>
                      <Badge variant="outline">{currentRoomData.memberCount} members</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentRoomData.description}</p>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {/* Owner */}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                              AC
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{currentRoomData.owner}</span>
                              <Crown className="h-3 w-3 text-yellow-500" />
                              <Badge variant="secondary" className="text-xs">Owner</Badge>
                            </div>
                          </div>
                          {userRole === 'admin' && (
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Moderators */}
                      {currentRoomData.moderators.map(moderator => (
                        <div key={moderator} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                                {moderator.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{moderator}</span>
                                <Shield className="h-3 w-3 text-blue-500" />
                                <Badge variant="secondary" className="text-xs">Moderator</Badge>
                              </div>
                            </div>
                            {(userRole === 'admin' || currentRoomData.owner === 'Current User') && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Members */}
                      {currentRoomData.members.map(member => (
                        <div key={member} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                {member.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{member}</span>
                            </div>
                            {(userRole === 'admin' || userRole === 'moderator' || currentRoomData.owner === 'Current User') && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <UserPlus className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
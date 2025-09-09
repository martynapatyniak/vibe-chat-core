import { Hash, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ChatHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">general</h1>
        <Badge variant="secondary" className="text-xs">
          47 members
        </Badge>
      </div>
      
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="sm" className="hover:bg-muted">
          <Volume2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-muted">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
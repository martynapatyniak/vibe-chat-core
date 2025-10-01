import React, { useMemo, useState } from "react";
import { usePresence } from "@/features/presence/usePresence";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  roomId: string;
  icMemberId: string;
  usersIndex?: Record<string, { name: string }>;
  className?: string;
};

export default function ActiveUsersButton({ roomId, icMemberId, usersIndex, className }: Props) {
  const { onlineMembers } = usePresence({ roomId, icMemberId });
  const [open, setOpen] = useState(false);

  const list = useMemo(() => Array.from(onlineMembers), [onlineMembers]);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{list.length} online</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Users</h4>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users online</p>
            ) : (
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {list.map((userId) => (
                  <li key={userId} className="text-sm py-1 px-2 rounded hover:bg-accent">
                    {usersIndex?.[userId]?.name || userId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

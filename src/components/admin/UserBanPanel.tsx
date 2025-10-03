import React, { useState } from "react";
import { banUser, unbanUser } from "@/features/moderation/useBanUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { validateMessage } from "@/lib/validation";

export default function UserBanPanel() {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBan = async () => {
    if (!userId.trim()) {
      toast.error("User ID is required");
      return;
    }

    const validation = validateMessage(reason);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid reason");
      return;
    }

    setLoading(true);
    try {
      await banUser(userId, reason);
      toast.success("User banned successfully");
      setUserId("");
      setReason("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to ban user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!userId.trim()) {
      toast.error("User ID is required");
      return;
    }

    setLoading(true);
    try {
      await unbanUser(userId);
      toast.success("User unbanned successfully");
      setUserId("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ban / Unban User</CardTitle>
        <CardDescription>Manage user bans with proper authorization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="User ID (UUID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
        />
        <Input
          placeholder="Reason (required for ban)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          maxLength={500}
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleBan}
            disabled={loading}
          >
            {loading ? "Processing..." : "Ban User"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleUnban}
            disabled={loading}
          >
            {loading ? "Processing..." : "Unban User"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from "react";
import { banUser, unbanUser } from "@/features/moderation/useBanUser";

export default function UserBanPanel() {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Ban / Unban User</h2>
      <input
        className="border p-1 mr-2"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        className="border p-1 mr-2"
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        className="bg-red-500 text-white px-2 py-1 mr-2"
        onClick={() => banUser(userId, reason)}
      >
        Ban
      </button>
      <button
        className="bg-green-500 text-white px-2 py-1"
        onClick={() => unbanUser(userId)}
      >
        Unban
      </button>
    </div>
  );
}
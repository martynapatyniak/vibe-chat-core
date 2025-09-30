import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/features/moderation/useAuditLog";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Audit Logs</h2>
      <ul className="text-sm">
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.action}</strong> by {log.user_id} at {log.created_at}
            {log.details ? ` — ${log.details}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
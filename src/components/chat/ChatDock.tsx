import React, { useState } from "react";

export default function ChatDock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96">
      {open ? (
        <div className="border bg-white shadow-lg flex flex-col h-80 sm:h-[32rem]">
          <div className="flex justify-between items-center border-b px-2 py-1 bg-gray-100">
            <span className="font-semibold text-sm">💬 Chat</span>
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={() => setOpen(false)}
            >
              Zwiń
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      ) : (
        <button
          className="m-2 px-3 py-1 border rounded shadow bg-white"
          onClick={() => setOpen(true)}
        >
          💬 Otwórz chat
        </button>
      )}
    </div>
  );
}

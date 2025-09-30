import React from "react";

type Props = {
  unreadCount: number;
  onClick: () => void;
};

export default function UnreadBanner({ unreadCount, onClick }: Props) {
  if (unreadCount <= 0) return null;
  return (
    <div className="sticky bottom-2 flex justify-center">
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded shadow"
        onClick={onClick}
      >
        {unreadCount} nowych — przejdź do najnowszych
      </button>
    </div>
  );
}
import React from "react";
import { useRooms } from "@/features/rooms/useRooms";

export default function RoomsList() {
  const { rooms, loading } = useRooms();

  if (loading) return <p>Ładowanie pokoi...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold">Pokoje</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-500">Brak pokoi</p>
      ) : (
        <ul className="list-disc list-inside">
          {rooms.map((room) => (
            <li key={room.id}>
              <span className="font-medium">{room.name}</span>{" "}
              <span className="text-sm text-gray-500">{room.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
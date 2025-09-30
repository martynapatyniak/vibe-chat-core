import React, { useState } from "react";
import { useCreateRoom } from "@/features/rooms/useCreateRoom";

export default function CreateRoomForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createRoom, loading } = useCreateRoom();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createRoom(name, description);
      setName("");
      setDescription("");
    } catch (err) {
      alert("Nie udało się stworzyć pokoju.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        placeholder="Nazwa pokoju"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
      <input
        type="text"
        placeholder="Opis (opcjonalnie)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Tworzenie..." : "Stwórz pokój"}
      </button>
    </form>
  );
}
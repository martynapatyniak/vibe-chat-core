import React, { useMemo, useState } from "react";
import { usePresence } from "@/features/presence/usePresence";

type Props = {
  roomId: string;
  icMemberId: string;           // mój id (do presence)
  usersIndex?: Record<string, { name: string }>; // opcjonalny słownik id->nazwa
  className?: string;
};

export default function ActiveUsersButton({ roomId, icMemberId, usersIndex, className }: Props) {
  const { onlineMembers } = usePresence({ roomId, icMemberId });
  const [open, setOpen] = useState(false);

  const list = useMemo(() => Array.from(onlineMembers), [onlineMembers]);

  return (
    <div className={["relative", className ?? ""].join(" ")}>
      <button
        type="button"
        onClick={()
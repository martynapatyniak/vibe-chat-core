import React from "react";
import { useSoundPrefs } from "@/features/sounds/useSoundPrefs";

type Props = {
  userId: string;
  className?: string;
};

export default function SoundToggles({ userId, className }: Props) {
  const { prefs, save } = useSoundPrefs(userId);

  if (!prefs) return null;

  return (
    <div className={["flex items-center gap-4 text-sm", className ?? ""].join(" ")}>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!prefs.sound_new_msg}
          onChange={(e) => save({ sound_new_msg: e.target.checked })}
        />
        Dźwięk nowych wiadomości
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!prefs.sound_mention}
          onChange={(e) => save({ sound_mention: e.target.checked })}
        />
        Dźwięk @wzmianek
      </label>
    </div>
  );
}
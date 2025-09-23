import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type RoomSettings = {
  show_flags?: boolean;
  show_rank?: boolean;
  enter_sends?: boolean;
  max_message_length?: number;
};

export function useRoomSettings(roomId: string) {
  const [roomSettings, setRoomSettings] = useState<RoomSettings | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('room_settings')
        .select('*')
        .eq('room_id', roomId)
        .single();
      if (!error && data) setRoomSettings(data as RoomSettings);
    };
    fetchSettings();
  }, [roomId]);

  return { roomSettings };
}

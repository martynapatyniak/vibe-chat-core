import React, { useEffect, useRef, useState } from 'react';
import { uploadFile } from './uploader';

type Props = { icMemberId: string; onUploaded: (voiceUrl: string) => void };

export default function VoiceRecorder({ icMemberId, onUploaded }: Props) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const chunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (rec && rec.state !== 'inactive') rec.stop();
    };
  }, [rec]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunks.current = [];
    mediaRec.ondataavailable = (e) => e.data && chunks.current.push(e.data);
    mediaRec.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const att = await uploadFile(icMemberId, file);
      onUploaded(att.url);
    };
    setRec(mediaRec);
    mediaRec.start();
    setRecording(true);
  }

  function stop() {
    rec?.stop();
    setRecording(false);
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      title={recording ? 'Zatrzymaj nagrywanie' : 'Nagraj wiadomość głosową'}
      className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 border"
    >
      {recording ? '■ Stop' : '🎤 Nagraj'}
    </button>
  );
}

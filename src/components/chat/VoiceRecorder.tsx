import React, { useState, useRef } from "react";

export default function VoiceRecorder({ onSend }: { onSend: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunks.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      onSend(blob);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <button className="px-2 py-1 border rounded bg-red-100" onClick={startRecording}>
          🎙️ Nagraj
        </button>
      ) : (
        <button className="px-2 py-1 border rounded bg-green-100" onClick={stopRecording}>
          ⏹️ Stop
        </button>
      )}
      {audioUrl && <audio src={audioUrl} controls className="ml-2" />}
    </div>
  );
}

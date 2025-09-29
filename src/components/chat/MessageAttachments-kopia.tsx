import React from 'react';
import type { Attachment } from '@/features/upload/uploader';

export default function MessageAttachments({ attachments }: { attachments: Attachment[] }) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {attachments.map((a, i) => {
        if (a.kind === 'image') {
          return <img key={i} src={a.url} alt={a.name} className="rounded-lg" />;
        }
        if (a.kind === 'audio') {
          return <audio key={i} src={a.url} controls className="w-full" />;
        }
        if (a.kind === 'video') {
          return <video key={i} src={a.url} controls className="w-full rounded-lg" />;
        }
        return (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-sm underline break-all">
            {a.name}
          </a>
        );
      })}
    </div>
  );
}

import React from 'react';
import type { Attachment } from '@/features/upload/uploader';

export default function AttachmentPreview({
  items,
  onRemove,
}: {
  items: Attachment[];
  onRemove: (idx: number) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {items.map((a, i) => (
        <div key={i} className="relative rounded-lg border p-2 bg-background/60">
          {a.kind === 'image' ? (
            <img src={a.url} alt={a.name} className="w-full h-28 object-cover rounded" />
          ) : (
            <div className="text-xs break-all">{a.name}</div>
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 text-xs bg-black/60 text-white px-1 rounded"
            aria-label="Usuń załącznik"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

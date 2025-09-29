import React from 'react';
import type { LinkEmbed } from '@/features/upload/linkParser';

export default function LinkEmbed({ embed }: { embed: LinkEmbed }) {
  if (!embed) return null;

  if (embed.type === 'youtube') {
    const src = `https://www.youtube.com/embed/${embed.id}`;
    return (
      <div className="mt-2 aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src={src}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (embed.type === 'audio') return <audio className="w-full mt-2" src={embed.url} controls />;
  if (embed.type === 'video') return <video className="w-full mt-2 rounded-lg" src={embed.url} controls />;

  // zwykły link
  if (embed.type === 'url') {
    return (
      <a className="mt-2 inline-block underline break-all" href={embed.url} target="_blank" rel="noreferrer">
        {embed.url}
      </a>
    );
  }
  return null;
}

import React from "react";

type Props = { url: string };

function isYouTube(u: string) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(u);
}

function ytEmbedUrl(u: string) {
  // obsługa ?v= i youtu.be/ID
  const vParam = new URL(u).searchParams.get("v");
  const id = vParam || u.split("youtu.be/")[1]?.split(/[?&]/)[0];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function isAudio(u: string) {
  return /\.(mp3|wav|ogg|m4a)(\?|#|$)/i.test(u);
}

function isVideo(u: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(u);
}

export default function LinkPreview({ url }: Props) {
  try {
    const u = new URL(url);
    if (isYouTube(url)) {
      const src = ytEmbedUrl(url);
      if (src) {
        return (
          <div className="mt-2">
            <iframe
              className="w-full aspect-video rounded border"
              src={src}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }
    }
    if (isAudio(url)) {
      return (
        <div className="mt-2">
          <audio controls preload="metadata" className="w-full">
            <source src={url} />
          </audio>
        </div>
      );
    }
    if (isVideo(url)) {
      return (
        <div className="mt-2">
          <video controls playsInline preload="metadata" className="w-full rounded border">
            <source src={url} />
          </video>
        </div>
      );
    }
    // fallback: nic nie renderuj, zwykły link obsłuży tekst
    return null;
  } catch {
    return null;
  }
}

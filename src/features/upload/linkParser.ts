export type LinkEmbed =
  | { type: 'youtube'; id: string; url: string }
  | { type: 'audio'; url: string }
  | { type: 'video'; url: string }
  | { type: 'url'; url: string }
  | null;

const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/i;

export function detectEmbedFromText(text: string): LinkEmbed {
  const url = (text.match(/https?:\/\/\S+/i) || [])[0];
  if (!url) return null;

  const m = url.match(yt);
  if (m?.[1]) return { type: 'youtube', id: m[1], url };
  if (/\.(mp3|wav|ogg)(\?|$)/i.test(url)) return { type: 'audio', url };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: 'video', url };
  return { type: 'url', url };
}

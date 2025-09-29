import { supabase } from '@/lib/supabaseClient';

export type Attachment = {
  url: string;
  name: string;
  size: number;
  mime: string;
  kind: 'image' | 'video' | 'audio' | 'file';
  width?: number;
  height?: number;
  duration?: number;
};

function pickKind(mime: string): Attachment['kind'] {
  if (mime?.startsWith('image/')) return 'image';
  if (mime?.startsWith('video/')) return 'video';
  if (mime?.startsWith('audio/')) return 'audio';
  return 'file';
}

export async function uploadFile(icMemberId: string, file: File): Promise<Attachment> {
  const ts = Date.now();
  const safeName = `${ts}-${file.name}`.replace(/\s+/g, '_');
  const path = `${icMemberId}/${safeName}`;

  const { error } = await supabase.storage
    .from('chat-uploads')
    .upload(path, file, { contentType: file.type || undefined, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('chat-uploads').getPublicUrl(path);
  const url = data?.publicUrl!;
  const att: Attachment = {
    url,
    name: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream',
    kind: pickKind(file.type || ''),
  };

  if (att.kind === 'image') {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => { att.width = img.width; att.height = img.height; resolve(); };
      img.onerror = () => resolve();
      img.src = URL.createObjectURL(file);
    });
  }
  return att;
}

export async function uploadMany(icMemberId: string, files: File[]) {
  const limited = files.slice(0, 10);
  const out: Attachment[] = [];
  for (const f of limited) out.push(await uploadFile(icMemberId, f));
  return out;
}

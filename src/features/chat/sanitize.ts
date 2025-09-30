export function sanitizeMessage(text: string, wordMap: Record<string,string>) {
  if (!text) return text;
  let out = text;
  for (const [bad, repl] of Object.entries(wordMap)) {
    const re = new RegExp(`\\b${escapeRegExp(bad)}\\b`, "gi");
    out = out.replace(re, repl);
  }
  return out;
}
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

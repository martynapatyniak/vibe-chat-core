export function countryFlag(code?: string | null) {
  if (!code) return "";
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}
export function rankLabel(rank?: string | null) {
  return rank || null;
}

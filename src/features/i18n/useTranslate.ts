import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_TRANSLATE_URL; // np. https://libretranslate.de/translate
const API_KEY = process.env.NEXT_PUBLIC_TRANSLATE_API_KEY; // opcjonalnie

export function useTranslate(targetLang: string) {
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const translate = useCallback(async (messageId: string, text: string) => {
    setLoading(true); setErr(null);

    // 1) sprawdź cache w supabase
    const { data: cached } = await supabase
      .from("translations_cache")
      .select("*")
      .eq("message_id", messageId)
      .eq("lang", targetLang)
      .maybeSingle();
    if (cached?.translated) {
      setLoading(false);
      return cached.translated as string;
    }

    // 2) wywołaj API tłumaczeń (LibreTranslate-like)
    if (!API_URL) {
      setLoading(false);
      setErr("Brak NEXT_PUBLIC_TRANSLATE_URL – ustaw w env.");
      return text; // fallback: bez tłumaczenia
    }

    const body: any = { q: text, source: "auto", target: targetLang, format: "text" };
    if (API_KEY) body.api_key = API_KEY;

    const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      setLoading(false);
      setErr(`Błąd API tłumaczeń: ${res.status}`);
      return text;
    }
    const json = await res.json();
    const translated = json?.translatedText ?? text;

    // 3) zapisz cache
    await supabase.from("translations_cache").insert({
      message_id: messageId,
      lang: targetLang,
      translated,
    });

    setLoading(false);
    return translated as string;
  }, [targetLang]);

  return { translate, loading, error };
}
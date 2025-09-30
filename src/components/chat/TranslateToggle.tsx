import React, { useState } from "react";
import { useTranslate } from "@/features/i18n/useTranslate";

type Props = {
  messageId: string;
  original: string;
  targetLang: string; // np. "pl", "en", "de"
};

export default function TranslateToggle({ messageId, original, targetLang }: Props) {
  const { translate, loading } = useTranslate(targetLang);
  const [translated, setTranslated] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);

  async function onClick() {
    if (!translated) {
      const t = await translate(messageId, original);
      setTranslated(t);
      setShowTranslated(true);
    } else {
      setShowTranslated(!showTranslated);
    }
  }

  return (
    <div className="text-xs mt-1">
      <button className="underline text-blue-600" onClick={onClick} disabled={loading}>
        {loading ? "Tłumaczę…" : showTranslated ? "Pokaż oryginał" : "Tłumacz"}
      </button>
      {showTranslated && translated && (
        <div className="mt-1 p-2 rounded bg-gray-50 border whitespace-pre-wrap">{translated}</div>
      )}
    </div>
  );
}
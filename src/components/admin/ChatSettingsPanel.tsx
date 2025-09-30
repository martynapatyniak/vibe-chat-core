// src/components/admin/ChatSettingsPanel.tsx
import React, { useMemo, useState } from "react";
import { useChatSettings, getDot, setDot } from "@/features/settings/useChatSettings";

type Row = { label: string; key: string; type: "bool" | "int" | "text"; hint?: string };

const rows: Row[] = [
  { label: "Flaga kraju przed nickiem", key: "ui.showCountryFlag", type: "bool" },
  { label: "Ranga za nickiem", key: "ui.showRankAfterNick", type: "bool" },
  { label: "Styling bąbelków per grupa", key: "ui.groupBubbleStyles", type: "bool" },

  { label: "Enter wysyła", key: "composer.enterSends", type: "bool" },
  { label: "Shift+Enter = nowa linia", key: "composer.shiftEnterNewline", type: "bool" },
  { label: "Limit znaków w wiadomości", key: "composer.maxChars", type: "int", hint: "np. 2000" },

  { label: "Liczba wiadomości przy starcie", key: "messages.initialLoad", type: "int", hint: "np. 50" },
  { label: "Nieskończone przewijanie (autoload)", key: "messages.infiniteScroll", type: "bool" },
  { label: "Format czasu (np. HH:mm)", key: "messages.timeFormat", type: "text" },

  { label: "Drag & drop upload", key: "uploads.dragAndDrop", type: "bool" },
  { label: "Maks. rozmiar pliku (MB)", key: "uploads.maxFileMB", type: "int", hint: "np. 10" },

  { label: "Zezwól audio", key: "permissions.allowAudio", type: "bool" },
  { label: "Zezwól video", key: "permissions.allowVideo", type: "bool" },
  { label: "Zezwól URL", key: "permissions.allowUrls", type: "bool" },

  { label: "Anty-flood: minimalny odstęp (ms)", key: "flood.minIntervalMs", type: "int", hint: "np. 1200" },

  { label: "Ogłoszenia włączone", key: "announcements.enabled", type: "bool" },
  { label: "Dźwięk: nowa wiadomość", key: "notifications.soundsNew", type: "bool" },
  { label: "Dźwięk: @wzmianka", key: "notifications.soundsMention", type: "bool" },
];

export default function ChatSettingsPanel({ scope = "global" }: { scope?: string }) {
  const { config, save, loading, saving } = useChatSettings(scope);
  const [draft, setDraft] = useState<any | null>(null);

  const current = useMemo(() => draft ?? config ?? {}, [draft, config]);

  function setVal(key: string, value: any) {
    setDraft(prev => setDot(prev ?? current, key, value));
  }

  async function onSave() {
    if (!current) return;
    await save(current);
    setDraft(null);
  }

  if (loading && !config) return <div>Ładowanie ustawień…</div>;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Ustawienia chatu {scope !== "global" ? `(scope: ${scope})` : ""}</h3>

      <div className="grid md:grid-cols-2 gap-3">
        {rows.map(r => {
          const value = getDot(current, r.key, r.type === "bool" ? false : r.type === "int" ? 0 : "");
          return (
            <label key={r.key} className="border rounded p-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{r.label}</div>
                {r.hint && <div className="text-xs text-muted-foreground">{r.hint}</div>}
              </div>
              <div>
                {r.type === "bool" && (
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => setVal(r.key, e.target.checked)}
                  />
                )}
                {r.type === "int" && (
                  <input
                    className="border rounded px-2 py-1 w-28 text-right"
                    type="number"
                    value={value ?? 0}
                    onChange={(e) => setVal(r.key, Number(e.target.value))}
                  />
                )}
                {r.type === "text" && (
                  <input
                    className="border rounded px-2 py-1 w-40"
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => setVal(r.key, e.target.value)}
                  />
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
          onClick={onSave}
          disabled={saving}
        >
          Zapisz ustawienia
        </button>
        {draft && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setDraft(null)}
          >
            Odrzuć zmiany
          </button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Tip: Z czasem możesz trzymać osobne konfiguracje per pokój, podając <code>scope=roomId</code>.
      </div>
    </div>
  );
}
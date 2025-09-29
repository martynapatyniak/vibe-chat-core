// src/components/chat/ChatMessages.tsx
import { useEffect, useMemo, useRef, useState, UIEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageItem } from "./MessageItem";
import { useChatData } from "@/hooks/useChatData";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@supabase/supabase-js";

// --- Supabase (PostgREST) – potrzebne do get_last_read / mark_room_read ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Prosty separator UI
function NewMessagesDivider() {
  return (
    <div className="my-2 flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Nowe wiadomości
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

interface ChatMessagesProps {
  roomId?: string;          // identyfikator pokoju (np. "lobby")
  icMemberId?: string;      // identyfikator członka (IC) jako string
  onReply?: (message: any) => void;
  onQuote?: (message: any) => void;
}

/**
 * ChatMessages – lista wiadomości:
 * - separator "Nowe wiadomości" w miejscu pierwszej nieprzeczytanej
 * - auto-oznaczanie przeczytania, gdy użytkownik jest na dole
 * - przycisk "Skocz do najnowszych", gdy użytkownik przewinie w górę
 */
export const ChatMessages = ({ roomId = "lobby", icMemberId, onReply, onQuote }: ChatMessagesProps) => {
  const { user } = useAuth();
  const { messages, loading } = useChatData();
  const scrollWrapRef = useRef<HTMLDivElement>(null);

  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [showJump, setShowJump] = useState(false);

  // --- helpers ---
  const isNearBottom = () => {
    const el = scrollWrapRef.current;
    if (!el) return true;
    const threshold = 72; // px – „blisko dołu”
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = scrollWrapRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  // Pobierz timestamp ostatniego odczytu (Faza 2)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!roomId || !icMemberId) return;
      const { data, error } = await supabase.rpc("get_last_read", {
        p_room_id: roomId,
        p_ic_id: icMemberId,
      });
      if (error) {
        // cicho – nie blokujemy UI
        return;
      }
      if (!ignore) setLastReadAt(data ?? null);
    })();
    return () => {
      ignore = true;
    };
  }, [roomId, icMemberId]);

  // Autoscroll gdy przychodzą nowe wiadomości (tylko jeśli jesteśmy blisko dołu)
  useEffect(() => {
    if (!loading && isNearBottom()) {
      scrollToBottom("smooth");
    }
  }, [loading, messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Oblicz indeks pierwszej nieprzeczytanej wiadomości
  const firstUnreadIdx = useMemo(() => {
    if (!lastReadAt || !messages?.length) return null;
    const last = new Date(lastReadAt).getTime();
    const idx = messages.findIndex((m: any) => new Date(m.created_at).getTime() > last);
    return idx >= 0 ? idx : null;
  }, [lastReadAt, messages]);

  // Oznacz jako przeczytane, kiedy dotkniemy dołu (debounce lekko po czasie)
  useEffect(() => {
    const el = scrollWrapRef.current;
    if (!el || !roomId || !icMemberId) return;

    let timeout: any;
    const onScroll = () => {
      const near = isNearBottom();
      setShowJump(!near);
      if (near) {
        // małe opóźnienie, by nie spamować
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          await supabase.rpc("mark_room_read", {
            p_room_id: roomId,
            p_ic_id: icMemberId,
          });
          // odśwież lastReadAt żeby ukryć separator
          const { data } = await supabase.rpc("get_last_read", {
            p_room_id: roomId,
            p_ic_id: icMemberId,
          });
          setLastReadAt(data ?? new Date().toISOString());
        }, 250);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    // startowo – jeśli jesteśmy na dole, przewiń do dołu
    requestAnimationFrame(() => {
      if (isNearBottom()) scrollToBottom();
    });

    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [roomId, icMemberId]);

  // --- rendering ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Wczytywanie wiadomości…</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Brak wiadomości</p>
          <p className="text-sm text-muted-foreground">Zacznij rozmowę!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* przycisk „Skocz do najnowszych” */}
      {showJump && (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center">
          <Button size="sm" variant="secondary" onClick={() => scrollToBottom("smooth")}>
            Skocz do najnowszych
          </Button>
        </div>
      )}

      {/* Scroll kontener – tu pilnujemy scrollTop */}
      <div ref={scrollWrapRef} className="h-full overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {messages.map((message: any, index: number) => {
            // separator przed pierwszą nieprzeczytaną
            const shouldRenderDivider = firstUnreadIdx !== null && index === firstUnreadIdx;

            const showAvatar =
              index === 0 ||
              messages[index - 1].user_id !== message.user_id ||
              new Date(message.created_at).getTime() -
                new Date(messages[index - 1].created_at).getTime() >
                5 * 60 * 1000;

            const formattedMessage = {
              id: message.id,
              content: message.content,
              author: {
                name: message.user?.username ?? "Użytkownik",
                avatar: message.user?.avatar_url || "",
                role: message.user?.role,
                country: message.user?.country_code || "🌐",
              },
              timestamp: new Date(message.created_at),
              edited: message.is_edited,
              replyTo: message.reply_to
                ? {
                    id: message.reply_to.id,
                    author: message.reply_to.user?.username ?? "Użytkownik",
                    content: message.reply_to.content,
                  }
                : undefined,
              reactions: message.reactions,
              attachments: message.file_url
                ? [
                    {
                      id: message.id + "_file",
                      name: message.file_url.split("/").pop() || "file",
                      url: message.file_url,
                      type:
                        (message.message_type === "file"
                          ? "file"
                          : message.message_type === "voice"
                          ? "voice"
                          : "image") as "image" | "file" | "voice",
                      size: undefined,
                    },
                  ]
                : undefined,
            };

            return (
              <div key={message.id}>
                {shouldRenderDivider && <NewMessagesDivider />}
                <MessageItem
                  message={formattedMessage}
                  showAvatar={showAvatar}
                  className="animate-in fade-in-0 slide-in-from-bottom-2"
                  onReply={onReply}
                  onQuote={onQuote}
                  currentUserId={user?.id}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
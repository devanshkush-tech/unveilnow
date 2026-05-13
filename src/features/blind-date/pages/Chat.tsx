import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { CompatibilityBadge } from "../components/CompatibilityBadge";
import { TimerCircle } from "../components/TimerCircle";
import { VibeTags } from "../components/VibeTags";
import { MessageBubble } from "../components/MessageBubble";
import { useBlindDateStore } from "../store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { id: string; from: "me" | "them"; text: string };

export default function BlindDateChat() {
  const nav = useNavigate();
  const { user } = useAuth();
  const match = useBlindDateStore((s) => s.match);
  const sessionId = useBlindDateStore((s) => s.sessionId);
  const [seconds, setSeconds] = useState(60);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match || !sessionId) { nav("/blind-date"); }
  }, [match, sessionId, nav]);

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(() => nav("/blind-date/decision"), 300);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [nav]);

  // Realtime subscription + initial load — REAL messages only.
  useEffect(() => {
    if (!sessionId || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blind_date_messages")
        .select("id, sender_id, body")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (cancelled || !data) return;
      setMessages(data.map((m: any) => ({ id: m.id, from: m.sender_id === user.id ? "me" : "them", text: m.body })));
    })();
    const ch = supabase
      .channel(`bd-msgs-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blind_date_messages", filter: `session_id=eq.${sessionId}` }, (payload: any) => {
        const m = payload.new;
        setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, { id: m.id, from: m.sender_id === user.id ? "me" : "them", text: m.body }]);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [sessionId, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!draft.trim() || !user || !sessionId) return;
    const body = draft.trim();
    setDraft("");
    await supabase.from("blind_date_messages").insert({ session_id: sessionId, sender_id: user.id, body });
  };

  if (!match) return null;

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full">
        <div className="px-4 pt-4 pb-3 bd-surface border-b border-white/10 flex items-center gap-3 sticky top-0 z-20">
          <BlurredAvatar size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{match.name}, {match.age} · {match.city}</div>
            <div className="mt-0.5"><CompatibilityBadge value={match.compatibility} /></div>
          </div>
          <TimerCircle seconds={seconds} />
        </div>
        <div className="px-4 py-2 border-b border-white/5">
          <VibeTags tags={match.vibes} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {messages.length === 0 && (
            <p className="bd-muted text-center text-sm py-8">Say hi — feel the connection first, then reveal more ✨</p>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} text={m.text} mine={m.from === "me"} />
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-white/10 bd-surface flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something…"
            className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/40"
          />
          <button onClick={send} className="h-11 w-11 rounded-full flex items-center justify-center bd-grad active:scale-95 transition" aria-label="Send">
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </BlindDateLayout>
  );
}

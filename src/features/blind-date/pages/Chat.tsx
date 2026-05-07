import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { CompatibilityBadge } from "../components/CompatibilityBadge";
import { TimerCircle } from "../components/TimerCircle";
import { VibeTags } from "../components/VibeTags";
import { MessageBubble, TypingDots } from "../components/MessageBubble";
import { useBlindDateStore } from "../store";

type Msg = { from: "me" | "them"; text: string };

const SEED: Msg[] = [
  { from: "them", text: "Okay this is kinda nerve-wracking 😅" },
  { from: "me", text: "Same! What made you try this?" },
  { from: "them", text: "Honestly tired of swiping. Wanted something different" },
  { from: "me", text: "Same energy lol" },
];

export default function BlindDateChat() {
  const nav = useNavigate();
  const match = useBlindDateStore((s) => s.match);
  const [seconds, setSeconds] = useState(60);
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match) { nav("/blind-date"); return; }
  }, [match, nav]);

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

  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 6000);
    const t2 = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "them", text: "What's something you're really into lately?" }]);
    }, 9500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft.trim() }]);
    setDraft("");
  };

  if (!match) return null;

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full">
        {/* Top bar */}
        <div className="px-4 pt-4 pb-3 bd-surface border-b border-white/10 flex items-center gap-3 sticky top-0 z-20">
          <BlurredAvatar size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{match.name}, {match.age} · {match.city}</div>
            <div className="mt-0.5"><CompatibilityBadge value={match.compatibility} /></div>
          </div>
          <TimerCircle seconds={seconds} />
        </div>
        <div className="px-4 py-2 border-b border-white/5">
          <VibeTags tags={[...match.vibes, "Night Owl", "Music Lover"]} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {messages.map((m, i) => (
            <MessageBubble key={i} text={m.text} mine={m.from === "me"} />
          ))}
          {typing && <TypingDots />}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 bd-surface flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something…"
            className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/40"
          />
          <button
            onClick={send}
            className="h-11 w-11 rounded-full flex items-center justify-center bd-grad active:scale-95 transition"
            aria-label="Send"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </BlindDateLayout>
  );
}

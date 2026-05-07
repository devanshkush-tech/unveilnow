import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Eye, MoreVertical, Mic, Smile, Send } from "lucide-react";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { MessageBubble } from "../components/MessageBubble";
import { useBlindDateStore } from "../store";

export default function BlindDateFullChat() {
  const nav = useNavigate();
  const match = useBlindDateStore((s) => s.match);
  const [revealed, setRevealed] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { from: "them" as const, text: "Okay this is kinda nerve-wracking 😅" },
    { from: "me" as const, text: "Same! What made you try this?" },
    { from: "them" as const, text: "Honestly tired of swiping. Wanted something different" },
    { from: "me" as const, text: "Same energy lol" },
    { from: "them" as const, text: "So glad we both continued 💜" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!match) nav("/blind-date"); }, [match, nav]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!match) return null;

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft.trim() }]);
    setDraft("");
  };

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full">
        <div className="px-4 pt-4 pb-3 bd-surface border-b border-white/10 flex items-center gap-3 sticky top-0 z-20">
          <BlurredAvatar size={40} revealed={revealed} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{match.name}, {match.age}</div>
            <span className="inline-block mt-0.5 text-[10px] tracking-wide bd-accent">Matched via Blind Date ✨</span>
          </div>
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} className="h-9 w-9 rounded-full hover:bg-white/5 flex items-center justify-center" aria-label="More">
              <MoreVertical className="h-5 w-5" />
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-40 bd-surface border border-white/10 rounded-xl overflow-hidden text-sm">
                {["Report", "Block", "Unmatch"].map((a) => (
                  <button key={a} className="w-full text-left px-4 py-2.5 hover:bg-white/5">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo reveal */}
        <div className="border-b border-white/10 bd-surface">
          <button
            onClick={() => setPhotoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm bd-muted"
          >
            Photo Reveal
            <ChevronDown className={`h-4 w-4 transition-transform ${photoOpen ? "" : "-rotate-90"}`} />
          </button>
          {photoOpen && (
            <div className="px-4 pb-4">
              <div
                className="relative h-48 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(192,132,252,0.6), rgba(244,114,182,0.6))",
                  filter: revealed ? "none" : "blur(18px)",
                  transition: "filter 0.7s ease",
                }}
              >
                <span className="bd-serif text-4xl text-white/80">{match.name[0]}</span>
              </div>
              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="mt-3 w-full rounded-full py-3 bd-grad text-white font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Reveal Photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {messages.map((m, i) => (
            <MessageBubble key={i} text={m.text} mine={m.from === "me"} />
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-white/10 bd-surface flex items-center gap-2">
          <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/5" aria-label="Voice"><Mic className="h-5 w-5 text-white/70" /></button>
          <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/5" aria-label="Emoji"><Smile className="h-5 w-5 text-white/70" /></button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message…"
            className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/40"
          />
          <button onClick={send} className="h-11 w-11 rounded-full flex items-center justify-center bd-grad active:scale-95" aria-label="Send">
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </BlindDateLayout>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { CompatibilityBadge } from "../components/CompatibilityBadge";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { VibeTags } from "../components/VibeTags";
import { useBlindDateStore, pickMatch } from "../store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEXTS = ["Finding your match…", "Scanning for chemistry…", "Almost there…"];

export default function BlindDateMatching() {
  const nav = useNavigate();
  const [textIdx, setTextIdx] = useState(0);
  const [found, setFound] = useState(false);
  const setMatch = useBlindDateStore((s) => s.setMatch);
  const match = useBlindDateStore((s) => s.match);

  useEffect(() => {
    const t = setInterval(() => setTextIdx((i) => (i + 1) % TEXTS.length), 2000);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("bd-match", { body: {} });
        if (error || !data) throw error ?? new Error("no_match");
        if (data.error === "complete_setup") { toast.error("Complete the questionnaire first."); nav("/blind-date/setup"); return; }
        if (data.error === "limit_reached") { nav("/blind-date/premium"); return; }
        setMatch(data.match, data.session_id, data.ends_at, !!data.mock);
      } catch {
        // Fallback to mock so demo still works
        const m = pickMatch();
        setMatch(m, null, new Date(Date.now() + 60_000).toISOString(), true);
      } finally {
        clearInterval(t);
        setFound(true);
      }
    })();
    return () => { clearInterval(t); };
  }, [setMatch, nav]);

  return (
    <BlindDateLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <AnimatePresence mode="wait">
          {!found ? (
            <motion.div key="searching" exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center">
              <div className="relative h-48 w-48 mb-10">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="bd-ring" style={{ animationDelay: `${i * 0.6}s` }} />
                ))}
                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bd-grad" style={{ boxShadow: "0 0 60px rgba(192,132,252,0.7)" }} />
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={textIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bd-serif text-2xl">
                  {TEXTS[textIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : match ? (
            <motion.div key="card" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="bd-surface rounded-3xl p-8 border border-white/10 max-w-md w-full text-center"
              style={{ boxShadow: "0 30px 80px -20px rgba(192,132,252,0.5)" }}>
              <div className="flex justify-center mb-5"><BlurredAvatar size={104} /></div>
              <h3 className="text-2xl font-medium">{match.name}, {match.age}</h3>
              <p className="bd-muted mb-5">{match.city}</p>
              <div className="flex justify-center mb-5"><CompatibilityBadge value={match.compatibility} large /></div>
              <div className="flex justify-center mb-6"><VibeTags tags={match.vibes} /></div>
              <div className="h-px w-full bg-white/10 my-5" />
              <p className="bd-muted text-sm mb-5">Your match is ready. Chat starts now.</p>
              <GlowButton full onClick={() => nav("/blind-date/chat")}>Enter Chat →</GlowButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </BlindDateLayout>
  );
}

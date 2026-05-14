import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { useBlindDateStore } from "../store";
import { supabase } from "@/integrations/supabase/client";

export default function BlindDateDecision() {
  const nav = useNavigate();
  const match = useBlindDateStore((s) => s.match);
  const sessionId = useBlindDateStore((s) => s.sessionId);
  const setDecision = useBlindDateStore((s) => s.setDecision);
  const reset = useBlindDateStore((s) => s.reset);
  const [state, setState] = useState<"idle" | "passed" | "waiting">("idle");

  if (!match) { nav("/blind-date"); return null; }

  const send = async (decision: "continue" | "pass") => {
    if (sessionId) {
      try {
        const { data } = await supabase.functions.invoke("bd-decide", {
          body: { session_id: sessionId, decision },
        });
        return data;
      } catch { /* fallback below */ }
    }
    return null;
  };

  const onPass = async () => {
    setDecision("pass");
    setState("passed");
    await send("pass");
    setTimeout(() => { reset(); nav("/blind-date"); }, 1400);
  };
  const onContinue = async () => {
    setDecision("continue");
    setState("waiting");
    const res = await send("continue");
    setTimeout(() => {
      if (res?.revealed || res?.both_decided) nav("/blind-date/matched");
      else { reset(); nav("/blind-date"); }
    }, 2000);
  };

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(14px)" }}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          className="bd-surface rounded-3xl border border-white/10 p-8 max-w-md w-full text-center">
          {state === "passed" ? (
            <p className="bd-serif text-2xl py-10">Maybe next time ✨</p>
          ) : state === "waiting" ? (
            <div className="py-8">
              <p className="bd-serif text-xl mb-3">Waiting for {match.name}…</p>
              <div className="flex justify-center gap-1.5 mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-2 w-2 rounded-full bd-grad"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="bd-serif text-3xl mb-2">Time's up.</h2>
              <p className="bd-muted mb-6">Did you feel a connection?</p>
              <div className="flex flex-col items-center mb-6">
                <BlurredAvatar size={72} />
                <p className="mt-3 font-medium">{match.name}, {match.age}</p>
                <p className="bd-muted text-sm">{match.compatibility}% Compatible</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <GlowButton variant="outline" onClick={onPass}>Pass</GlowButton>
                <GlowButton onClick={onContinue}>Continue ✨</GlowButton>
              </div>
              <p className="bd-muted text-xs mt-5">Both must choose Continue to unlock the full chat.</p>
            </>
          )}
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

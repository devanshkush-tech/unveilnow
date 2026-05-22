import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { BD_QUESTIONS } from "../lib/questions";
import { useBlindDateStore } from "../store";
import { useBdProfile } from "../hooks/useBdProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BlindDateSetup() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const answers = useBlindDateStore((s) => s.answers);
  const setAnswer = useBlindDateStore((s) => s.setAnswer);
  const setAnswers = useBlindDateStore((s) => s.setAnswers);
  const { refresh } = useBdProfile();

  // Hydrate from server if returning user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_my_bd_profile");
      if (data && data.length && data[0].answers) {
        setAnswers(data[0].answers as Record<string, unknown>);
      }
    })();
  }, [setAnswers]);

  const total = BD_QUESTIONS.length;
  const q = BD_QUESTIONS[step];
  const value = answers[q.id];
  const progress = (step / total) * 100;

  const canNext = useMemo(() => {
    if (q.type === "single") return typeof value === "string";
    if (q.type === "multi") return Array.isArray(value) && (value as string[]).length > 0;
    if (q.type === "scale") return typeof value === "number";
    return false;
  }, [q, value]);

  const next = async () => {
    if (step + 1 < total) { setStep(step + 1); return; }
    setCalculating(true);
    try {
      const { error } = await supabase.rpc("save_my_bd_answers", {
        _answers: answers as never, _completed: true,
      });
      if (error) throw error;
      await refresh();
      setTimeout(() => nav("/blind-date/onboarding"), 1200);
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't save your answers.");
      setCalculating(false);
    }
  };

  const pickSingle = (v: string) => setAnswer(q.id, v);
  const pickMulti = (v: string) => {
    const cur = (answers[q.id] as string[] | undefined) ?? [];
    const max = (q as any).max ?? 99;
    if (cur.includes(v)) setAnswer(q.id, cur.filter((x) => x !== v));
    else if (cur.length < max) setAnswer(q.id, [...cur, v]);
  };

  return (
    <BlindDateLayout>
      <div className="min-h-screen flex flex-col px-6 pt-20 pb-10 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-widest bd-muted">{q.category.toUpperCase()}</span>
          <span className="text-xs bd-muted">{step + 1} / {total}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-10">
          <motion.div className="h-full bd-grad" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        {calculating ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              className="h-20 w-20 rounded-full"
              style={{ background: "conic-gradient(from 0deg, #C084FC, #F472B6, #C084FC)", boxShadow: "0 0 60px rgba(192,132,252,0.6)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <p className="bd-serif text-2xl mt-8">Calculating your vibe…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bd-surface rounded-3xl p-7 border border-white/10"
            >
              <h2 className="text-2xl md:text-3xl font-medium leading-snug mb-6">{q.q}</h2>

              {q.type === "single" && (
                <div className="flex flex-col gap-3">
                  {q.options.map((o) => {
                    const sel = value === o.v;
                    return (
                      <button key={o.v} onClick={() => pickSingle(o.v)}
                        className="w-full text-left rounded-full px-5 py-4 transition-all active:scale-[0.98]"
                        style={{
                          background: sel ? "rgba(192,132,252,0.15)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${sel ? "rgba(192,132,252,0.8)" : "rgba(255,255,255,0.1)"}`,
                          boxShadow: sel ? "0 0 24px rgba(192,132,252,0.35)" : "none",
                        }}>{o.label}</button>
                    );
                  })}
                </div>
              )}

              {q.type === "multi" && (
                <>
                  <p className="text-xs bd-muted mb-3">Pick up to {(q as any).max ?? "any"}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const sel = Array.isArray(value) && (value as string[]).includes(o.v);
                      return (
                        <button key={o.v} onClick={() => pickMulti(o.v)}
                          className="rounded-full px-4 py-2 text-sm transition-all"
                          style={{
                            background: sel ? "rgba(192,132,252,0.18)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${sel ? "rgba(192,132,252,0.7)" : "rgba(255,255,255,0.1)"}`,
                          }}>{o.label}</button>
                      );
                    })}
                  </div>
                </>
              )}

              {q.type === "scale" && (
                <div className="py-4">
                  <input type="range" min={q.min} max={q.max} value={typeof value === "number" ? value : Math.round((q.min + q.max) / 2)}
                    onChange={(e) => setAnswer(q.id, Number(e.target.value))}
                    className="w-full accent-fuchsia-400" />
                  <div className="flex justify-between text-xs bd-muted mt-2">
                    <span>{q.minLabel}</span><span>{q.maxLabel}</span>
                  </div>
                  <div className="text-center mt-3 bd-grad-text text-2xl font-semibold">
                    {typeof value === "number" ? value : "–"} / {q.max}
                  </div>
                </div>
              )}

              <div className="mt-7 flex gap-3">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="rounded-full px-5 py-3 text-sm bd-muted border border-white/10">Back</button>
                )}
                <div className="flex-1">
                  <GlowButton full onClick={next} disabled={!canNext}>
                    {step + 1 === total ? "Find my match ✨" : "Next →"}
                  </GlowButton>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </BlindDateLayout>
  );
}

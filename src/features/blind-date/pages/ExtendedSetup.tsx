import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { BD_EXTENDED_QUESTIONS } from "../lib/extendedQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useBdProfile } from "../hooks/useBdProfile";
import { toast } from "sonner";

export default function BlindDateExtendedSetup() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { refresh } = useBdProfile();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_my_bd_profile");
      if (data && data.length && data[0].extended_answers) {
        setAnswers(data[0].extended_answers as Record<string, unknown>);
      }
    })();
  }, []);

  const total = BD_EXTENDED_QUESTIONS.length;
  const q = BD_EXTENDED_QUESTIONS[step];
  const value = answers[q.id];
  const progress = ((step + 1) / total) * 100;

  const canNext = useMemo(() => {
    if (q.type === "single") return typeof value === "string";
    if (q.type === "multi") return Array.isArray(value) && (value as string[]).length > 0;
    if (q.type === "number") return typeof value === "number";
    if (q.type === "text") return typeof value === "string" && (value as string).trim().length > 0;
    return false;
  }, [q, value]);

  const setAns = (v: unknown) => setAnswers((a) => ({ ...a, [q.id]: v }));

  const next = async () => {
    if (step + 1 < total) { setStep(step + 1); return; }
    setSaving(true);
    try {
      const { error } = await supabase.rpc("save_my_bd_extended", { _answers: answers as never, _completed: true });
      if (error) throw error;
      toast.success("Profile complete! Finding matches…");
      setTimeout(() => nav("/blind-date/matching"), 800);
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't save.");
      setSaving(false);
    }
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

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="bd-surface rounded-3xl p-7 border border-white/10">
            <h2 className="text-2xl md:text-3xl font-medium leading-snug mb-6">{q.q}</h2>

            {q.type === "single" && (
              <div className="flex flex-col gap-3">
                {q.options.map((o) => {
                  const sel = value === o.v;
                  return (
                    <button key={o.v} onClick={() => setAns(o.v)}
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
                <p className="text-xs bd-muted mb-3">Pick up to {q.max ?? "any"}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o) => {
                    const cur = (value as string[] | undefined) ?? [];
                    const sel = cur.includes(o.v);
                    const max = q.max ?? 99;
                    return (
                      <button key={o.v} onClick={() => {
                        if (sel) setAns(cur.filter((x) => x !== o.v));
                        else if (cur.length < max) setAns([...cur, o.v]);
                      }}
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

            {q.type === "number" && (
              <input type="number" min={q.min} max={q.max}
                value={typeof value === "number" ? value : ""}
                onChange={(e) => setAns(e.target.value === "" ? undefined : Number(e.target.value))}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-lg outline-none focus:border-white/30"
                placeholder={`${q.min}–${q.max}${q.suffix ? " " + q.suffix : ""}`} />
            )}

            {q.type === "text" && (
              <input type="text"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => setAns(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-base outline-none focus:border-white/30"
                placeholder={q.placeholder ?? ""} />
            )}

            <div className="mt-7 flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="rounded-full px-5 py-3 text-sm bd-muted border border-white/10">Back</button>
              )}
              <div className="flex-1">
                <GlowButton full onClick={next} disabled={!canNext || saving}>
                  {saving ? "Saving…" : step + 1 === total ? "Find my matches ✨" : "Next →"}
                </GlowButton>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </BlindDateLayout>
  );
}

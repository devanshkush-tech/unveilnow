import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { useBlindDateStore } from "../store";

const QUESTIONS = [
  { q: "How would you describe yourself?", options: ["🌙 Introvert", "☀️ Extrovert", "⚖️ Somewhere in between"] },
  { q: "What kind of conversations do you love?", options: ["🌊 Deep & meaningful", "😂 Fun & playful", "🔀 Both depending on mood"] },
  { q: "What's your ideal vibe?", options: ["🏔️ Mountains & calm", "🏖️ Beach & adventure", "🌆 City & culture"] },
  { q: "How do you communicate?", options: ["⚡ Fast replies always", "😌 Chill & take my time", "🔄 Depends on who it is"] },
  { q: "What are you looking for?", options: ["💞 Something serious", "✨ Keeping it casual", "🔍 Still figuring it out"] },
];

export default function BlindDateSetup() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const setAnswer = useBlindDateStore((s) => s.setAnswer);

  const onPick = (val: string) => {
    setSelected(val);
    setAnswer(step, val);
    setTimeout(() => {
      setSelected(null);
      if (step + 1 >= QUESTIONS.length) {
        setCalculating(true);
        setTimeout(() => nav("/blind-date/matching"), 1500);
      } else {
        setStep((s) => s + 1);
      }
    }, 400);
  };

  const progress = ((step + (selected ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <BlindDateLayout>
      <div className="min-h-screen flex flex-col px-6 pt-20 pb-10 max-w-xl mx-auto w-full">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-12">
          <motion.div
            className="h-full bd-grad"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
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
              transition={{ duration: 0.35 }}
              className="bd-surface rounded-3xl p-8 border border-white/10"
            >
              <p className="bd-muted text-xs tracking-widest mb-3">QUESTION {step + 1} / {QUESTIONS.length}</p>
              <h2 className="text-2xl md:text-3xl font-medium leading-snug mb-8">{QUESTIONS[step].q}</h2>
              <div className="flex flex-col gap-3">
                {QUESTIONS[step].options.map((opt) => {
                  const isSel = selected === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => onPick(opt)}
                      disabled={!!selected}
                      className="w-full text-left rounded-full px-5 py-4 transition-all duration-300 active:scale-[0.98]"
                      style={{
                        background: isSel ? "rgba(192,132,252,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isSel ? "rgba(192,132,252,0.8)" : "rgba(255,255,255,0.1)"}`,
                        boxShadow: isSel ? "0 0 24px rgba(192,132,252,0.35)" : "none",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </BlindDateLayout>
  );
}

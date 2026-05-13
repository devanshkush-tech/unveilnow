import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";

export default function BlindDateLanding() {
  const nav = useNavigate();
  const handleStart = () => nav("/blind-date/setup");

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block text-xs tracking-[0.2em] bd-accent mb-6">✦ NEW FEATURE</span>
          <h1 className="bd-serif text-5xl md:text-6xl font-medium leading-tight mb-5 whitespace-pre-line">
            Blind date.{"\n"}Instant match.
          </h1>
          <p className="bd-muted max-w-md mx-auto mb-10 text-base">
            Get matched by chemistry, not just attraction. One minute can change everything.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              "⚡ Instant Match",
              "💬 60-Second Chat",
              "✨ Continue If You Both Choose",
            ].map((t) => (
              <span key={t} className="rounded-full px-4 py-2 text-sm bd-surface border border-white/10">
                {t}
              </span>
            ))}
          </div>
          <GlowButton onClick={handleStart} className="text-base px-10 py-4">
            Start Blind Date
          </GlowButton>
          <div className="bd-muted text-sm mt-5">Quality over endless swiping. Real people only.</div>
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

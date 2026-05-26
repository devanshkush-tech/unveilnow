import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { useAuth } from "@/hooks/useAuth";
import { useBdProfile } from "../hooks/useBdProfile";

export default function BlindDateLanding() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile } = useBdProfile();

  const handleStart = () => {
    // Anyone can begin — questionnaire is public, signup happens after answers are captured.
    if (!user) { nav("/blind-date/setup"); return; }
    if (!profile?.completed) { nav("/blind-date/setup"); return; }
    if (!profile?.paid) { nav("/blind-date/payment"); return; }
    if (!profile?.extended_completed) { nav("/blind-date/onboarding"); return; }
    if ((profile?.chats_remaining ?? 0) <= 0) { nav("/blind-date/payment?reason=out"); return; }
    nav("/blind-date/matching");
  };

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block text-xs tracking-[0.2em] bd-accent mb-6">✦ NEW FEATURE</span>
          <h1 className="bd-serif text-5xl md:text-6xl font-medium leading-tight mb-5 whitespace-pre-line">
            Blind date.{"\n"}Instant match.
          </h1>
          <p className="bd-muted max-w-md mx-auto mb-10 text-base">
            We focus on quality over endless swiping. Blind Date is designed for serious and genuine connections — feel the connection first, then reveal more.
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

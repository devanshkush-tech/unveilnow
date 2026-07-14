import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { useAuth } from "@/hooks/useAuth";
import { useBdProfile } from "../hooks/useBdProfile";
import { SEO } from "@/components/SEO";


export default function BlindDateLanding() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile } = useBdProfile();

  const handleStart = () => {
    // Unified flow: signup → main payment → BD chats are auto-credited.
    if (!user) { nav("/signup?next=/blind-date"); return; }
    if (!profile?.paid) { nav("/payment"); return; }
    if ((profile?.chats_remaining ?? 0) <= 0) {
      toast.error("You've used all your Blind Date chats. Upgrade your plan to get more.");
      nav("/pricing");
      return;
    }
    nav("/blind-date/matching");
  };

  return (
    <BlindDateLayout showBack={false}>
      <SEO
        title="Blind Date | Unveil Now"
        description="Anonymous 60-second blind date chats. Match instantly, feel the connection, and reveal more only if you both choose to continue."
        path="/blind-date"
      />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlowButton onClick={handleStart} className="text-base px-10 py-4">
              Start Blind Date
            </GlowButton>
            {!user && (
              <button
                onClick={() => nav("/login?next=/blind-date")}
                className="text-base px-10 py-4 rounded-full border border-white/15 bd-surface hover:bg-white/5 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="bd-muted text-sm mt-5">One membership unlocks Unveil and Blind Date. Real people only.</div>
          {!user && (
            <div className="text-sm mt-4 bd-muted">
              Already a Blind Date member? Sign in to continue your journey.
            </div>
          )}
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

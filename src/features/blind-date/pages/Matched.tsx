import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { BlurredAvatar } from "../components/BlurredAvatar";
import { ParticleBurst } from "../components/ParticleBurst";
import { useBlindDateStore } from "../store";

export default function BlindDateMatched() {
  const nav = useNavigate();
  const match = useBlindDateStore((s) => s.match);
  if (!match) { nav("/blind-date"); return null; }

  return (
    <BlindDateLayout showBack={false}>
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center">
        <ParticleBurst />
        <motion.div
          className="absolute h-72 w-72 rounded-full"
          style={{ border: "2px solid rgba(192,132,252,0.5)" }}
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <div className="flex justify-center items-center gap-[-12px] mb-6">
            <motion.div initial={{ x: -30 }} animate={{ x: -8 }} transition={{ duration: 0.8 }}>
              <BlurredAvatar size={88} />
            </motion.div>
            <motion.div initial={{ x: 30 }} animate={{ x: 8 }} transition={{ duration: 0.8 }} style={{ marginLeft: -16 }}>
              <BlurredAvatar size={88} />
            </motion.div>
          </div>
          <h1 className="bd-serif text-5xl mb-3">It's a Match ✨</h1>
          <p className="bd-muted mb-6">You both felt the connection.</p>
          <p className="bd-grad-text font-semibold mb-8">{match.compatibility}% Compatible</p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <GlowButton full onClick={() => nav("/blind-date/chat/full")}>Open Full Chat</GlowButton>
            <GlowButton variant="outline" full onClick={() => nav("/blind-date/chat/full")}>View Profile</GlowButton>
          </div>
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

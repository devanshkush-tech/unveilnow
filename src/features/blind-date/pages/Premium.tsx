import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";
import { BD_PLANS } from "../lib/plans";

export default function BlindDatePremium() {
  const nav = useNavigate();
  return (
    <BlindDateLayout>
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          className="bd-surface rounded-3xl border border-white/10 p-8 max-w-3xl w-full">
          <h2 className="bd-serif text-3xl text-center mb-2">Unlock more Blind Dates</h2>
          <p className="bd-muted text-center mb-8">Real-people matchmaking. Quality over endless swiping.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {BD_PLANS.map((p) => (
              <div key={p.id} className="rounded-2xl p-6 border flex flex-col"
                style={{
                  background: p.highlight ? "rgba(192,132,252,0.10)" : "rgba(255,255,255,0.03)",
                  borderColor: p.highlight ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.08)",
                  boxShadow: p.highlight ? "0 0 30px rgba(192,132,252,0.2)" : "none",
                }}>
                {p.highlight && <div className="text-[10px] tracking-widest bd-accent mb-1">⭐ POPULAR</div>}
                <div className="text-base font-medium mb-2">{p.name}</div>
                <div className="bd-grad-text text-3xl font-bold mb-1">{p.priceLabel}</div>
                <div className="bd-muted text-xs mb-4">{p.chats} mutual-match chats</div>
                <ul className="space-y-1.5 text-sm bd-muted my-2 flex-1">
                  {p.perks.map((f) => (<li key={f}>✦ {f}</li>))}
                </ul>
                <GlowButton full variant={p.highlight ? "primary" : "outline"}
                  onClick={() => nav(`/blind-date/payment?plan=${p.id}`)}>
                  Choose {p.name}
                </GlowButton>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={() => nav("/blind-date")} className="bd-muted text-sm hover:text-white">Back</button>
          </div>
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

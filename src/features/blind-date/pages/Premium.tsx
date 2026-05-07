import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BlindDateLayout } from "../components/BlindDateLayout";
import { GlowButton } from "../components/GlowButton";

const PLANS = [
  {
    id: "starter",
    name: "Blind Date Starter",
    price: "₹299",
    member: "₹199",
    note: "one-time",
    features: ["10 Blind Date sessions", "Compatibility based matching", "60 second blind conversations", "Continue / Pass system", "Basic compatibility insights"],
  },
  {
    id: "expert",
    name: "Blind Date Expert",
    price: "₹499/mo",
    member: "₹399/mo",
    features: ["50 Blind Date sessions", "Priority matchmaking", "Advanced compatibility matching", "Compatibility insights"],
    highlight: true,
  },
  {
    id: "unlimited",
    name: "Blind Date Unlimited",
    price: "₹999/mo",
    member: "₹399/mo",
    features: ["Unlimited Blind Date sessions", "Priority matchmaking", "Advanced compatibility matching", "Compatibility insights"],
  },
];

export default function BlindDatePremium() {
  const nav = useNavigate();
  return (
    <BlindDateLayout>
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bd-surface rounded-3xl border border-white/10 p-8 max-w-2xl w-full"
        >
          <h2 className="bd-serif text-3xl text-center mb-2">You've used your daily sessions</h2>
          <p className="bd-muted text-center mb-8">Upgrade to Unveil Premium for unlimited Blind Dates.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl p-5 border"
                style={{
                  background: p.highlight ? "rgba(192,132,252,0.10)" : "rgba(255,255,255,0.03)",
                  borderColor: p.highlight ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.08)",
                  boxShadow: p.highlight ? "0 0 30px rgba(192,132,252,0.2)" : "none",
                }}
              >
                <div className="text-sm font-medium mb-1">{p.name}</div>
                <div className="bd-grad-text text-2xl font-bold">{p.price}</div>
                <div className="bd-muted text-xs mb-4">Member: {p.member}{p.note ? ` · ${p.note}` : ""}</div>
                <ul className="space-y-1.5 text-xs bd-muted">
                  {p.features.map((f) => (
                    <li key={f}>✦ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <GlowButton variant="gold" onClick={() => nav("/pricing")}>Upgrade to Premium</GlowButton>
            <button onClick={() => nav("/blind-date")} className="bd-muted text-sm hover:text-white">Come back tomorrow</button>
          </div>
        </motion.div>
      </div>
    </BlindDateLayout>
  );
}

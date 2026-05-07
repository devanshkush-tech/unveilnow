import { motion } from "framer-motion";

export function MessageBubble({ text, mine }: { text: string; mine?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          mine
            ? { background: "linear-gradient(135deg, #C084FC, #F472B6)", color: "white", borderBottomRightRadius: 6 }
            : { background: "#1f1f2b", color: "#F8FAFC", borderBottomLeftRadius: 6 }
        }
      >
        {text}
      </div>
    </motion.div>
  );
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bd-surface w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-white/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

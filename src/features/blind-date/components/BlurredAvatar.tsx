import { User } from "lucide-react";

export function BlurredAvatar({ size = 48, revealed = false }: { size?: number; revealed?: boolean }) {
  return (
    <div
      className="relative rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, rgba(192,132,252,0.5), rgba(244,114,182,0.5))",
        filter: revealed ? "none" : "blur(2px)",
      }}
    >
      <User className="text-white/80" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}

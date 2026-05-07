import { Zap } from "lucide-react";

export function CompatibilityBadge({ value, large }: { value: number; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${large ? "px-4 py-2 text-base" : "px-3 py-1 text-xs"}`}
      style={{ background: "rgba(192,132,252,0.15)", color: "#C084FC", border: "1px solid rgba(192,132,252,0.4)" }}
    >
      <Zap className={large ? "h-4 w-4" : "h-3 w-3"} fill="#C084FC" /> {value}% Compatible
    </span>
  );
}

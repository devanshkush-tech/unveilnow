import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function BlindDateToggle() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = pathname.startsWith("/blind-date");

  const onClick = () => {
    navigate(active ? "/dashboard" : "/blind-date");
  };

  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={active}
      aria-label="Toggle Blind Date mode"
      title={active ? "Exit Blind Date" : "Switch to Blind Date"}
      className="group inline-flex items-center gap-2 rounded-full border px-2 py-1 transition-all"
      style={{
        borderColor: active ? "rgba(192,132,252,0.6)" : "hsl(var(--border))",
        background: active
          ? "linear-gradient(135deg, rgba(192,132,252,0.18), rgba(244,114,182,0.18))"
          : "transparent",
        boxShadow: active ? "0 0 18px rgba(192,132,252,0.35)" : "none",
      }}
    >
      <span
        className="relative inline-block h-5 w-9 rounded-full transition-colors"
        style={{ background: active ? "linear-gradient(135deg,#C084FC,#F472B6)" : "hsl(var(--muted))" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: active ? "calc(100% - 1.125rem)" : "0.125rem" }}
        />
      </span>
      <span
        className="inline-flex items-center gap-1 text-xs font-medium pr-1"
        style={{ color: active ? "#C084FC" : "hsl(var(--muted-foreground))" }}
      >
        <Sparkles className="h-3 w-3" /> Blind Date
      </span>
    </button>
  );
}

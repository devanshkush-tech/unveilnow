import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../theme.css";

export function BlindDateLayout({ children, showBack = true, onBack }: { children: ReactNode; showBack?: boolean; onBack?: () => void }) {
  const nav = useNavigate();
  return (
    <div className="bd-root relative overflow-hidden">
      <div className="bd-bg-anim">
        <div className="bd-anim-gradient" />
        <div className="bd-orb" style={{ width: 280, height: 280, background: "#C084FC", top: "10%", left: "-5%" }} />
        <div className="bd-orb" style={{ width: 320, height: 320, background: "#F472B6", bottom: "-10%", right: "-10%" }} />
      </div>
      {showBack && (
        <button
          onClick={() => (onBack ? onBack() : nav(-1))}
          className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bd-surface flex items-center justify-center border border-white/10 hover:bg-white/5 transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline" | "gold";
  full?: boolean;
};

export function GlowButton({ children, variant = "primary", full, className = "", ...rest }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-medium transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "outline"
      ? "border border-white/20 bg-transparent text-white hover:bg-white/5"
      : variant === "gold"
      ? "text-black bd-glow"
      : "text-white bd-glow";
  const bg =
    variant === "primary" ? { background: "linear-gradient(135deg, #C084FC, #F472B6)" } :
    variant === "gold" ? { background: "linear-gradient(135deg, #FCD34D, #F59E0B)" } : {};
  return (
    <button {...rest} style={{ ...bg, ...(rest.style ?? {}) }} className={`${base} ${styles} ${full ? "w-full" : ""} ${className}`}>
      {children}
    </button>
  );
}

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  tone?: "default" | "warm";
  image?: string;
  imageAlt?: string;
};

export const EmptyState = ({ icon: Icon, title, subtitle, action, tone = "default", image, imageAlt }: Props) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-dashed border-border/70 p-8 md:p-14 text-center animate-scale-in ${
        tone === "warm" ? "bg-gradient-soft" : "bg-card/50"
      }`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-veil opacity-30" />
      <div className="relative flex flex-col items-center">
        {image ? (
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl overflow-hidden mb-5 shadow-card border border-border/60">
            <img src={image} alt={imageAlt ?? ""} loading="lazy" className="w-full h-full object-cover" />
          </div>
        ) : Icon ? (
          <div className="h-14 w-14 rounded-2xl bg-gradient-romance flex items-center justify-center mb-5 shadow-soft animate-pulse-glow">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        ) : null}
        <p className="font-display text-2xl md:text-3xl leading-tight max-w-md">{title}</p>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-3 max-w-sm leading-relaxed">{subtitle}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
};

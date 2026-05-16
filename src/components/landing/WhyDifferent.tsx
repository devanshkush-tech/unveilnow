import { X, Check } from "lucide-react";

const regular = [
  "Swipe-first culture",
  "Looks lead the conversation",
  "High timepass",
  "Low-intent conversations",
];

const unveil = [
  "Story-first discovery",
  "Chemistry-based photo reveal",
  "Meaningful prompts",
  "Intent-driven users",
  "Safer, more respectful experience",
];

export const WhyDifferent = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">
            Not just another dating platform
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Why <em className="italic text-gradient">Unveil Now</em> is different
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base">
            Most dating platforms start with photos. Unveil Now starts with stories, values, and real compatibility. We help users connect with who someone is — before deciding based on how they look.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <div className="p-7 md:p-8 rounded-3xl bg-muted/60 border border-border/60">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Regular dating apps</div>
            <h3 className="font-display text-2xl mb-5 text-foreground/70">Swipe-first, looks-first</h3>
            <ul className="space-y-3">
              {regular.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="h-5 w-5 rounded-full bg-background border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative p-7 md:p-8 rounded-3xl border border-transparent shadow-elegant text-primary-foreground overflow-hidden"
            style={{ background: "var(--gradient-romance)" }}>
            <div className="text-xs uppercase tracking-widest opacity-80 mb-2">Unveil Now</div>
            <h3 className="font-display text-2xl mb-5">Story-first, chemistry-first</h3>
            <ul className="space-y-3">
              {unveil.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm">
                  <span className="h-5 w-5 rounded-full bg-background/20 border border-white/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

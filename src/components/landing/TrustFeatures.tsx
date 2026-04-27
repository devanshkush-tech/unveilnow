import { BadgeCheck, Lock, Sparkles, Users } from "lucide-react";

const features = [
  { icon: BadgeCheck, title: "Face verified", desc: "Every profile passes a liveness check. No fakes, no catfishing." },
  { icon: Lock, title: "Photos stay private", desc: "Reveal only with mutual consent. You're always in control." },
  { icon: Users, title: "Intentional only", desc: "Built for people serious about a real relationship — not a thrill." },
  { icon: Sparkles, title: "AI moderated", desc: "Bad actors get filtered out before they ever reach your inbox." },
];

export const TrustFeatures = () => {
  return (
    <section className="py-24 bg-gradient-soft border-y border-border/60">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Why Unveil</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            A space built on <em className="italic text-gradient">trust</em>.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-background border border-border/60 hover:border-accent/40 transition-colors">
              <f.icon className="h-6 w-6 text-primary mb-4" />
              <h3 className="font-display text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

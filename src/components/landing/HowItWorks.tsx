import { FileText, Search, Sparkles, EyeOff, Heart, Info } from "lucide-react";

const steps = [
  { icon: FileText, title: "Create your story", desc: "Answer thoughtful prompts and share what truly matters to you." },
  { icon: Search, title: "Discover meaningful profiles", desc: "Explore people through values, personality, intentions, and interests." },
  { icon: Sparkles, title: "Build chemistry", desc: "Start meaningful conversations and let the chemistry meter grow naturally." },
  { icon: EyeOff, title: "Reveal photos when ready", desc: "Photos are revealed only after the chemistry meter is filled." },
  { icon: Heart, title: "Match and connect", desc: "If both people like each other, it becomes a match and the conversation continues." },
];

export const HowItWorks = () => {
  return (
    <section id="how" className="py-20 md:py-28 bg-gradient-soft border-y border-border/60">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            How <em className="italic text-gradient">Unveil Now</em> works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative p-5 rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500"
            >
              <div className="absolute -top-3 left-5 h-7 w-7 rounded-full text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-soft"
                style={{ background: "var(--gradient-romance)" }}>
                {i + 1}
              </div>
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4 mt-2"
                style={{ background: "var(--gradient-warm)" }}>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg leading-snug mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 flex items-start gap-3 text-sm text-foreground/80">
          <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p>
            <span className="font-medium text-foreground">Likes are unlimited.</span> A match is created only when both people like each other. Match limits depend on the selected plan.
          </p>
        </div>
      </div>
    </section>
  );
};

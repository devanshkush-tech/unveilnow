import { MessageCircleHeart, ShieldCheck, EyeOff } from "lucide-react";

const steps = [
  {
    icon: EyeOff,
    title: "Hide the photos",
    desc: "Your profile leads with prompts, voice and values. Looks come later — when both of you choose.",
  },
  {
    icon: MessageCircleHeart,
    title: "Spark a real conversation",
    desc: "Match on the things that actually matter. Talk first. Feel something before you swipe.",
  },
  {
    icon: ShieldCheck,
    title: "Unveil, together",
    desc: "When you both opt in, photos reveal at once. Mutual consent, no awkward asks.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how" className="py-24 md:py-32 relative">
      <div className="container max-w-6xl">
        <div className="max-w-2xl mb-16 md:mb-20">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            Dating, the way it should have always been.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative p-8 rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-1"
            >
              <div className="absolute top-6 right-6 font-display text-5xl text-muted-foreground/20">0{i + 1}</div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-warm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

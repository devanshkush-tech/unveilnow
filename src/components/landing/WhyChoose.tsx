import { BookHeart, Gauge, Users, Lock } from "lucide-react";

const items = [
  {
    icon: BookHeart,
    title: "Story Before Selfies",
    desc: "Discover people through values, prompts, and personality before photos take over the decision.",
  },
  {
    icon: Gauge,
    title: "Chemistry Before Reveal",
    desc: "Photos unlock only after the chemistry meter is filled, helping users build comfort first.",
  },
  {
    icon: Users,
    title: "Serious People Only",
    desc: "Our small fee and guided flow help reduce casual timepass and attract people with genuine intent.",
  },
  {
    icon: Lock,
    title: "Safe & Private",
    desc: "Users stay in control of what they share, when they reveal, and who they connect with.",
  },
];

export const WhyChoose = () => {
  return (
    <section id="why" className="py-20 md:py-28">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">Why Unveil Now</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Why people are choosing <em className="italic text-gradient">Unveil Now</em>
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base">
            A dating experience built for people who want meaning, privacy, and real intent.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="group p-6 rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-500"
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: "var(--gradient-warm)" }}>
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

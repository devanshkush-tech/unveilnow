import { Lock, BadgeCheck, Users, ShieldCheck, MessageCircleHeart } from "lucide-react";

const features = [
  { icon: Lock, title: "Photo Privacy First", desc: "Photos stay hidden until the chemistry meter is filled." },
  { icon: BadgeCheck, title: "Profile Review", desc: "Profiles are reviewed to keep the community authentic and safe." },
  { icon: Users, title: "Intent-Driven Users", desc: "A small fee helps filter out casual timepass and fake intent." },
  { icon: ShieldCheck, title: "Private by Design", desc: "Users control what they reveal and when they reveal it." },
  { icon: MessageCircleHeart, title: "Respectful Conversations", desc: "The platform encourages thoughtful and genuine interaction." },
];

export const TrustFeatures = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">Safety & Trust</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            A safer, more <em className="italic text-gradient">respectful</em> dating experience
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl bg-card border border-border/60 hover:border-accent/40 hover:shadow-card transition-all">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--gradient-warm)" }}>
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { Lock, Sparkles, MessageCircleHeart, ShieldCheck, PartyPopper, HeartHandshake, MapPin, GraduationCap, Heart } from "lucide-react";

const features = [
  {
    icon: PartyPopper,
    title: "True & Serious Matches",
    desc: "Verified profiles with genuine intent",
    tint: "from-[hsl(14_80%_92%)] to-[hsl(340_70%_95%)]",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    desc: "Strict verification & privacy protection",
    tint: "from-[hsl(340_70%_94%)] to-[hsl(18_70%_94%)]",
  },
  {
    icon: HeartHandshake,
    title: "24/7 Personalized Support",
    desc: "We're here for you, always",
    tint: "from-[hsl(18_80%_94%)] to-[hsl(14_80%_92%)]",
  },
];

export const HeroCard = () => {
  return (
    <div className="relative">
      {/* Floating badge */}
      <div className="absolute -top-3 -right-2 sm:-right-4 z-20 rounded-2xl px-4 py-3 text-primary-foreground shadow-elegant text-sm font-medium leading-tight"
        style={{ background: "var(--gradient-romance)" }}>
        <MessageCircleHeart className="h-4 w-4 mb-1.5 opacity-90" />
        Stories<br />Before<br />Photos
      </div>

      <div className="relative rounded-[2rem] bg-card border border-border/60 shadow-elegant overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-border/50 bg-background/40">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_65%)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(40_85%_60%)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140_50%_55%)]" />
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Profile preview */}
          <div className="rounded-2xl bg-gradient-to-br from-[hsl(14_70%_96%)] to-[hsl(340_60%_96%)] p-4 border border-border/40">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(340_50%_85%)] via-[hsl(18_70%_88%)] to-[hsl(14_70%_82%)] flex items-center justify-center shrink-0 overflow-hidden">
                <div aria-hidden className="absolute inset-0 backdrop-blur-md" />
                <div className="relative h-9 w-9 rounded-xl bg-card/90 flex items-center justify-center shadow-soft">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <Sparkles className="absolute top-2 right-2 h-3 w-3 text-accent/80" />
                <Sparkles className="absolute bottom-2 left-2 h-2.5 w-2.5 text-primary/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg leading-tight text-foreground">Nandini, 28 · IT Analyst</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Bengaluru, Karnataka
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3 w-3" /> B.Tech · Christ University
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm font-medium text-primary-glow">
              <Heart className="h-4 w-4 mt-0.5 shrink-0 fill-current" />
              <span className="leading-snug">Photos reveal only after chemistry meter is filled</span>
            </div>
          </div>

          {/* What you'll get */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display text-base sm:text-lg">What you'll get</h3>
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div className="space-y-2.5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`flex items-center gap-3 rounded-2xl p-3 bg-gradient-to-r ${f.tint} border border-white/40`}
                >
                  <div className="h-10 w-10 rounded-xl bg-card/95 flex items-center justify-center shrink-0 shadow-soft">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground leading-tight">{f.title}</div>
                    <div className="text-xs text-muted-foreground leading-snug mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community proof */}
          <div className="pt-1">
            <div className="flex items-center justify-center gap-2">
              {[
                "https://i.pravatar.cc/80?img=47",
                "https://i.pravatar.cc/80?img=12",
                "https://i.pravatar.cc/80?img=33",
                "https://i.pravatar.cc/80?img=68",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 border-card object-cover -ml-2 first:ml-0 shadow-soft"
                />
              ))}
              <div className="h-9 px-2 min-w-9 rounded-full border-2 border-dashed border-primary/40 text-[11px] font-semibold text-primary flex items-center justify-center -ml-2">
                +2K
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3 inline-flex w-full items-center justify-center gap-1.5">
              <Heart className="h-3 w-3 text-primary-glow fill-current" />
              20,000+ singles joined this week
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

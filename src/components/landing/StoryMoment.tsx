import couplePicnic from "@/assets/couple-picnic.jpg";
import { ScrollReveal, useParallax } from "./ScrollReveal";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

export const StoryMoment = () => {
  const bgRef = useParallax(0.12);
  const imgRef = useParallax(-0.06);
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Very low-opacity photo wash over the plain background */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${couplePicnic})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            filter: "blur(2px) saturate(0.8)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, transparent 25%, transparent 75%, hsl(var(--background)) 100%)" }} />
      </div>

      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-elegant">
              <div ref={imgRef} className="absolute inset-0">
                <img
                  src={couplePicnic}
                  alt="A couple sitting close together on a picnic blanket"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={1120}
                  className="w-full h-full object-cover"
                />
              </div>
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, hsl(340 60% 15% / 0.6) 100%)" }} />
              <div className="absolute bottom-5 left-5 right-5 text-primary-foreground">
                <p className="font-display italic text-lg leading-snug">
                  "We talked for three days before we ever saw each other."
                </p>
              </div>
            </div>
            {/* Floating chips */}
            <div className="hero-float absolute -top-4 right-2 md:right-10 px-4 py-2 rounded-2xl bg-card/90 backdrop-blur border border-border/60 shadow-soft text-xs font-medium inline-flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-primary fill-current" /> Chemistry 88% · Photos unveiled
            </div>
            <div className="ambient-orb absolute -bottom-5 left-2 md:left-8 px-4 py-2 rounded-2xl bg-card/90 backdrop-blur border border-border/60 shadow-soft text-xs inline-flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-primary" /> Sunday picnics &amp; endless conversations
            </div>
          </ScrollReveal>

          <div className="order-1 lg:order-2 text-center lg:text-left">
            <ScrollReveal>
              <p className="text-xs uppercase tracking-[0.18em] text-foreground/70 font-medium mb-3 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Story before selfies
              </p>
              <h2 className="font-display text-3xl md:text-5xl leading-tight">
                Connection that <em className="italic text-gradient">doesn't need</em> a first impression.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-5 text-foreground/75 text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                A swipe takes two seconds. A real connection takes a conversation. On Unveil Now you meet someone's stories, values and intentions first — and the photos come later, when the chemistry is real.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                {[
                  { k: "Story", v: "first" },
                  { k: "Chemistry", v: "before reveal" },
                  { k: "Intent", v: "driven" },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 text-center shadow-soft">
                    <div className="font-display text-lg text-primary">{s.k}</div>
                    <div className="text-[11px] text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

import { BookHeart, Gauge, Users, Lock } from "lucide-react";
import cafe from "@/assets/couple-cafe.jpg";
import quiet from "@/assets/couple-quiet.jpg";
import warm from "@/assets/couple-warm.jpg";
import street from "@/assets/lp-street.jpg";

const items = [
  { icon: BookHeart, img: cafe, title: "Story Before Selfies", desc: "Discover people through values, prompts, and personality before photos take over the decision." },
  { icon: Gauge, img: warm, title: "Chemistry Before Reveal", desc: "Photos unlock only after the chemistry meter is filled, helping users build comfort first." },
  { icon: Users, img: street, title: "Serious People Only", desc: "Our small fee and guided flow help reduce casual timepass and attract people with genuine intent." },
  { icon: Lock, img: quiet, title: "Safe & Private", desc: "Users stay in control of what they share, when they reveal, and who they connect with." },
];

export const WhyChoose = () => (
  <section id="why" className="py-20 md:py-28 bg-secondary">
    <div className="container max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3">Why Unveil Now</p>
        <h2 className="font-display text-3xl md:text-5xl leading-tight">
          Why people are choosing <em className="italic text-gradient">Unveil Now</em>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm md:text-base">
          A dating experience built for people who want meaning, privacy, and real intent.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it) => (
          <div key={it.title} className="group relative h-80 overflow-hidden rounded-3xl bg-background border border-border shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
            <img src={it.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover blur-md scale-110 opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:blur-0 group-hover:scale-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="relative h-full flex flex-col justify-end p-6 transition-colors duration-500 group-hover:text-primary-foreground">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-auto bg-gradient-romance shadow-soft">
                <it.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-500 group-hover:text-primary-foreground/85">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

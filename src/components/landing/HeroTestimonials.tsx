import { Quote } from "lucide-react";

const heroTestimonials = [
  { quote: "Finally, a space where I can be myself and connect beyond appearances.", name: "Sneha", age: "27", initial: "S", color: "bg-gradient-to-br from-rose-300 to-rose-400" },
  { quote: "Great conversations, genuine people and zero pressure.", name: "Arjun", age: "29", initial: "A", color: "bg-gradient-to-br from-violet-300 to-violet-400" },
  { quote: "Unveil feels different. Intentional, respectful and refreshing.", name: "Priya", age: "25", initial: "P", color: "bg-gradient-to-br from-amber-300 to-amber-400" },
  { quote: "Met someone whose mind matched mine before we even saw each other.", name: "Karan", age: "31", initial: "K", color: "bg-gradient-to-br from-emerald-300 to-emerald-400" },
  { quote: "The reveal moment gave me butterflies. Worth every conversation.", name: "Ishita", age: "26", initial: "I", color: "bg-gradient-to-br from-sky-300 to-sky-400" },
  { quote: "No more swiping fatigue. Just real, slow, beautiful connection.", name: "Rohan", age: "30", initial: "R", color: "bg-gradient-to-br from-fuchsia-300 to-fuchsia-400" },
];

const Card = ({ t }: { t: typeof heroTestimonials[number] }) => (
  <figure className="relative w-[300px] md:w-[340px] shrink-0 p-6 rounded-3xl bg-card border border-border/60 shadow-card flex flex-col">
    <Quote className="absolute top-5 right-5 h-5 w-5 text-accent/40" />
    <blockquote className="text-sm text-foreground/90 leading-relaxed mb-5 pr-4">"{t.quote}"</blockquote>
    <figcaption className="mt-auto flex items-center gap-3">
      <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white font-display text-sm font-medium shadow-sm`}>
        {t.initial}
      </div>
      <div>
        <div className="font-medium text-sm">{t.name}, {t.age}</div>
        <div className="text-[11px] text-muted-foreground">Verified member</div>
      </div>
    </figcaption>
  </figure>
);

export const HeroTestimonials = () => {
  const loop = [...heroTestimonials, ...heroTestimonials];
  return (
    <section className="pb-16 md:pb-24 overflow-hidden">
      <div className="relative">
        {/* Edge fades */}
        <div aria-hidden className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div aria-hidden className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
        <div className="marquee-track flex gap-5 md:gap-6 w-max">
          {loop.map((t, i) => <Card key={i} t={t} />)}
        </div>
      </div>
    </section>
  );
};

import { Quote } from "lucide-react";

const heroTestimonials = [
  {
    quote: "Finally, a space where I can be myself and connect beyond appearances.",
    name: "Sneha",
    age: "27",
    initial: "S",
    color: "bg-gradient-to-br from-rose-300 to-rose-400",
  },
  {
    quote: "Great conversations, genuine people and zero pressure.",
    name: "Arjun",
    age: "29",
    initial: "A",
    color: "bg-gradient-to-br from-violet-300 to-violet-400",
  },
  {
    quote: "Unveil feels different. Intentional, respectful and refreshing.",
    name: "Priya",
    age: "25",
    initial: "P",
    color: "bg-gradient-to-br from-amber-300 to-amber-400",
  },
];

export const HeroTestimonials = () => {
  return (
    <section className="pb-16 md:pb-24">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {heroTestimonials.map((t) => (
            <figure
              key={t.name}
              className="relative p-6 md:p-7 rounded-3xl bg-card border border-border/60 shadow-card flex flex-col"
            >
              <Quote className="absolute top-5 right-5 h-5 w-5 text-accent/40" />
              <blockquote className="text-sm md:text-base text-foreground/90 leading-relaxed mb-5 pr-4">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white font-display text-sm font-medium shadow-sm`}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}, {t.age}</div>
                  <div className="text-[11px] text-muted-foreground">Verified member</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

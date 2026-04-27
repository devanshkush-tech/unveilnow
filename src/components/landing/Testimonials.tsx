const testimonials = [
  {
    quote: "I matched with someone who actually read my prompts. We talked for two weeks before seeing each other. It felt like meeting a friend.",
    name: "Aanya, 28",
    role: "Product designer · Bengaluru",
  },
  {
    quote: "Unveil is the first dating app where I didn't feel like a product. The photo reveal moment was genuinely special.",
    name: "Rohan, 32",
    role: "Founder · Mumbai",
  },
  {
    quote: "Tired of the swipe game. Here, conversations have weight. I'm seeing someone seriously now — six months in.",
    name: "Meher, 30",
    role: "Doctor · Delhi",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-6xl">
        <div className="max-w-2xl mb-16">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Real stories</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Conversations that turned into <em className="italic text-gradient">something real</em>.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="p-8 rounded-3xl bg-card border border-border/60 shadow-card flex flex-col justify-between min-h-[260px]"
            >
              <blockquote className="font-display text-lg leading-snug">"{t.quote}"</blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border/60">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

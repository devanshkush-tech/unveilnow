export type VideoTestimonial = {
  name: string;
  title: string;
  quote: string;
  youtubeId: string;
};

const testimonials: VideoTestimonial[] = [
  {
    name: "Aisha",
    title: "Felt seen beyond photos",
    quote: "For the first time, someone read who I am before judging how I look.",
    youtubeId: "wLG7guuMqM4",
  },
  {
    name: "Rohan",
    title: "Better conversations",
    quote: "The prompts made the conversation feel more real and less random.",
    youtubeId: "p5EFzx6NEWo",
  },
];

const VideoCard = ({ t }: { t: VideoTestimonial }) => (
  <div className="group relative rounded-3xl overflow-hidden bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500">
    <div className="relative aspect-[9/16] max-h-[560px] bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${t.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
        title={`${t.name} — ${t.title}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
    <div className="p-6">
      <div className="font-display text-xl">{t.name}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{t.title}</div>
      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">"{t.quote}"</p>
    </div>
  </div>
);

export const VideoTestimonials = () => {
  return (
    <section id="stories" className="py-20 md:py-28 bg-gradient-soft border-y border-border/60">
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">What users say</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Real stories, real <em className="italic text-gradient">connections</em>
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base">
            Real conversations and meaningful connections from the Unveil Now community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
          {testimonials.map((t) => (
            <VideoCard key={t.youtubeId} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

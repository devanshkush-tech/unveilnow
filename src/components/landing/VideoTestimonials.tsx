import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replace `videoUrl` and `thumbnail` later with real content.
export type VideoTestimonial = {
  name: string;
  title: string;
  quote: string;
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
};

const testimonials: VideoTestimonial[] = [
  {
    name: "Aisha",
    title: "Felt seen beyond photos",
    quote: "For the first time, someone read who I am before judging how I look.",
    duration: "0:45",
  },
  {
    name: "Rohan",
    title: "Better conversations",
    quote: "The prompts made the conversation feel more real and less random.",
    duration: "0:58",
  },
];

const VideoCard = ({ t }: { t: VideoTestimonial }) => {
  const content = (
    <div className="group relative rounded-3xl overflow-hidden bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500">
      <div className="relative aspect-video overflow-hidden">
        {t.thumbnail ? (
          <img src={t.thumbnail} alt={t.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full" style={{ background: "var(--gradient-warm)" }} aria-hidden />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <button
          aria-label={`Play ${t.name}'s testimonial`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="h-16 w-16 rounded-full bg-card/95 border border-white/60 shadow-elegant flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-primary fill-current ml-0.5" />
          </span>
        </button>
        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium tracking-wide">
          {t.duration}
        </span>
      </div>
      <div className="p-6">
        <div className="font-display text-xl">{t.name}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{t.title}</div>
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">"{t.quote}"</p>
      </div>
    </div>
  );

  return t.videoUrl ? (
    <a href={t.videoUrl} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    content
  );
};

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

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {testimonials.map((t) => (
            <VideoCard key={t.name} t={t} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="soft" size="lg" asChild>
            <a href="#stories">Watch more stories</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

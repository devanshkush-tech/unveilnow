import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import r1 from "@/assets/reveal-1.jpg";
import r2 from "@/assets/reveal-2.jpg";
import r3 from "@/assets/reveal-3.jpg";
import r4 from "@/assets/reveal-4.jpg";

const profiles = [
  { img: r1, name: "Nandini, 28", city: "Bengaluru", prompt: "A perfect Sunday is…", answer: "A second-hand bookstore, filter coffee, and nowhere to be." },
  { img: r2, name: "Arjun, 30", city: "Mumbai", prompt: "I'm looking for…", answer: "Someone who'll watch the sunset with me and talk till the city lights come on." },
  { img: r3, name: "Meher, 27", city: "Delhi", prompt: "My love language is…", answer: "Remembering the small things you said three weeks ago." },
  { img: r4, name: "Kabir, 29", city: "Pune", prompt: "You'll win me over if…", answer: "You hum along off-key and don't care who hears." },
];

const RevealCard = ({ p, i }: { p: (typeof profiles)[number]; i: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-3xl text-left shadow-card transition-all duration-700 hover:-translate-y-2 hover:shadow-elegant animate-fade-up"
      style={{ animationDelay: `${i * 120}ms` }}
      data-open={open}
      aria-label={`Reveal ${p.name}`}
    >
      <img
        src={p.img}
        alt={`${p.name} from ${p.city}`}
        loading="lazy"
        width={768}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl transition-all duration-[1200ms] ease-out group-hover:scale-100 group-hover:blur-0 group-data-[open=true]:scale-100 group-data-[open=true]:blur-0"
      />
      {/* Veil */}
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm transition-opacity duration-700 group-hover:opacity-0 group-data-[open=true]:opacity-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-data-[open=true]:opacity-100" />

      {/* Story (veiled state) */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-primary-foreground transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4 group-data-[open=true]:opacity-0">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] opacity-80">
          <Lock className="h-3.5 w-3.5" /> Story first
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] opacity-70 mb-2">{p.prompt}</p>
          <p className="font-display text-xl leading-snug italic">"{p.answer}"</p>
        </div>
      </div>

      {/* Revealed state */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground translate-y-6 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Chemistry unlocked
        </div>
        <p className="font-display text-2xl">{p.name}</p>
        <p className="text-sm opacity-80">{p.city}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-primary-foreground/25 overflow-hidden">
          <div className="h-full w-0 rounded-full bg-primary-foreground transition-all duration-[1400ms] ease-out group-hover:w-full group-data-[open=true]:w-full" />
        </div>
      </div>
    </button>
  );
};

export const RevealCards = () => (
  <section id="stories-preview" className="py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3">The Unveil experience</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight max-w-xl">
            Read the story. <em className="italic text-gradient">Then</em> see the face.
          </h2>
        </div>
        <p className="text-muted-foreground max-w-sm text-sm md:text-base">
          Hover (or tap) a card to feel how it works — the photo only comes into focus once chemistry is built.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {profiles.map((p, i) => <RevealCard key={p.name} p={p} i={i} />)}
      </div>
    </div>
  </section>
);

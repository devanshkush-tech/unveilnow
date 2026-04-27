import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X, Mic, MapPin, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  name: string;
  age: number;
  city: string;
  profession: string;
  intent: string;
  prompts: { q: string; a: string }[];
  interests: string[];
};

const sampleProfiles: Profile[] = [
  {
    name: "Aanya",
    age: 28,
    city: "Bengaluru",
    profession: "Product designer at a climate startup",
    intent: "Serious relationship",
    prompts: [
      { q: "My ideal Sunday looks like…", a: "A long walk in Cubbon, dosa at a hole-in-the-wall, and a film I've been putting off." },
      { q: "A green flag I admire…", a: "People who text back. And mean what they say." },
      { q: "A random truth about me…", a: "I keep a list of every book I've cried over. It's at 17." },
    ],
    interests: ["Books", "Films", "Travel", "Coffee", "Yoga"],
  },
  {
    name: "Rohan",
    age: 31,
    city: "Mumbai",
    profession: "Engineer turned founder",
    intent: "Marriage minded",
    prompts: [
      { q: "I value…", a: "Curiosity over certainty. Quiet ambition. Family that calls without occasion." },
      { q: "My ideal Sunday…", a: "Filter coffee, the newspaper, a long phone call with my sister, and the sea by evening." },
    ],
    interests: ["Startups", "Music", "Hiking", "Food"],
  },
  {
    name: "Meher",
    age: 30,
    city: "Delhi",
    profession: "Doctor",
    intent: "Exploring intentionally",
    prompts: [
      { q: "A green flag I admire…", a: "Someone who can be still. Who doesn't need to fill silence with noise." },
      { q: "A random truth about me…", a: "I learned to bake during the pandemic and now I judge croissants like I trained in Paris." },
    ],
    interests: ["Art", "Food", "Travel", "Writing"],
  },
];

const Discover = () => {
  const [index, setIndex] = useState(0);
  const profile = sampleProfiles[index % sampleProfiles.length];

  const advance = (liked: boolean) => {
    if (liked) toast.success("You're interested. We'll let them know.");
    else toast("Passed.", { description: "We won't show this profile again." });
    setIndex((i) => i + 1);
  };

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Discover</h1>
        <p className="text-muted-foreground mt-1">Read first. Decide with your gut.</p>
      </div>

      <article
        key={profile.name + index}
        className="bg-card border border-border/60 rounded-3xl shadow-card overflow-hidden animate-fade-up"
      >
        {/* Veiled header */}
        <div className="relative h-40 bg-gradient-romance flex items-end p-6 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
          <div className="relative text-primary-foreground">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/20 backdrop-blur text-[11px] uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3" /> Photos hidden
            </div>
            <h2 className="font-display text-4xl">{profile.name}, <span className="font-light">{profile.age}</span></h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.city}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {profile.profession}</span>
            <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {profile.intent}</span>
          </div>

          <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-secondary/70 hover:bg-secondary transition-colors">
            <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
              <Mic className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">Hear {profile.name}'s voice intro</div>
              <div className="text-xs text-muted-foreground">28 seconds</div>
            </div>
          </button>

          <div className="space-y-5">
            {profile.prompts.map((p, i) => (
              <div key={i} className="border-l-2 border-accent/60 pl-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{p.q}</p>
                <p className="font-display text-lg leading-snug">{p.a}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{i}</span>
              ))}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full shadow-card hover:scale-105 transition-transform"
          onClick={() => advance(false)}
        >
          <X className="h-6 w-6 text-muted-foreground" />
        </Button>
        <Button
          variant="hero"
          className="h-16 px-10 rounded-full text-base"
          onClick={() => advance(true)}
        >
          <Heart className="h-5 w-5" />
          Interested
        </Button>
      </div>
    </div>
  );
};

export default Discover;

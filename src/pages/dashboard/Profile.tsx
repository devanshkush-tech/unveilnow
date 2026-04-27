import { Button } from "@/components/ui/button";
import { BadgeCheck, Edit3, Mic } from "lucide-react";

const Profile = () => {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Your profile</h1>
          <p className="text-muted-foreground mt-1">This is how others meet you.</p>
        </div>
        <Button variant="soft" className="rounded-full"><Edit3 className="h-4 w-4" /> Edit</Button>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-card overflow-hidden">
        <div className="relative h-40 bg-gradient-romance flex items-end p-6">
          <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
          <div className="relative text-primary-foreground flex items-center gap-3">
            <h2 className="font-display text-4xl">You, 28</h2>
            <BadgeCheck className="h-6 w-6" />
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-sm text-muted-foreground">Bengaluru · Product designer · Serious relationship</div>

          <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-secondary/70">
            <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
              <Mic className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">Your voice intro</div>
              <div className="text-xs text-muted-foreground">28 seconds · Tap to re-record</div>
            </div>
          </button>

          <div className="space-y-5">
            <PromptRow q="My ideal Sunday looks like…" a="A long walk in Cubbon, dosa at a hole-in-the-wall, and a film I've been putting off." />
            <PromptRow q="I value…" a="People who follow through. And listen with their phone face down." />
          </div>
        </div>
      </div>
    </div>
  );
};

const PromptRow = ({ q, a }: { q: string; a: string }) => (
  <div className="border-l-2 border-accent/60 pl-4">
    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{q}</p>
    <p className="font-display text-lg leading-snug">{a}</p>
  </div>
);

export default Profile;

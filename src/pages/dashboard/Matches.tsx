import { Button } from "@/components/ui/button";
import { EyeOff, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const matches = [
  { name: "Aanya", city: "Bengaluru", since: "2 days ago" },
  { name: "Rohan", city: "Mumbai", since: "5 days ago" },
  { name: "Meher", city: "Delhi", since: "1 week ago" },
];

const Matches = () => {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Matches</h1>
        <p className="text-muted-foreground mt-1">Mutual interest. The good part.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {matches.map((m) => (
          <div key={m.name} className="p-5 rounded-2xl bg-card border border-border/60 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                <EyeOff className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-display text-xl">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.city} · matched {m.since}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="hero" className="flex-1 rounded-full" asChild>
                <Link to="/dashboard/chats"><MessageCircle className="h-4 w-4" /> Say hi</Link>
              </Button>
              <Button variant="soft" className="rounded-full">Reveal</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;

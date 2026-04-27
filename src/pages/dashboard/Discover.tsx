import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X, Mic, MapPin, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Candidate = {
  id: string;
  first_name: string | null;
  age: number | null;
  city: string | null;
  profession: string | null;
  intent: string | null;
  prompts: { question: string; answer: string }[];
  interests: string[];
};

const intentLabel = (i: string | null) => {
  switch (i) {
    case "serious": return "Serious relationship";
    case "marriage": return "Marriage minded";
    case "exploring": return "Exploring intentionally";
    default: return "Open to connection";
  }
};

const Discover = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      // Fetch already-liked ids to exclude
      const { data: likedRows } = await supabase.from("likes").select("liked_id").eq("liker_id", user.id);
      const excluded = new Set<string>(likedRows?.map((r) => r.liked_id) ?? []);
      excluded.add(user.id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, age, city, profession, intent")
        .eq("onboarded", true)
        .limit(50);

      const filtered = (profiles ?? []).filter((p) => !excluded.has(p.id));
      if (filtered.length === 0) { setCandidates([]); setLoading(false); return; }

      const ids = filtered.map((p) => p.id);
      const [{ data: prompts }, { data: interests }] = await Promise.all([
        supabase.from("profile_prompts").select("user_id, question, answer, position").in("user_id", ids).order("position"),
        supabase.from("profile_interests").select("user_id, interest").in("user_id", ids),
      ]);

      const byUserPrompts = new Map<string, { question: string; answer: string }[]>();
      (prompts ?? []).forEach((p) => {
        const arr = byUserPrompts.get(p.user_id) ?? [];
        arr.push({ question: p.question, answer: p.answer });
        byUserPrompts.set(p.user_id, arr);
      });

      const byUserInterests = new Map<string, string[]>();
      (interests ?? []).forEach((i) => {
        const arr = byUserInterests.get(i.user_id) ?? [];
        arr.push(i.interest);
        byUserInterests.set(i.user_id, arr);
      });

      setCandidates(filtered.map((p) => ({
        ...p,
        prompts: byUserPrompts.get(p.id) ?? [],
        interests: byUserInterests.get(p.id) ?? [],
      })));
      setIndex(0);
      setLoading(false);
    })();
  }, [user]);

  const current = candidates[index];

  const advance = async (liked: boolean) => {
    if (!current || !user || acting) return;
    setActing(true);
    try {
      if (liked) {
        const { error } = await supabase.from("likes").insert({ liker_id: user.id, liked_id: current.id });
        if (error) throw error;
        // Check if it became a match
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .or(`and(user_a.eq.${user.id},user_b.eq.${current.id}),and(user_a.eq.${current.id},user_b.eq.${user.id})`)
          .maybeSingle();
        if (match) toast.success(`It's a match with ${current.first_name}!`);
        else toast.success("You're interested. We'll let them know.");
      } else {
        toast("Passed.", { description: "We won't show this profile again." });
      }
      setIndex((i) => i + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl mb-3">You're all caught up.</h1>
        <p className="text-muted-foreground">New people are joining Unveil every day. Check back soon — quality takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Discover</h1>
        <p className="text-muted-foreground mt-1">Read first. Decide with your gut.</p>
      </div>

      <article
        key={current.id}
        className="bg-card border border-border/60 rounded-3xl shadow-card overflow-hidden animate-fade-up"
      >
        <div className="relative h-40 bg-gradient-romance flex items-end p-6 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
          <div className="relative text-primary-foreground">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/20 backdrop-blur text-[11px] uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3" /> Photos hidden
            </div>
            <h2 className="font-display text-4xl">
              {current.first_name}{current.age ? <>, <span className="font-light">{current.age}</span></> : null}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {current.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {current.city}</span>}
            {current.profession && <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {current.profession}</span>}
            <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {intentLabel(current.intent)}</span>
          </div>

          {current.prompts.length > 0 && (
            <div className="space-y-5">
              {current.prompts.map((p, i) => (
                <div key={i} className="border-l-2 border-accent/60 pl-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{p.question}</p>
                  <p className="font-display text-lg leading-snug">{p.answer}</p>
                </div>
              ))}
            </div>
          )}

          {current.interests.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {current.interests.map((i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full shadow-card hover:scale-105 transition-transform"
          onClick={() => advance(false)}
          disabled={acting}
        >
          <X className="h-6 w-6 text-muted-foreground" />
        </Button>
        <Button
          variant="hero"
          className="h-16 px-10 rounded-full text-base"
          onClick={() => advance(true)}
          disabled={acting}
        >
          <Heart className="h-5 w-5" />
          Interested
        </Button>
      </div>
    </div>
  );
};

export default Discover;

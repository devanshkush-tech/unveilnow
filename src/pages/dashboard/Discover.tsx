import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Briefcase, Sparkles, Loader2, BookOpen, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InterestDialog } from "@/components/dating/InterestDialog";
import { VoicePlayer } from "@/components/dating/VoicePlayer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Candidate = {
  id: string;
  first_name: string | null;
  age: number | null;
  city: string | null;
  profession: string | null;
  intent: string | null;
  story: string | null;
  voice_intro_path: string | null;
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
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Candidate | null>(null);
  const [interestFor, setInterestFor] = useState<Candidate | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: sentRows }, { data: profiles }] = await Promise.all([
        supabase.from("interest_requests").select("receiver_id").eq("sender_id", user.id),
        supabase
          .from("profiles")
          .select("id, first_name, age, city, profession, intent, story, voice_intro_path")
          .eq("onboarded", true)
          .neq("id", user.id)
          .limit(50),
      ]);
      const sent = new Set((sentRows ?? []).map((r) => r.receiver_id));
      setSentIds(sent);
      const filtered = profiles ?? [];
      if (filtered.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }
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
      setCandidates(
        filtered.map((p) => ({
          ...p,
          prompts: byUserPrompts.get(p.id) ?? [],
          interests: byUserInterests.get(p.id) ?? [],
        })),
      );
      setLoading(false);
    })();
  }, [user]);

  const visible = useMemo(() => candidates, [candidates]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl mb-3">You're all caught up.</h1>
        <p className="text-muted-foreground">New people are joining Unveil every day. Check back soon — quality takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Discover</h1>
        <p className="text-muted-foreground mt-1">Read first. Decide with your gut. Connection before attraction.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {visible.map((c) => {
          const sent = sentIds.has(c.id);
          return (
            <article
              key={c.id}
              className="bg-card border border-border/60 rounded-3xl shadow-card overflow-hidden animate-fade-up flex flex-col"
            >
              <div className="relative h-32 bg-gradient-romance flex items-end p-5 overflow-hidden">
                <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
                <div className="relative text-primary-foreground">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/20 backdrop-blur text-[10px] uppercase tracking-wider mb-2">
                    <EyeOff className="h-3 w-3" /> Photos hidden
                  </div>
                  <h2 className="font-display text-2xl">
                    {c.first_name}
                    {c.age ? <>, <span className="font-light">{c.age}</span></> : null}
                  </h2>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  {c.city && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.city}</span>}
                  {c.profession && <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {c.profession}</span>}
                  <span className="flex items-center gap-1.5"><Heart className="h-3 w-3" /> {intentLabel(c.intent)}</span>
                </div>

                {c.voice_intro_path && (
                  <div><VoicePlayer path={c.voice_intro_path} /></div>
                )}

                {c.prompts.slice(0, 2).map((p, i) => (
                  <div key={i} className="border-l-2 border-accent/60 pl-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.question}</p>
                    <p className="font-display text-base leading-snug line-clamp-3">{p.answer}</p>
                  </div>
                ))}

                {c.story && (
                  <p className="text-sm text-muted-foreground line-clamp-3 italic">"{c.story.slice(0, 160)}{c.story.length > 160 ? "…" : ""}"</p>
                )}

                {c.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.interests.slice(0, 5).map((i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-secondary text-xs">{i}</span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                  <Button variant="soft" className="rounded-full" onClick={() => setActive(c)}>
                    <BookOpen className="h-4 w-4" /> Read full
                  </Button>
                  <Button
                    variant="hero"
                    className="rounded-full"
                    onClick={() => setInterestFor(c)}
                    disabled={sent}
                  >
                    <Heart className="h-4 w-4" /> {sent ? "Sent" : "Send interest"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Full-profile sheet */}
      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <div className="h-28 -mx-6 -mt-6 mb-4 rounded-b-3xl bg-gradient-romance relative flex items-end p-5">
                  <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50 rounded-b-3xl" />
                  <SheetTitle className="relative font-display text-3xl text-primary-foreground">
                    {active.first_name}{active.age ? `, ${active.age}` : ""}
                  </SheetTitle>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  {active.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {active.city}</span>}
                  {active.profession && <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {active.profession}</span>}
                  <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {intentLabel(active.intent)}</span>
                </div>

                {active.voice_intro_path && <VoicePlayer path={active.voice_intro_path} />}

                {active.story && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">My story</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{active.story}</p>
                  </div>
                )}

                {active.prompts.length > 0 && (
                  <div className="space-y-4">
                    {active.prompts.map((p, i) => (
                      <div key={i} className="border-l-2 border-accent/60 pl-4">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{p.question}</p>
                        <p className="font-display text-lg leading-snug">{p.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {active.interests.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {active.interests.map((i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full h-12 rounded-full"
                  disabled={sentIds.has(active.id)}
                  onClick={() => {
                    setInterestFor(active);
                    setActive(null);
                  }}
                >
                  <Heart className="h-4 w-4" /> {sentIds.has(active.id) ? "Interest sent" : `Send interest to ${active.first_name}`}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {interestFor && (
        <InterestDialog
          open={!!interestFor}
          onOpenChange={(v) => !v && setInterestFor(null)}
          receiverId={interestFor.id}
          receiverName={interestFor.first_name}
          onSent={() => setSentIds((s) => new Set(s).add(interestFor.id))}
        />
      )}
    </div>
  );
};

export default Discover;

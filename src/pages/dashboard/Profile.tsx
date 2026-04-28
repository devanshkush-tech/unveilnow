import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Edit3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VoicePlayer } from "@/components/dating/VoicePlayer";

type Prof = {
  first_name: string | null;
  age: number | null;
  city: string | null;
  profession: string | null;
  intent: string | null;
  story: string | null;
  voice_intro_path: string | null;
};

const intentLabel = (i: string | null) => {
  switch (i) {
    case "serious": return "Serious relationship";
    case "marriage": return "Marriage minded";
    case "exploring": return "Exploring intentionally";
    default: return "Open to connection";
  }
};

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Prof | null>(null);
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: pr }, { data: ints }] = await Promise.all([
        supabase
          .from("profiles")
          .select("first_name, age, city, profession, intent, story, voice_intro_path")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("profile_prompts").select("question, answer, position").eq("user_id", user.id).order("position"),
        supabase.from("profile_interests").select("interest").eq("user_id", user.id),
      ]);
      setProfile(p ?? null);
      setPrompts(pr ?? []);
      setInterests((ints ?? []).map((x) => x.interest));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="container max-w-3xl py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Your profile</h1>
          <p className="text-muted-foreground mt-1">This is how others meet you. Read me before you judge me.</p>
        </div>
        <Button variant="soft" className="rounded-full" asChild>
          <Link to="/onboarding"><Edit3 className="h-4 w-4" /> Edit</Link>
        </Button>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-card overflow-hidden animate-fade-up">
        <div className="relative h-40 bg-gradient-romance flex items-end p-6">
          <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
          <div className="relative text-primary-foreground flex items-center gap-3">
            <h2 className="font-display text-4xl">{profile?.first_name ?? "You"}{profile?.age ? `, ${profile.age}` : ""}</h2>
            <BadgeCheck className="h-6 w-6" />
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-sm text-muted-foreground">
            {[profile?.city, profile?.profession, intentLabel(profile?.intent ?? null)].filter(Boolean).join(" · ")}
          </div>

          {profile?.voice_intro_path && (
            <div><VoicePlayer path={profile.voice_intro_path} /></div>
          )}

          {profile?.story && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">My story</p>
              <p className="text-base leading-relaxed whitespace-pre-line">{profile.story}</p>
            </div>
          )}

          <div className="space-y-5">
            {prompts.map((p, i) => (
              <div key={i} className="border-l-2 border-accent/60 pl-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{p.question}</p>
                <p className="font-display text-lg leading-snug">{p.answer}</p>
              </div>
            ))}
          </div>

          {interests.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{i}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

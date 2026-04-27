import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, MessageCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

type MatchRow = {
  id: string;
  other: { id: string; first_name: string | null; city: string | null };
  created_at: string;
};

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase
        .from("matches")
        .select("id, user_a, user_b, created_at")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const otherIds = (rows ?? []).map((r) => (r.user_a === user.id ? r.user_b : r.user_a));
      const { data: profs } = otherIds.length
        ? await supabase.from("profiles").select("id, first_name, city").in("id", otherIds)
        : { data: [] as { id: string; first_name: string | null; city: string | null }[] };
      const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);

      setMatches((rows ?? []).map((r) => {
        const oid = r.user_a === user.id ? r.user_b : r.user_a;
        return {
          id: r.id,
          created_at: r.created_at,
          other: profMap.get(oid) ?? { id: oid, first_name: "Someone", city: null },
        };
      }));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="container max-w-3xl py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Matches</h1>
        <p className="text-muted-foreground mt-1">Mutual interest. The good part.</p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-2xl mb-2">No matches just yet.</p>
          <p className="text-muted-foreground text-sm">Keep reading stories on Discover. The right one is worth waiting for.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m.id} className="p-5 rounded-2xl bg-card border border-border/60 shadow-card">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                  <EyeOff className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-xl">{m.other.first_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.other.city ? `${m.other.city} · ` : ""}matched {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="hero" className="flex-1 rounded-full" asChild>
                  <Link to={`/dashboard/chats?match=${m.id}`}><MessageCircle className="h-4 w-4" /> Say hi</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;

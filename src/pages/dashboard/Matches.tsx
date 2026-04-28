import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, MessageCircle, Heart, Inbox, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { EmptyState } from "@/components/dating/EmptyState";

type MatchRow = {
  id: string;
  other: { id: string; first_name: string | null; city: string | null };
  created_at: string;
};

type InterestRow = {
  id: string;
  message: string | null;
  created_at: string;
  status: string;
  other: { id: string; first_name: string | null; city: string | null };
};

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [received, setReceived] = useState<InterestRow[]>([]);
  const [sent, setSent] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: matchRows }, { data: recvd }, { data: sentRows }] = await Promise.all([
      supabase
        .from("matches")
        .select("id, user_a, user_b, created_at")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false }),
      supabase
        .from("interest_requests")
        .select("id, sender_id, message, status, created_at")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("interest_requests")
        .select("id, receiver_id, message, status, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const userIds = new Set<string>();
    (matchRows ?? []).forEach((r) => userIds.add(r.user_a === user.id ? r.user_b : r.user_a));
    (recvd ?? []).forEach((r) => userIds.add(r.sender_id));
    (sentRows ?? []).forEach((r) => userIds.add(r.receiver_id));

    const { data: profs } = userIds.size
      ? await supabase.from("profiles").select("id, first_name, city").in("id", Array.from(userIds))
      : { data: [] as { id: string; first_name: string | null; city: string | null }[] };
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    const fallback = (id: string) => profMap.get(id) ?? { id, first_name: "Someone", city: null };

    setMatches(
      (matchRows ?? []).map((r) => {
        const oid = r.user_a === user.id ? r.user_b : r.user_a;
        return { id: r.id, created_at: r.created_at, other: fallback(oid) };
      }),
    );
    setReceived(
      (recvd ?? []).map((r) => ({
        id: r.id,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        other: fallback(r.sender_id),
      })),
    );
    setSent(
      (sentRows ?? []).map((r) => ({
        id: r.id,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        other: fallback(r.receiver_id),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const respond = async (id: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("interest_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "accepted" ? "Connection unlocked. Start the conversation." : "Politely declined.");
    await load();
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-6 md:py-10 space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-56 skeleton-shimmer" />
          <div className="h-3 w-64 skeleton-shimmer" />
        </div>
        <div className="h-12 w-80 skeleton-shimmer rounded-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 skeleton-shimmer rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Connections</h1>
        <p className="text-muted-foreground mt-1">Meaningful interest. The good part.</p>
      </div>

      <Tabs defaultValue="incoming" className="space-y-6">
        <TabsList className="rounded-full p-1 h-12 bg-secondary">
          <TabsTrigger value="incoming" className="rounded-full px-5">
            <Inbox className="h-4 w-4" /> Incoming
            {received.length > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {received.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matches" className="rounded-full px-5">
            <Heart className="h-4 w-4" /> Matches
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-full px-5">
            <Sparkles className="h-4 w-4" /> Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-3">
          {received.length === 0 ? (
            <Empty title="No interest yet — that's okay." subtitle="Real connections take a beat." />
          ) : (
            received.map((r, idx) => (
              <div
                key={r.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="p-5 rounded-3xl bg-card border border-border/60 shadow-card animate-fade-up card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-romance flex items-center justify-center shrink-0 animate-pulse-glow">
                    <EyeOff className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-display text-lg">{r.other.first_name}</p>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                    </div>
                    {r.message && (
                      <p className="text-sm leading-relaxed mt-2 italic text-foreground/90">"{r.message}"</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button variant="hero" className="rounded-full" onClick={() => respond(r.id, "accepted")}>
                        <Heart className="h-4 w-4" /> Connect
                      </Button>
                      <Button variant="ghost" className="rounded-full" onClick={() => respond(r.id, "declined")}>
                        Pass
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {matches.length === 0 ? (
            <Empty title="No matches just yet." subtitle="Keep reading stories on Discover. The right one is worth waiting for." />
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
                  <div className="mt-4">
                    <Button variant="hero" className="w-full rounded-full" asChild>
                      <Link to={`/dashboard/chats?match=${m.id}`}>
                        <MessageCircle className="h-4 w-4" /> Open chat
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {sent.length === 0 ? (
            <Empty title="You haven't sent interest yet." subtitle="Read someone's story you connect with — then say something real." />
          ) : (
            sent.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.other.first_name}</div>
                  <div className="text-xs text-muted-foreground italic line-clamp-1">"{r.message}"</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                  r.status === "accepted" ? "bg-primary text-primary-foreground" : r.status === "declined" ? "bg-secondary text-muted-foreground" : "bg-accent/30 text-accent-foreground"
                }`}>{r.status}</span>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Empty = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <EmptyState icon={Heart} tone="warm" title={title} subtitle={subtitle} />
);

export default Matches;

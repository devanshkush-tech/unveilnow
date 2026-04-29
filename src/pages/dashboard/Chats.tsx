import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeOff, Send, Eye, Loader2, Sparkles, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { computeChemistry, chemistryLabel, DEFAULT_CHEMISTRY_WEIGHTS, type ChemistryWeights, type Msg } from "@/lib/chemistry";
import { ChatRowSkeleton } from "@/components/dating/CardSkeleton";

type Conv = {
  id: string;
  other_id: string;
  name: string | null;
  reveal_a: boolean;
  reveal_b: boolean;
  user_a: string;
  user_b: string;
};

const Chats = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [revealedPhotos, setRevealedPhotos] = useState<{ url: string }[]>([]);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [sending, setSending] = useState(false);
  const [animatedChem, setAnimatedChem] = useState(0);
  const [chemWeights, setChemWeights] = useState<ChemistryWeights>(DEFAULT_CHEMISTRY_WEIGHTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load tunable chemistry weights (admin-managed)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings" as any)
        .select("value")
        .eq("key", "chemistry_weights")
        .maybeSingle();
      const v = (data as any)?.value;
      if (v && typeof v === "object") {
        setChemWeights({ ...DEFAULT_CHEMISTRY_WEIGHTS, ...v });
      }
    })();
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase
        .from("matches")
        .select("id, user_a, user_b, reveal_a, reveal_b, created_at")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });
      const otherIds = (rows ?? []).map((r) => (r.user_a === user.id ? r.user_b : r.user_a));
      const { data: profs } = otherIds.length
        ? await supabase.from("profiles").select("id, first_name").in("id", otherIds)
        : { data: [] as { id: string; first_name: string | null }[] };
      const map = new Map(profs?.map((p) => [p.id, p.first_name]) ?? []);
      const convs: Conv[] = (rows ?? []).map((r) => {
        const oid = r.user_a === user.id ? r.user_b : r.user_a;
        return { id: r.id, other_id: oid, name: map.get(oid) ?? "Someone", reveal_a: r.reveal_a, reveal_b: r.reveal_b, user_a: r.user_a, user_b: r.user_b };
      });
      setConversations(convs);
      const wanted = params.get("match");
      const initial = convs.find((c) => c.id === wanted) ?? null;
      setActive(initial);
      setLoadingList(false);
    })();
  }, [user]);

  // Load messages + subscribe (real-time)
  useEffect(() => {
    if (!active) { setMessages([]); return; }
    setLoadingThread(true);
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages").select("id, sender_id, body, created_at")
        .eq("match_id", active.id).order("created_at");
      if (!cancelled) {
        setMessages(data ?? []);
        setLoadingThread(false);
      }
    })();

    const channel = supabase
      .channel(`messages-${active.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${active.id}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${active.id}` },
        (payload) => {
          const m = payload.new as { reveal_a: boolean; reveal_b: boolean };
          setActive((cur) => cur ? { ...cur, reveal_a: m.reveal_a, reveal_b: m.reveal_b } : cur);
        }
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [active?.id]);

  // Auto-scroll to latest
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Use rAF so layout is committed before scrolling.
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length, active?.id]);

  // Reveal cinematic
  useEffect(() => {
    if (active?.reveal_a && active?.reveal_b) {
      setShowReveal(true);
      const t = setTimeout(() => setShowReveal(false), 2400);
      return () => clearTimeout(t);
    }
  }, [active?.reveal_a, active?.reveal_b]);

  // Fetch revealed photos
  useEffect(() => {
    if (!active || !user) { setRevealedPhotos([]); return; }
    if (!(active.reveal_a && active.reveal_b)) { setRevealedPhotos([]); return; }
    (async () => {
      const { data, error } = await supabase.functions.invoke("get-revealed-photos", {
        body: { match_id: active.id },
      });
      if (error) return;
      if (data?.revealed && data.photos) setRevealedPhotos(data.photos);
    })();
  }, [active?.id, active?.reveal_a, active?.reveal_b, user?.id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !active || !user || sending) return;
    const body = input.trim();
    const tempId = `temp-${Date.now()}`;
    // Optimistic — instant UI feedback
    setMessages((prev) => [...prev, { id: tempId, sender_id: user.id, body, created_at: new Date().toISOString() }]);
    setInput("");
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ match_id: active.id, sender_id: user.id, body })
      .select("id, sender_id, body, created_at")
      .single();
    setSending(false);
    if (error || !data) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error(error?.message ?? "Could not send.");
      setInput(body);
      return;
    }
    // Replace optimistic with real row (avoid duplicate from realtime).
    setMessages((prev) => {
      const withoutTemp = prev.filter((m) => m.id !== tempId);
      if (withoutTemp.some((m) => m.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as Msg];
    });
  };

  const requestReveal = async () => {
    if (!active || !user) return;
    const isA = user.id === active.user_a;
    const patch = isA ? { reveal_a: true } : { reveal_b: true };
    const { error } = await supabase.from("matches").update(patch).eq("id", active.id);
    if (error) { toast.error(error.message); return; }
    setActive((cur) => cur ? { ...cur, ...patch } : cur);
    const both = isA ? (active.reveal_b) : (active.reveal_a);
    toast.success(both ? "Photos unveiled — you both said yes." : `Unveil request sent to ${active.name}.`);
  };

  const fullyRevealed = !!active?.reveal_a && !!active?.reveal_b;
  const myConsent = active && user ? (user.id === active.user_a ? active.reveal_a : active.reveal_b) : false;

  const chemistry = useMemo(() => {
    if (!active) return 0;
    return computeChemistry(messages, active.user_a, active.user_b, chemWeights);
  }, [messages, active, chemWeights]);

  // Animated chemistry bar
  useEffect(() => {
    if (animatedChem === chemistry) return;
    const start = animatedChem;
    const end = chemistry;
    const duration = 600;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedChem(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [chemistry]);

  const canRequestReveal = chemistry >= 60;

  const openConv = (c: Conv) => {
    setActive(c);
    setParams({ match: c.id }, { replace: true });
  };
  const backToList = () => {
    setActive(null);
    const next = new URLSearchParams(params);
    next.delete("match");
    setParams(next, { replace: true });
  };

  return (
    // Lock to available viewport so the chat owns its own scroll, not the page.
    // Mobile: subtract top bar (3.5rem) + bottom nav (~4.25rem). Desktop: full dvh.
    <div
      className="grid md:grid-cols-[320px_1fr] bg-background -mb-20 md:mb-0 h-[calc(100dvh-3.5rem-4.25rem)] md:h-[100dvh]"
    >
      {/* Conversations list — hidden on mobile when a chat is open */}
      <aside
        className={`border-r border-border/60 bg-gradient-soft overflow-y-auto ${
          active ? "hidden md:block" : "block"
        }`}
        // Leave space for mobile bottom nav
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="p-5 border-b border-border/60 sticky top-0 bg-gradient-soft z-10">
          <h1 className="font-display text-2xl">Chats</h1>
        </div>
        {loadingList ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => <ChatRowSkeleton key={i} />)}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground leading-relaxed">
            No conversations yet. <span className="text-foreground">Match with someone</span> to start a real exchange.
          </div>
        ) : (
          <ul className="pb-24 md:pb-0">
            {conversations.map((c, idx) => (
              <li key={c.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-in">
                <button
                  onClick={() => openConv(c)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-border/40 text-left transition-all duration-300 relative ${
                    active?.id === c.id ? "bg-card" : "hover:bg-card/60 active:bg-card"
                  }`}
                >
                  {active?.id === c.id && (
                    <span aria-hidden className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-romance" />
                  )}
                  <div className="h-11 w-11 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                    <EyeOff className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">Tap to open</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Chat panel */}
      <section
        className={`flex-col bg-background relative min-h-0 ${
          active ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Cinematic reveal overlay */}
        {showReveal && (
          <div className="absolute inset-0 z-40 bg-gradient-romance flex items-center justify-center animate-fade-in">
            <div className="text-center text-primary-foreground animate-fade-up">
              <Sparkles className="h-10 w-10 mx-auto mb-4" />
              <p className="font-display text-4xl">Unveiled.</p>
              <p className="text-sm opacity-80 mt-2">You both chose to share.</p>
            </div>
          </div>
        )}

        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-romance flex items-center justify-center mb-5 shadow-soft">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl mb-1">Pick a conversation</p>
            <p className="text-sm text-muted-foreground max-w-xs">Real connection starts with a thoughtful first line.</p>
          </div>
        ) : (
          <>
            <header className="p-4 border-b border-border/60 space-y-3 shrink-0 bg-background">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9 shrink-0 -ml-1"
                    onClick={backToList}
                    aria-label="Back to chats"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center overflow-hidden shrink-0">
                    {fullyRevealed && revealedPhotos[0]
                      ? <img src={revealedPhotos[0].url} alt={active.name ?? ""} className="w-full h-full object-cover" />
                      : <EyeOff className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{active.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {fullyRevealed ? "Photos revealed" : myConsent ? "Waiting on them to unveil" : "Photos hidden"}
                    </div>
                  </div>
                </div>
                {!fullyRevealed && (
                  <Button
                    variant={canRequestReveal ? "hero" : "soft"}
                    size="sm"
                    className="rounded-full shrink-0"
                    onClick={requestReveal}
                    disabled={myConsent || !canRequestReveal}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {myConsent ? "Unveil sent" : canRequestReveal ? "Unveil Now" : "Unveil locked"}
                    </span>
                    <span className="sm:hidden">
                      {myConsent ? "Sent" : canRequestReveal ? "Unveil" : "Locked"}
                    </span>
                  </Button>
                )}
              </div>

              {/* Chemistry meter */}
              {!fullyRevealed && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground uppercase tracking-widest">Chemistry meter</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {animatedChem}% · {chemistryLabel(animatedChem)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-romance"
                      style={{ width: `${animatedChem}%`, transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
                    />
                  </div>
                  {!canRequestReveal && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Unveil unlocks at 60%. Keep the conversation flowing — both of you.
                    </p>
                  )}
                </div>
              )}
            </header>

            {fullyRevealed && revealedPhotos.length > 0 && (
              <div className="px-6 py-3 border-b border-border/60 flex gap-2 overflow-x-auto bg-secondary/30 shrink-0">
                {revealedPhotos.map((p, i) => (
                  <img key={i} src={p.url} alt="" className="h-20 w-16 object-cover rounded-xl shrink-0" />
                ))}
              </div>
            )}

            {/* Scrollable messages area */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-3"
              style={{ WebkitOverflowScrolling: "touch" as any }}
            >
              {loadingThread ? (
                <div className="flex justify-center pt-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground pt-10">Say hi. The first message sets the tone.</div>
              ) : messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"} animate-fade-up`}>
                  <div className={`max-w-[78%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    m.sender_id === user?.id
                      ? "bg-gradient-romance text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky input bar — stays visible above mobile bottom nav and keyboard */}
            <form
              onSubmit={send}
              className="shrink-0 p-3 md:p-4 border-t border-border/60 flex gap-2 bg-background"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write something thoughtful…"
                className="h-11 md:h-12 rounded-full px-4 md:px-5 text-base"
                enterKeyHint="send"
              />
              <Button
                type="submit"
                variant="hero"
                size="icon"
                className="h-11 w-11 md:h-12 md:w-12 rounded-full shrink-0"
                disabled={!input.trim() || sending}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Chats;

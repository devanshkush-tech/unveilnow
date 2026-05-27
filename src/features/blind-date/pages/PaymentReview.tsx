import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, Clock, MessageCircle, RefreshCw, ShieldCheck, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useBdProfile } from "../hooks/useBdProfile";
import { WHATSAPP_URL } from "@/lib/payment";

type Sub = { plan: string; amount_label: string | null; status: string; created_at: string };

export default function BlindDatePaymentReview() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, refresh: refreshBd } = useBdProfile();
  const [latest, setLatest] = useState<Sub | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [showApproved, setShowApproved] = useState(false);

  useEffect(() => { document.title = "Blind Date — Payment under review"; }, []);

  const fetchLatest = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("payment_submissions")
      .select("plan, amount_label, status, created_at")
      .eq("user_id", user.id)
      .eq("feature", "blind_date")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatest(data as Sub | null);
    setHydrating(false);
  }, [user]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchLatest(), refreshBd()]);
  }, [fetchLatest, refreshBd]);

  // Initial load + realtime + polling fallback.
  useEffect(() => {
    if (authLoading || !user) return;
    fetchLatest();
    const subCh = supabase
      .channel(`bd-pay-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_submissions", filter: `user_id=eq.${user.id}` },
        () => refreshAll()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blind_date_profiles", filter: `user_id=eq.${user.id}` },
        () => refreshAll()
      )
      .subscribe();
    const t = setInterval(refreshAll, 15000);
    return () => { supabase.removeChannel(subCh); clearInterval(t); };
  }, [user, authLoading, fetchLatest, refreshAll]);

  // When profile becomes paid → show the approval popup.
  useEffect(() => {
    if (profile?.paid && !profile?.extended_completed) setShowApproved(true);
  }, [profile?.paid, profile?.extended_completed]);

  if (authLoading || hydrating) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!user) return <Navigate to="/login?next=/blind-date/payment/review" replace />;

  const status = latest?.status ?? "pending";
  const isRejected = status === "rejected";
  const isApproved = !!profile?.paid;

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-3xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil · Blind Date</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12 md:py-20">
        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-8 md:p-12 text-center animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-romance flex items-center justify-center mb-6 animate-float">
            {isApproved ? <Sparkles className="h-7 w-7 text-primary-foreground" /> : <Clock className="h-7 w-7 text-primary-foreground" />}
          </div>

          {isApproved ? (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-3">You're in! ✨</h1>
              <p className="text-muted-foreground mb-2">Your Blind Date access is active. Answer a few more questions for better matches.</p>
            </>
          ) : isRejected ? (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-3">Payment not verified</h1>
              <p className="text-muted-foreground mb-2">We couldn't confirm your payment. Please re-send your screenshot or pay again.</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-3">Payment under review ⏳</h1>
              <p className="text-muted-foreground mb-2">We are verifying your Blind Date payment. This usually takes a few minutes to a few hours.</p>
              <p className="text-muted-foreground">This page updates the moment your access is approved.</p>
            </>
          )}

          {latest && (
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
              <div className="rounded-2xl bg-secondary/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</div>
                <div className="font-display text-base capitalize">{latest.plan.replace("bd_", "")}</div>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount</div>
                <div className="font-display text-base">{latest.amount_label ?? "—"}</div>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            {isApproved ? (
              <Button variant="hero" className="w-full rounded-full sm:col-span-2 h-12" onClick={() => navigate("/blind-date/onboarding")}>
                <Sparkles className="h-4 w-4" /> Continue setup
              </Button>
            ) : (
              <>
                <Button variant="hero" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2" onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener")}>
                  <MessageCircle className="h-4 w-4" /> Re-send on WhatsApp
                </Button>
                <Button variant="soft" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2" onClick={refreshAll}>
                  <RefreshCw className="h-4 w-4" /> Check status
                </Button>
                {isRejected && (
                  <Button variant="outline" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2 sm:col-span-2" onClick={() => navigate("/blind-date/payment")}>
                    Choose another plan
                  </Button>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-8 inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Manual review for your safety
          </p>
          <div className="mt-4">
            <Link to="/blind-date" className="text-xs text-muted-foreground underline underline-offset-4">Back to Blind Date</Link>
          </div>
        </div>
      </main>

      <Dialog open={showApproved} onOpenChange={setShowApproved}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-romance flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-2xl text-center">Payment approved 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Welcome to Blind Date. Answer a few more questions so we can find your best match — then matching begins right away.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="hero" className="w-full rounded-full h-12" onClick={() => navigate("/blind-date/onboarding")}>
              <Sparkles className="h-4 w-4" /> Answer a few more questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

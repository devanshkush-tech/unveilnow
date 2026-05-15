import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, MessageCircle, ArrowRight, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UPI_ID, WHATSAPP_URL } from "@/lib/payment";
import { UNLOCK_INTEREST_PRICE_INR, UNLOCK_INTEREST_PRICE_LABEL } from "@/lib/plans";
import upiQr from "@/assets/upi-qr.jpeg";

const UnlockInterest = () => {
  const { fromUserId } = useParams<{ fromUserId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [targetName, setTargetName] = useState<string>("");

  useEffect(() => { document.title = "Unlock Interest · Unveil"; }, []);

  useEffect(() => {
    if (!user || !fromUserId) return;
    let cancelled = false;
    (async () => {
      const [{ data: unlock }, { data: prof }] = await Promise.all([
        supabase.from("interest_unlocks").select("id").eq("user_id", user.id).eq("target_user_id", fromUserId).maybeSingle(),
        supabase.from("profiles").select("first_name, age, city").eq("id", fromUserId).maybeSingle(),
      ]);
      if (cancelled) return;
      if (unlock) setUnlocked(true);
      if (prof?.first_name) setTargetName(`${prof.first_name}${prof.age ? `, ${prof.age}` : ""}${prof.city ? ` · ${prof.city}` : ""}`);
      setHydrating(false);
    })();
    return () => { cancelled = true; };
  }, [user, fromUserId]);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied"); }
    catch { toast.error("Couldn't copy"); }
  };

  const proceed = async () => {
    if (!user || !fromUserId) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number for tracking.");
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan: "unlock_interest",
        feature: "unlock_interest",
        target_user_id: fromUserId,
        amount_label: UNLOCK_INTEREST_PRICE_LABEL,
        phone: phone.trim(),
        whatsapp_sent_at: new Date().toISOString(),
        status: "pending",
      });
      window.open(WHATSAPP_URL, "_blank", "noopener");
      toast.success("Submitted — we'll unlock once payment is approved.");
      navigate("/notifications", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || hydrating) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (unlocked) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="container max-w-md py-16 text-center space-y-6">
          <div className="inline-flex h-14 w-14 rounded-full bg-primary/10 items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl">You've already unlocked this profile.</h1>
          <p className="text-muted-foreground text-sm">{targetName || "Open your matches to start a conversation."}</p>
          <Button asChild className="rounded-full"><a href="/dashboard/matches">View matches</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <main className="container max-w-3xl py-10 md:py-14 space-y-8">
        <section className="text-center max-w-xl mx-auto">
          <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-2">Unlock Interest</p>
          <h1 className="font-display text-3xl md:text-4xl leading-tight">Someone showed interest in your profile.</h1>
          <p className="text-muted-foreground mt-3">
            Pay {UNLOCK_INTEREST_PRICE_LABEL} once to reveal who they are and start a conversation. This is a one-time unlock — separate from your subscription.
          </p>
        </section>

        <section className="rounded-3xl bg-card border border-border/60 shadow-card p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 1</p>
              <h2 className="font-display text-2xl">Pay {UNLOCK_INTEREST_PRICE_LABEL} via any UPI app.</h2>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">UPI ID</div>
                <div className="font-mono text-sm truncate">{UPI_ID}</div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full shrink-0" onClick={copyUpi}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Your WhatsApp number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxxxxx" className="h-11 rounded-xl" inputMode="tel" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 2</p>
              <h2 className="font-display text-xl">Send screenshot on WhatsApp.</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll unlock the profile within minutes.</p>
            </div>
            <Button variant="hero" size="lg" className="w-full h-12 rounded-full" onClick={proceed} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : (
                <><MessageCircle className="h-4 w-4" /> Send screenshot on WhatsApp <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="rounded-3xl bg-background border border-border/60 p-3 md:p-4 shadow-soft">
              <img src={upiQr} alt="Scan to pay" className="w-full max-w-[260px] h-auto rounded-2xl" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Scan with any UPI app · {UNLOCK_INTEREST_PRICE_LABEL}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UnlockInterest;

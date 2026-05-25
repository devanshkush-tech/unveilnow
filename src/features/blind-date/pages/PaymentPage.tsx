import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, ArrowRight, Copy, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UPI_ID, WHATSAPP_URL } from "@/lib/payment";
import { BD_PLANS, BlindDatePlanId, bdPlan } from "../lib/plans";
import upiQr from "@/assets/upi-qr.jpeg";
import { trackMetaEvent } from "@/lib/metaCapi";

export default function BlindDatePayment() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initial = (params.get("plan") as BlindDatePlanId) || "premium";
  const validInitial: BlindDatePlanId = BD_PLANS.find((p) => p.id === initial) ? initial : "premium";
  const [plan, setPlan] = useState<BlindDatePlanId>(validInitial);
  const [phone, setPhone] = useState("");
  const [hydrating, setHydrating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const reason = params.get("reason");

  useEffect(() => { document.title = "Blind Date — Choose your plan"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setHydrating(false); return; }
    (async () => {
      const { data: rows } = await supabase.rpc("get_my_profile");
      const data = Array.isArray(rows) ? rows[0] ?? null : null;
      if (data?.phone) setPhone(data.phone);
      setHydrating(false);
    })();
  }, [user, authLoading]);

  const selected = useMemo(() => bdPlan(plan), [plan]);
  const priceInr = selected.priceInr;
  const priceLabel = selected.priceLabel;

  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied"); }
    catch { toast.error("Couldn't copy"); }
  };

  const submit = async () => {
    if (!user) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number for tracking."); return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan: `bd_${plan}`,
        feature: "blind_date",
        amount_label: priceLabel,
        phone: phone.trim(),
        whatsapp_sent_at: new Date().toISOString(),
        status: "pending",
      });
      if (error) throw error;

      // Privacy: send only generic content_ids/value (no questionnaire data)
      void trackMetaEvent("InitiateCheckout", {
        event_id: `bd_checkout_${user.id}_${Date.now()}`,
        phone: phone.trim(),
        custom_data: { currency: "INR", value: priceInr, content_ids: [`bd_${plan}`], content_type: "subscription", content_name: selected.name },
      });

      window.open(WHATSAPP_URL, "_blank", "noopener");
      nav("/blind-date/payment/review", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't submit. Try again.");
    } finally { setSubmitting(false); }
  };

  if (authLoading || hydrating) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login?next=/blind-date/payment" replace />;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-4xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil · Blind Date</span>
          </div>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure manual review</span>
        </div>
      </header>

      <main className="container max-w-4xl py-10 md:py-14 space-y-10">
        <section className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">Activate Blind Date</p>
          <h1 className="font-display text-3xl md:text-5xl leading-tight">Pick your Blind Date plan.</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
            We keep Blind Date exclusive and serious by charging a small access fee. Quality over endless swiping.
          </p>
          {reason === "out" && (
            <p className="text-sm mt-4 inline-block rounded-full px-3 py-1 bg-accent/15 border border-accent/30">
              You've used all your chats — pick a plan to keep going.
            </p>
          )}
        </section>

        <section className="grid md:grid-cols-3 gap-4 md:gap-5">
          {BD_PLANS.map((p) => {
            const active = p.id === plan;
            const youPay = p.priceLabel;
            return (
              <button key={p.id} onClick={() => setPlan(p.id)}
                className={`text-left p-5 md:p-6 rounded-3xl border transition-all flex flex-col ${
                  active ? "bg-gradient-romance text-primary-foreground border-transparent shadow-elegant md:scale-[1.02]"
                         : "bg-card border-border/60 shadow-card hover:border-accent/60"
                }`}>
                <div className="text-[11px] uppercase tracking-widest opacity-70 mb-1">{p.highlight ? "Popular" : "Plan"}</div>
                <div className="font-display text-2xl mb-2">{p.name}</div>
                <div className="font-display text-3xl mb-4">{youPay}</div>
                <ul className="space-y-2 text-sm flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-primary-foreground" : "text-accent"}`} />
                      <span className={active ? "" : "text-muted-foreground"}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 text-xs font-medium ${active ? "opacity-90" : "text-muted-foreground"}`}>{active ? "Selected" : "Tap to choose"}</div>
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl bg-card border border-border/60 shadow-card p-6 md:p-10 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 1</p>
              <h2 className="font-display text-2xl md:text-3xl">Pay {priceLabel} via any UPI app.</h2>
              <p className="text-sm text-muted-foreground mt-2">Scan the QR or pay to the UPI ID below.</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">UPI ID</div>
                <div className="font-mono text-sm truncate">{UPI_ID}</div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full shrink-0" onClick={copyUpi}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Your WhatsApp number (for tracking)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxxxxx" className="h-11 rounded-xl" inputMode="tel" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 2</p>
              <h2 className="font-display text-xl md:text-2xl">Send your screenshot on WhatsApp.</h2>
              <p className="text-sm text-muted-foreground mt-2">Our team verifies and activates Blind Date for you within a few hours.</p>
            </div>
            <Button variant="hero" size="lg" className="w-full h-12 rounded-full" onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : (
                <><MessageCircle className="h-4 w-4" /> Send screenshot on WhatsApp <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="rounded-3xl bg-background border border-border/60 p-3 md:p-4 shadow-soft">
              <img src={upiQr} alt="Scan to pay with any UPI app" className="w-full max-w-[280px] h-auto rounded-2xl" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Scan to pay with any UPI app</p>
          </div>
        </section>
      </main>
    </div>
  );
}

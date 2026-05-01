import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, ArrowRight, Copy, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PAYMENT_PLANS, PaymentPlanId, UPI_ID, WHATSAPP_URL } from "@/lib/payment";
import { trackMetaEvent } from "@/lib/metaCapi";
import upiQr from "@/assets/upi-qr.jpeg";

type Profile = {
  id: string;
  selected_plan: string | null;
  payment_status: string;
  account_status: string;
  phone: string | null;
};

const Payment = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<PaymentPlanId>("premium");

  useEffect(() => {
    document.title = "Choose your plan · Unveil";
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, selected_plan, payment_status, account_status, phone")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error("[payment] profile fetch error", error);
          toast.error("Couldn't load your profile. Please refresh.");
          setHydrating(false);
          return;
        }
        if (!data) { navigate("/onboarding", { replace: true }); return; }
        // Already approved → straight to dashboard
        if (data.account_status === "active") { navigate("/dashboard", { replace: true }); return; }
        if (data.payment_status === "pending") { navigate("/payment/review", { replace: true }); return; }
        setProfile(data as any);
        const initialPlan = (data.selected_plan as PaymentPlanId) || "premium";
        if (data.selected_plan) setPlan(data.selected_plan as PaymentPlanId);
        if (data.phone) setPhone(data.phone);
        setHydrating(false);
        // Fire InitiateCheckout — fully isolated, never breaks UX
        try {
          const planMeta = PAYMENT_PLANS.find((p) => p.id === initialPlan);
          const value = parseInt((planMeta?.price ?? "0").replace(/\D/g, ""), 10) || 0;
          void trackMetaEvent("InitiateCheckout", {
            event_id: `checkout_${user.id}`,
            phone: data.phone,
            custom_data: {
              currency: "INR",
              value,
              content_name: planMeta?.name ?? initialPlan,
              content_ids: [initialPlan],
              content_type: "subscription",
            },
          });
        } catch (e) {
          console.warn("[payment] tracking failed (ignored)", e);
        }
      } catch (e) {
        console.error("[payment] hydrate failed", e);
        if (!cancelled) {
          toast.error("Something went wrong. Please refresh.");
          setHydrating(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate]);

  const selected = useMemo(() => PAYMENT_PLANS.find((p) => p.id === plan)!, [plan]);

  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied"); }
    catch { toast.error("Couldn't copy"); }
  };

  const proceedToWhatsapp = async () => {
    if (!user) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number for tracking.");
      return;
    }
    setSubmitting(true);
    try {
      // Save plan + phone on profile
      await supabase.from("profiles").update({
        selected_plan: plan,
        phone: phone.trim(),
        payment_status: "pending",
      }).eq("id", user.id);

      // Create a payment submission row
      await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan,
        amount_label: selected.price,
        phone: phone.trim(),
        whatsapp_sent_at: new Date().toISOString(),
        status: "pending",
      });

      window.open(WHATSAPP_URL, "_blank", "noopener");
      navigate("/payment/review", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || hydrating) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-4xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil</span>
          </div>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure manual review</span>
        </div>
      </header>

      <main className="container max-w-4xl py-10 md:py-14 space-y-10">
        <section className="text-center max-w-2xl mx-auto animate-fade-up">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">One last step</p>
          <h1 className="font-display text-3xl md:text-5xl leading-tight">Activate your Unveil membership.</h1>
          <p className="text-muted-foreground mt-3">Likes are always unlimited. Pick a plan that matches how many <em>matches</em> you want each month.</p>
        </section>

        {/* Plan picker */}
        <section className="grid md:grid-cols-3 gap-4 md:gap-5">
          {PAYMENT_PLANS.map((p) => {
            const active = p.id === plan;
            return (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`text-left p-5 md:p-6 rounded-3xl border transition-all flex flex-col ${
                  active
                    ? "bg-gradient-romance text-primary-foreground border-transparent shadow-elegant md:scale-[1.02]"
                    : "bg-card border-border/60 shadow-card hover:border-accent/60"
                }`}
              >
                <div className="text-[11px] uppercase tracking-widest opacity-70 mb-1">{p.tag}</div>
                <div className="font-display text-2xl mb-2">{p.name}</div>
                <div className="font-display text-3xl mb-4">{p.price}<span className="text-sm opacity-70">/month</span></div>
                <ul className="space-y-2 text-sm flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-primary-foreground" : "text-accent"}`} />
                      <span className={active ? "" : "text-muted-foreground"}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 text-xs font-medium ${active ? "opacity-90" : "text-muted-foreground"}`}>
                  {active ? "Selected" : "Tap to choose"}
                </div>
              </button>
            );
          })}
        </section>

        {/* Pay via UPI */}
        <section className="rounded-3xl bg-card border border-border/60 shadow-card p-6 md:p-10 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 1</p>
              <h2 className="font-display text-2xl md:text-3xl">Pay {selected.price} via any UPI app.</h2>
              <p className="text-sm text-muted-foreground mt-2">Scan the QR or pay to the UPI ID below.</p>
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
              <Label htmlFor="phone">Your WhatsApp number (for tracking)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98xxxxxx"
                className="h-11 rounded-xl"
                inputMode="tel"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Step 2</p>
              <h2 className="font-display text-xl md:text-2xl">Send your payment screenshot on WhatsApp.</h2>
              <p className="text-sm text-muted-foreground mt-2">Our team verifies within a few minutes to a few hours.</p>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full h-12 rounded-full"
              onClick={proceedToWhatsapp}
              disabled={submitting}
            >
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
};

export default Payment;

import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Copy, Loader2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeAccess } from "@/hooks/useIsFreeAccess";
import { UPI_ID, WHATSAPP_URL } from "@/lib/payment";
import { SPOTLIGHT_OFFERS } from "@/lib/spotlight";
import upiQr from "@/assets/upi-qr.jpeg";

export default function Spotlight() {
  const { user, loading: authLoading } = useAuth();
  const { isFree, loading: freeLoading } = useIsFreeAccess();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState(SPOTLIGHT_OFFERS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = "Spotlight · Unveil"; }, []);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid WhatsApp number.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan: selected.plan,
        feature: "spotlight",
        amount_label: selected.priceLabel,
        phone: phone.trim(),
        whatsapp_sent_at: new Date().toISOString(),
        status: "pending",
      });
      if (error) throw error;
      window.open(WHATSAPP_URL, "_blank", "noopener");
      toast.success("Submitted. Spotlight will start after payment approval.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || freeLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isFree) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container flex h-16 max-w-4xl items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back to dashboard</Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Manual payment review</span>
        </div>
      </header>
      <main className="container max-w-4xl space-y-8 py-10 md:py-14">
        <section className="mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">A little more visibility</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Put your profile in the Spotlight.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Reach more compatible members with a short profile boost. Your Spotlight starts once our team approves your payment.</p>
        </section>

        <section className="grid gap-3 md:grid-cols-3" aria-label="Spotlight duration">
          {SPOTLIGHT_OFFERS.map((offer) => {
            const isSelected = selected.plan === offer.plan;
            return (
              <Button
                key={offer.plan}
                type="button"
                variant={isSelected ? "hero" : "outline"}
                onClick={() => setSelected(offer)}
                className="h-auto min-h-24 flex-col items-start justify-center gap-1 px-5 py-4 text-left"
                aria-pressed={isSelected}
              >
                <span className="flex w-full items-center justify-between font-display text-xl">{offer.durationDays} {offer.durationDays === 1 ? "day" : "days"}{isSelected && <Check className="h-4 w-4" />}</span>
                <span className="text-sm opacity-80">{offer.priceLabel}</span>
              </Button>
            );
          })}
        </section>

        <section className="grid items-center gap-8 border-y border-border/60 py-8 md:grid-cols-2 md:gap-12">
          <div className="order-2 space-y-5 md:order-1">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Step 1</p>
              <h2 className="font-display text-2xl">Pay {selected.priceLabel} via UPI.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Scan the QR code or copy the UPI ID below.</p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 p-4">
              <div className="min-w-0"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">UPI ID</div><div className="truncate font-mono text-sm">{UPI_ID}</div></div>
              <Button variant="outline" size="sm" onClick={copyUpi}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotlight-phone">Your WhatsApp number</Label>
              <Input id="spotlight-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98xxxxxx" inputMode="tel" />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Step 2</p>
              <h2 className="font-display text-xl">Send your payment screenshot.</h2>
              <p className="mt-1 text-sm text-muted-foreground">Our team verifies payment before your Spotlight begins.</p>
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><MessageCircle className="h-4 w-4" /> Continue on WhatsApp <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>
          <div className="order-1 flex flex-col items-center md:order-2">
            <div className="rounded-xl border border-border/60 bg-card p-3"><img src={upiQr} alt="Scan to pay with any UPI app" className="h-auto w-full max-w-[280px]" /></div>
            <p className="mt-3 text-xs text-muted-foreground">Scan to pay · {selected.priceLabel}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
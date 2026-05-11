import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, MessageCircle, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { WHATSAPP_URL, planLabel, planPrice } from "@/lib/payment";

const PaymentReview = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [plan, setPlan] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => { document.title = "Payment under review · Unveil"; }, []);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("payment_status, account_status, selected_plan")
      .eq("id", user.id)
      .maybeSingle();
    if (!data) return;
    setPlan(data.selected_plan);
    if (data.account_status === "active") {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (data.payment_status === "rejected") {
      setStatus("rejected");
    } else if (data.payment_status === "none") {
      navigate("/payment", { replace: true });
    } else {
      setStatus("pending");
    }
    setHydrating(false);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { setHydrating(false); navigate("/login", { replace: true }); return; }
    refresh();
    // Realtime: listen for profile changes (e.g. admin approves)
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe();
    const t = setInterval(refresh, 20000); // poll fallback
    return () => { supabase.removeChannel(channel); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading || hydrating) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="container max-w-3xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12 md:py-20">
        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-8 md:p-12 text-center animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-romance flex items-center justify-center mb-6 animate-float">
            <Clock className="h-7 w-7 text-primary-foreground" />
          </div>

          {status === "rejected" ? (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-3">Payment not verified</h1>
              <p className="text-muted-foreground mb-2">We couldn't confirm your payment. Please re-send your screenshot or pay again.</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-3">Payment under review ⏳</h1>
              <p className="text-muted-foreground mb-2">
                We are verifying your payment. This usually takes a few minutes to a few hours.
              </p>
              <p className="text-muted-foreground">You'll get access as soon as it's approved.</p>
            </>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="rounded-2xl bg-secondary/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</div>
              <div className="font-display text-base">{planLabel(plan)}</div>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount</div>
              <div className="font-display text-base">{planPrice(plan)}</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <Button variant="hero" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2" onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener")}>
              <MessageCircle className="h-4 w-4" /> Re-send on WhatsApp
            </Button>
            <Button variant="soft" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2" onClick={refresh}>
              <RefreshCw className="h-4 w-4" /> Check status
            </Button>
            <Button variant="outline" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2 sm:col-span-2" onClick={() => navigate("/payment?revisit=1")}>
              Missed QR / UPI ID? Go back
            </Button>
            {status === "rejected" && (
              <Button variant="outline" className="w-full rounded-full whitespace-normal h-auto min-h-11 py-2 sm:col-span-2" onClick={() => navigate("/payment?revisit=1")}>Choose another plan</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentReview;

import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, ShieldCheck, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Sub = { plan: string; amount_label: string | null; status: string; created_at: string };

export default function BlindDatePaymentReview() {
  const { user, loading } = useAuth();
  const [latest, setLatest] = useState<Sub | null>(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
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
    })();
  }, [user, loading]);

  if (loading || hydrating) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-3xl bg-card border border-border/60 shadow-card p-8 text-center">
        <Clock className="h-10 w-10 mx-auto text-accent" />
        <h1 className="font-display text-3xl mt-4">Payment under review</h1>
        <p className="text-muted-foreground mt-2">
          We received your Blind Date payment. Our team will verify it within a few hours and activate your access.
        </p>
        {latest && (
          <div className="mt-6 rounded-2xl bg-secondary/60 p-4 text-left">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Plan</div>
            <div className="font-medium">{latest.plan} · {latest.amount_label}</div>
            <div className="text-xs text-muted-foreground mt-2">Status: {latest.status}</div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-6 inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Manual review for your safety
        </p>
        <div className="mt-6">
          <Link to="/blind-date" className="text-sm underline">Back to Blind Date</Link>
        </div>
      </div>
    </div>
  );
}

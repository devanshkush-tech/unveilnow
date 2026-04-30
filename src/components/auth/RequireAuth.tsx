import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Gate = {
  onboarded: boolean;
  account_status: string;
  payment_status: string;
};

export const RequireAuth = ({
  children,
  requireOnboarded = true,
  requireActive = true,
}: {
  children: ReactNode;
  requireOnboarded?: boolean;
  requireActive?: boolean;
}) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [gate, setGate] = useState<Gate | null>(null);

  useEffect(() => {
    if (!session?.user) { setChecking(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded, account_status, payment_status")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setGate({
          onboarded: !!data?.onboarded,
          account_status: data?.account_status ?? "locked",
          payment_status: data?.payment_status ?? "none",
        });
        setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireOnboarded && gate && !gate.onboarded) return <Navigate to="/onboarding" replace />;

  if (requireActive && gate && gate.account_status !== "active") {
    // Locked: route them to the right place
    if (gate.payment_status === "pending") return <Navigate to="/payment/review" replace />;
    return <Navigate to="/payment" replace />;
  }

  return <>{children}</>;
};

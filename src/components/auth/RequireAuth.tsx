import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Gate = {
  onboarded: boolean;
  account_status: string;
  payment_status: string;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

  // Refetch gate on user change AND on route change so the guard
  // never serves a stale `onboarded`/`payment_status` snapshot after
  // onboarding/payment mutations.
  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      setGate(null);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarded, account_status, payment_status")
          .eq("id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("[RequireAuth] gate fetch error", error);
        }

        setGate({
          onboarded: !!data?.onboarded,
          account_status: data?.account_status ?? "locked",
          payment_status: data?.payment_status ?? "none",
        });
      } catch (err) {
        if (!cancelled) {
          console.error("[RequireAuth] gate fetch threw", err);
          setGate({ onboarded: false, account_status: "locked", payment_status: "none" });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, loading, location.pathname]);

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
    if (gate.payment_status === "pending") return <Navigate to="/payment/review" replace />;
    return <Navigate to="/payment" replace />;
  }

  return <>{children}</>;
};

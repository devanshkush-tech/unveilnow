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
  const lastGateRef = useRef<Gate | null>(null);

  // Refetch gate on user change AND on route change so the guard
  // never serves a stale `onboarded`/`payment_status` snapshot after
  // onboarding/payment mutations.
  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      setGate(null);
      lastGateRef.current = null;
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    const fetchGate = async () => {
      return await supabase
        .from("profiles")
        .select("onboarded, account_status, payment_status")
        .eq("id", session.user.id)
        .maybeSingle();
    };

    (async () => {
      try {
        let { data, error } = await fetchGate();

        // One retry on transient error / null payload (token refresh races,
        // brief network blips). Without this, RequireAuth bounces a fresh
        // /payment navigation back to /onboarding on a single bad fetch.
        if (error || !data) {
          console.warn("[RequireAuth] gate fetch failed, retrying", {
            path: location.pathname,
            error,
          });
          await sleep(400);
          if (cancelled) return;
          ({ data, error } = await fetchGate());
        }

        if (cancelled) return;

        if (error || !data) {
          console.error("[RequireAuth] gate fetch failed after retry", {
            path: location.pathname,
            error,
          });
          // Don't blindly assume onboarded=false — keep the previous gate
          // value if we have one so a transient failure doesn't bounce a
          // valid user out of /payment.
          if (lastGateRef.current) {
            setGate(lastGateRef.current);
          } else {
            setGate({ onboarded: false, account_status: "locked", payment_status: "none" });
          }
          return;
        }

        const next: Gate = {
          onboarded: !!data.onboarded,
          account_status: data.account_status ?? "locked",
          payment_status: data.payment_status ?? "none",
        };
        console.info("[RequireAuth] gate", { ...next, path: location.pathname });
        lastGateRef.current = next;
        setGate(next);
      } catch (err) {
        if (!cancelled) {
          console.error("[RequireAuth] gate fetch threw", err);
          if (lastGateRef.current) {
            setGate(lastGateRef.current);
          } else {
            setGate({ onboarded: false, account_status: "locked", payment_status: "none" });
          }
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

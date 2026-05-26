import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useRole";
import { useBdProfile } from "../hooks/useBdProfile";

type Stage = "setup" | "onboarding" | "payment" | "play" | "any";

/**
 * Gates Blind Date routes.
 * New flow: Questions (no auth) → Signup → Payment → Admin approval → Extended onboarding → Matching.
 * Admins always pass.
 */
export function BlindDateGate({
  children,
  require = "play",
}: {
  children: ReactNode;
  require?: Stage;
}) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { profile, loading: bdLoading } = useBdProfile();
  const loc = useLocation();

  // Setup is public — anyone can answer questions before signing up.
  if (require === "setup") {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return <>{children}</>;
  }

  if (authLoading || roleLoading || (user && bdLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/signup?next=${next}`} replace />;
  }

  if (isAdmin) return <>{children}</>;
  if (require === "any") return <>{children}</>;

  // Must have completed the Phase A questionnaire first.
  if (!profile?.completed) {
    if (loc.pathname !== "/blind-date/setup") return <Navigate to="/blind-date/setup" replace />;
    return <>{children}</>;
  }

  // Payment comes BEFORE extended onboarding — gated by admin approval.
  if (!profile?.paid) {
    if (loc.pathname !== "/blind-date/payment" && loc.pathname !== "/blind-date/payment/review")
      return <Navigate to="/blind-date/payment" replace />;
    return <>{children}</>;
  }
  if (require === "payment") return <>{children}</>;

  // After approval, finish the extended onboarding before matching.
  if (!profile?.extended_completed) {
    if (loc.pathname !== "/blind-date/onboarding") return <Navigate to="/blind-date/onboarding" replace />;
    return <>{children}</>;
  }
  if (require === "onboarding") return <>{children}</>;

  if ((profile?.chats_remaining ?? 0) <= 0) {
    if (loc.pathname !== "/blind-date/payment") return <Navigate to="/blind-date/payment?reason=out" replace />;
    return <>{children}</>;
  }

  return <>{children}</>;
}

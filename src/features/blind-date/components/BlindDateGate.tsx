import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useRole";
import { useBdProfile } from "../hooks/useBdProfile";

type Stage = "setup" | "onboarding" | "payment" | "play" | "any";

/**
 * Gates Blind Date routes. New order: auth → Phase A → extended onboarding → payment → credits.
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

  if (authLoading || roleLoading || (user && bdLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (isAdmin) return <>{children}</>;
  if (require === "any") return <>{children}</>;

  // Phase A questionnaire
  if (!profile?.completed) {
    if (loc.pathname !== "/blind-date/setup") return <Navigate to="/blind-date/setup" replace />;
    return <>{children}</>;
  }
  if (require === "setup") return <>{children}</>;

  // Extended onboarding BEFORE payment
  if (!profile?.extended_completed) {
    if (loc.pathname !== "/blind-date/onboarding") return <Navigate to="/blind-date/onboarding" replace />;
    return <>{children}</>;
  }
  if (require === "onboarding") return <>{children}</>;

  // Payment after all questions
  if (!profile?.paid) {
    if (loc.pathname !== "/blind-date/payment") return <Navigate to="/blind-date/payment" replace />;
    return <>{children}</>;
  }
  if (require === "payment") return <>{children}</>;

  if ((profile?.chats_remaining ?? 0) <= 0) {
    if (loc.pathname !== "/blind-date/payment") return <Navigate to="/blind-date/payment?reason=out" replace />;
    return <>{children}</>;
  }

  return <>{children}</>;
}

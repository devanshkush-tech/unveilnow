import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useRole";
import { useBdProfile } from "../hooks/useBdProfile";

type Stage = "setup" | "onboarding" | "play" | "any";

/**
 * Gates Blind Date routes under the unified access model:
 * Signup + core payment now unlocks Blind Date automatically (chat credits
 * are seeded by the sync_core_payment_approval trigger). The gate just
 * routes users through the core signup / payment path if they haven't got
 * chats yet.
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

  // Public phase-A questionnaire — no auth required.
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

  // Optional Phase-B extended questionnaire — allow entry but don't force it.
  if (require === "onboarding") return <>{children}</>;

  // Must have core access (payment approved → chats credited). If not paid, send to unified payment.
  if (!profile?.paid) {
    return <Navigate to="/payment" replace />;
  }
  // Paid but out of chats — send to pricing with a message instead of bouncing through /payment → /dashboard.
  if ((profile?.chats_remaining ?? 0) <= 0) {
    return <OutOfChatsRedirect />;
  }

  return <>{children}</>;
}

function OutOfChatsRedirect() {
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.error("You've used all your Blind Date chats. Upgrade your plan to get more.");
  }, []);
  return <Navigate to="/pricing" replace />;
}

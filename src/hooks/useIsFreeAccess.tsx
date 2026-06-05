import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true when the signed-in user has free access to the platform
 * (currently: anyone whose gender is "Woman"). Such users skip all payment
 * and upgrade UI.
 */
export function useIsFreeAccess() {
  const { user, loading: authLoading } = useAuth();
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) {
      setIsFree(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("gender")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setIsFree(data?.gender === "Woman");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  return { isFree, loading };
}
